#!/usr/bin/env node
// ============================================================================
// build-theme-bundle.mjs
// ============================================================================
// Generates public/theme.css — one stylesheet carrying every theme, so a
// consumer can load a single file and switch with the data-theme attribute.
//
// This used to be maintained by bundle-companion-themes.mjs, a one-shot
// appender that only added a theme if its block was MISSING. It never updated a
// block that already existed, so the bundle silently fell behind every theme
// fix. It also carried three blocks — sketchbook-light, boilerplate-light,
// boilerplate-dark — that had no SCSS source at all and could not be rebuilt by
// anything. Those are real themes now, and this script regenerates the whole
// file from public/themes/*/theme.css every build.
//
// The bare `:root` that each standalone theme emits (so a dropped-in file works
// with no markup change) is STRIPPED here: in a bundle every theme would match
// :root at once and the last one would win. Inside the bundle the data-theme
// attribute is the only thing telling them apart.
//
// Usage: node scripts/build-theme-bundle.mjs
// ============================================================================

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const THEMES = resolve(ROOT, 'public/themes');
const OUT = resolve(ROOT, 'public/theme.css');

const names = readdirSync(THEMES, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(THEMES, d.name, 'theme.css')))
  .map((d) => d.name)
  .sort();

if (names.length === 0) {
  console.error('No themes found under public/themes/. Run build:css:themes first.');
  process.exit(1);
}

// Walk `css` one top-level block at a time. A plain `[data-theme]` rule is
// captured directly; an at-rule (e.g. `@media print { … }`) is recursed
// into so a data-theme rule NESTED inside it (a theme's own print-palette
// override, a container query, etc.) is still found — and re-wrapped in
// that same at-rule on the way back out, so it keeps only applying under
// that condition instead of leaking onto the screen.
function extractBlocks(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    let selStart = open - 1;
    while (selStart >= 0 && css[selStart] !== '}' && css[selStart] !== ';') selStart--;
    selStart++;
    let d = 0, k = open;
    for (; k < css.length; k++) {
      if (css[k] === '{') d++;
      else if (css[k] === '}') { d--; if (d === 0) break; }
    }
    const selector = css.slice(selStart, open).trim();
    const body = css.slice(open + 1, k);

    if (selector.startsWith('@')) {
      for (const inner of extractBlocks(body)) {
        out.push({ ...inner, wrap: [selector, ...inner.wrap] });
      }
    } else if (/--[a-z0-9-]+\s*:/i.test(body) && selector.includes('data-theme')) {
      // Drop the standalone bare `:root,` — see header.
      const scoped = selector
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.includes('data-theme'))
        .join(', ');
      out.push({ selector: scoped, body, wrap: [] });
    }
    i = k + 1;
  }
  return out;
}

const imports = new Set();
const blocks = [];

for (const name of names) {
  const css = readFileSync(resolve(THEMES, name, 'theme.css'), 'utf8');

  for (const m of css.matchAll(/^@import[^\n]+/gm)) imports.add(m[0].trim());

  const found = extractBlocks(css);
  for (const b of found) {
    let rule = `${b.selector} {${b.body}}`;
    for (let w = b.wrap.length - 1; w >= 0; w--) rule = `${b.wrap[w]} {\n${rule}\n}`;
    blocks.push(rule);
  }
  if (found.length === 0) console.warn(`  ! ${name}: no [data-theme] block found`);
}

const header = `/* ============================================================
   THEME — Consolidated (css-is-awesome)
   -----------------------------------------------------------
   GENERATED FILE — do not edit by hand.
   Source: scss/themes/*.scss -> public/themes/<name>/theme.css
   Rebuild: npm run build:css:themes

   One stylesheet carrying every theme. Switch with the
   data-theme attribute:

     <html data-theme="sketchbook-light">

   To ship a SINGLE theme instead, use that theme's standalone
   file (public/themes/<name>/theme.css). Those emit a bare
   :root as well, so dropping one in as theme.css restyles the
   page with no markup change at all.

   ${names.length} themes: ${names.join(', ')}
   ============================================================ */
`;

const out = [header, ...[...imports], '', ...blocks, ''].join('\n');
writeFileSync(OUT, out, 'utf8');

const gz = gzipSync(Buffer.from(out)).length;
console.log(
  `theme.css — ${names.length} themes, ${blocks.length} blocks, ` +
  `${(Buffer.byteLength(out) / 1024).toFixed(1)} KB → ${(gz / 1024).toFixed(1)} KB gz`
);
