#!/usr/bin/env node
// ============================================================================
// derive-page-surfaces.mjs
// ============================================================================
// Gives every shipped theme a hero and a band surface WITHOUT hand-picking a
// colour per theme, by deriving both from tokens the theme already declares.
//
// WHY THIS RUNS IN NODE AND NOT IN SCSS
// The obvious place is the SCSS generator, emitting
// `color-mix(in oklch, var(--surface-default), var(--brand-primary) 6%)`.
// Two things rule that out:
//
//   1. SCSS cannot see the values. Every theme declares its palette as CSS
//      custom properties and layers semantic aliases on top
//      (`--surface-default: var(--paper)`), so at Sass compile time there is
//      no colour to mix — only a var() chain.
//   2. The contrast auditor cannot read the result. scripts/theme-a11y.js
//      throws UnsupportedColor on `color-mix`, `oklch` and friends, so a
//      derived hero expressed that way would be SKIPPED by the audit rather
//      than graded. A page surface that cannot be contrast-checked is exactly
//      the thing this project refuses to ship.
//
// So the derivation happens here, after each theme is compiled, using the
// auditor's own resolver. The value that lands in theme.css is a literal
// `light-dark(#rrggbb, #rrggbb)`, which means the number the audit grades is
// the number the browser paints.
//
// THE DERIVATION
//   hero bg  = the theme's page surface, nudged HERO_TINT toward its brand
//   band bg  = the same, at the smaller BAND_TINT
//   ink      = the theme's own --text-primary, unchanged
//
// The tint is deliberately small. --text-primary on --surface-default is
// already audited and passing in all 24 themes; moving the background a few
// percent toward the brand keeps that contrast essentially where it was, so
// the new pairs start clear of the warning band instead of being two
// independent guesses. Bigger tints are a design decision a theme makes by
// overriding the token, not something this script should impose.
//
// A theme that declares its own --page-hero-* keeps it: the derived block is
// written only for tokens the theme has not already set.
//
// Usage: node scripts/derive-page-surfaces.mjs [theme-name]
// ============================================================================
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const THEMES = resolve(ROOT, 'public/themes');
const a11y = require(resolve(__dirname, 'theme-a11y.js'));

// How far each surface moves from the page background toward the brand accent.
const HERO_TINT = 0.06;
const BAND_TINT = 0.035;

const DERIVED_MARKER = '/* page surfaces — derived, see scripts/derive-page-surfaces.mjs */';

const hex = ({ r, g, b }) =>
  '#' + [r, g, b].map((n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')).join('');

/** Straight sRGB interpolation. Small tints, so a perceptual space buys nothing
 *  and would cost the auditability this whole approach exists to protect. */
const mix = (a, b, amount) => ({
  r: a.r + (b.r - a.r) * amount,
  g: a.g + (b.g - a.g) * amount,
  b: a.b + (b.b - a.b) * amount,
});

/** Resolve one token to rgba for one scheme, or null if it cannot be read. */
function resolve1(token, values, globals, scheme) {
  try {
    const r = a11y.resolveColor(token, values, globals, scheme);
    return r && r.rgba && !r.error ? r.rgba : null;
  } catch {
    return null;
  }
}

/** The `:root, :root[data-theme="x"] { … }` block a shipped theme emits. */
function themeBlock(css) {
  const i = css.indexOf('{');
  const j = css.lastIndexOf('}');
  return i === -1 || j === -1 ? null : css.slice(i + 1, j);
}

export function deriveForCss(css) {
  const block = themeBlock(css);
  if (!block) return null;

  const values = a11y.extractTokenValuesFromBlock(block);
  const globals = values;

  // Already hand-set? Leave the theme alone.
  if (values.has('--page-hero-bg') || values.has('--page-band-bg')) return null;

  const out = {};
  for (const scheme of ['light', 'dark']) {
    const surface =
      resolve1('--surface-default', values, globals, scheme) ??
      resolve1('--paper', values, globals, scheme);
    const brand =
      resolve1('--brand-primary', values, globals, scheme) ??
      resolve1('--action-primary-default', values, globals, scheme) ??
      resolve1('--ai', values, globals, scheme);
    const ink =
      resolve1('--text-primary', values, globals, scheme) ??
      resolve1('--ink', values, globals, scheme);

    if (!surface || !brand || !ink) return null;
    out[scheme] = {
      hero: hex(mix(surface, brand, HERO_TINT)),
      band: hex(mix(surface, brand, BAND_TINT)),
      ink: hex(ink),
    };
  }

  const ld = (l, d) => (l === d ? l : `light-dark(${l}, ${d})`);
  return {
    '--page-hero-bg': ld(out.light.hero, out.dark.hero),
    '--page-hero-ink': ld(out.light.ink, out.dark.ink),
    '--page-band-bg': ld(out.light.band, out.dark.band),
    '--page-band-ink': ld(out.light.ink, out.dark.ink),
  };
}

/** Insert (or replace) the derived block just before the theme block's close. */
export function applyToCss(css, derived) {
  const stripped = css.replace(
    new RegExp(`\\n*\\s*${DERIVED_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n\\})`, 'g'),
    '',
  );
  const j = stripped.lastIndexOf('}');
  if (j === -1) return css;
  const lines = Object.entries(derived).map(([k, v]) => `  ${k}: ${v};`);
  return `${stripped.slice(0, j)}\n  ${DERIVED_MARKER}\n${lines.join('\n')}\n${stripped.slice(j)}`;
}

function main() {
  const only = process.argv[2];
  if (!existsSync(THEMES)) {
    console.error(`derive-page-surfaces: ${THEMES} does not exist — run build:css:themes first.`);
    process.exit(1);
  }
  const names = readdirSync(THEMES).filter((n) => existsSync(join(THEMES, n, 'theme.css')));
  const todo = only ? names.filter((n) => n === only) : names;
  if (!todo.length) {
    console.error(only ? `No theme named "${only}".` : 'No built themes found.');
    process.exit(1);
  }

  let wrote = 0;
  let skipped = 0;
  for (const name of todo) {
    const file = join(THEMES, name, 'theme.css');
    const css = readFileSync(file, 'utf8');
    const derived = deriveForCss(css);
    if (!derived) {
      skipped++;
      console.log(`  – ${name.padEnd(20)} skipped (declares its own, or a source token could not be resolved)`);
      continue;
    }
    writeFileSync(file, applyToCss(css, derived));
    wrote++;
    console.log(`  ✓ ${name.padEnd(20)} hero ${derived['--page-hero-bg']}`);
  }
  console.log(`\npage surfaces derived for ${wrote} theme(s), ${skipped} skipped.`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('derive-page-surfaces.mjs')) {
  main();
}
