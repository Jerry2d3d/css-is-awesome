/**
 * cia migrate mui — parse a MUI (Material UI, v5+) theme object + map to cia.
 *
 * v1.2 EPIC-05. Same shape as migrate-tailwind / migrate-bootstrap:
 *   1. Load the consumer's theme module (createTheme({...}) result, or a
 *      plain theme-shaped object)
 *   2. Map to cia contract tokens with confidence levels, reusing the shared
 *      mapping engine from migrate-tailwind.cjs
 *   3. Write a cia theme.scss (via writeThemeScss)
 *
 * Token-only: this reads MUI's theme VALUES (colors, spacing, radius, font
 * family). It never imports @mui/material and never translates MUI React
 * components — cia has no component library to translate them to. Out of
 * scope, same reason Tailwind/Bootstrap migration doesn't do it either.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Shared engine from the Tailwind module — no need to fork it.
const {
  loadConfig,
  writeThemeScss,
  parseFlags,
  closestByRem,
  CIA_SPACING,
  CIA_RADII,
} = require('./migrate-tailwind.cjs');

// ─── theme object discovery ───────────────────────────────────────────────

// createTheme({...}) already returns a fully-resolved plain object — no MUI
// import needed to read one. Accept a few common export shapes.
function findMuiTheme(mod) {
  if (mod && typeof mod === 'object') {
    if (mod.theme && mod.theme.palette) return mod.theme;
    if (mod.default && mod.default.palette) return mod.default;
    if (mod.palette) return mod;
  }
  return null;
}

// ─── color mapping ─────────────────────────────────────────────────────────

const PALETTE_GROUPS = [
  ['primary', 'action-primary-default'],
  ['secondary', 'action-secondary-default'],
  ['error', 'error-default'],
  ['warning', 'warning-default'],
  ['info', 'info-default'],
  ['success', 'success-default'],
];

// Deliberately maps ONLY `.main` for each group — writeThemeScss already
// auto-derives hover/active via m.states() once a `<group>-default` token
// is set (same as Tailwind/Bootstrap get). Also mapping MUI's own .dark/
// .light shades would create two competing hover mechanisms in one theme.
function mapMuiColors(palette) {
  const mappings = {};
  const unmapped = [];
  if (!palette || typeof palette !== 'object') return { mappings, unmapped };

  for (const [muiKey, ciaToken] of PALETTE_GROUPS) {
    const group = palette[muiKey];
    if (group && typeof group.main === 'string') {
      mappings[ciaToken] = {
        value: group.main,
        source: `palette.${muiKey}.main`,
        confidence: 'HIGH',
        rationale: `MUI 'palette.${muiKey}.main' → cia '${ciaToken}' (direct semantic match; hover/active derive automatically via m.states()).`,
      };
    }
  }

  if (palette.text && typeof palette.text.primary === 'string') {
    mappings['text-primary'] = {
      value: palette.text.primary,
      source: 'palette.text.primary',
      confidence: 'HIGH',
      rationale: `MUI 'palette.text.primary' → cia 'text-primary'.`,
    };
  }
  if (palette.text && typeof palette.text.secondary === 'string') {
    mappings['text-secondary'] = {
      value: palette.text.secondary,
      source: 'palette.text.secondary',
      confidence: 'HIGH',
      rationale: `MUI 'palette.text.secondary' → cia 'text-secondary'.`,
    };
  }
  if (palette.background && typeof palette.background.default === 'string') {
    mappings['background-default'] = {
      value: palette.background.default,
      source: 'palette.background.default',
      confidence: 'HIGH',
      rationale: `MUI 'palette.background.default' → cia 'background-default'.`,
    };
  }
  if (palette.background && typeof palette.background.paper === 'string') {
    mappings['surface-default'] = {
      value: palette.background.paper,
      source: 'palette.background.paper',
      confidence: 'MEDIUM',
      rationale: `MUI 'palette.background.paper' (its elevated-surface concept) → cia 'surface-default'.`,
    };
  }

  return { mappings, unmapped };
}

// ─── spacing mapping ─────────────────────────────────────────────────────

// MUI's `spacing` is a number (px base unit, default 8), a function
// `(factor) => value`, or an array of explicit values. Sample factors 1-9
// (matching cia's own 9-step scale) through whichever form it is.
function sampleMuiSpacing(spacing) {
  const samples = {};
  const factors = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  if (typeof spacing === 'number') {
    for (const f of factors) samples[f] = (spacing * f) / 16; // px -> rem
    return samples;
  }
  if (Array.isArray(spacing)) {
    for (const f of factors) {
      const v = spacing[f];
      if (v == null) continue;
      const n = typeof v === 'number' ? v / 16 : parseFloat(v);
      if (!Number.isNaN(n)) samples[f] = n;
    }
    return samples;
  }
  if (typeof spacing === 'function') {
    for (const f of factors) {
      try {
        const v = spacing(f);
        const n = typeof v === 'number' ? v / 16 : parseFloat(v);
        if (!Number.isNaN(n)) samples[f] = n;
      } catch {
        // consumer's spacing() referenced something outside this sandbox — skip
      }
    }
    return samples;
  }
  return samples;
}

function mapMuiSpacing(spacing) {
  const mappings = {};
  const unmapped = [];
  const samples = sampleMuiSpacing(spacing);
  const claimedSlots = {};

  const sorted = Object.entries(samples)
    .map(([factor, rem]) => ({ factor, rem, match: closestByRem(rem, CIA_SPACING) }))
    .sort((a, b) => (a.match ? a.match.deltaRem : Infinity) - (b.match ? b.match.deltaRem : Infinity));

  for (const { factor, rem, match } of sorted) {
    if (!match) {
      unmapped.push({ source: `spacing(${factor})`, value: `${rem}rem`, reason: `No cia spacing slot within ±0.25rem of ${rem}rem.` });
      continue;
    }
    const slot = `space-${match.key}`;
    if (claimedSlots[slot]) continue; // closer factor already claimed this slot
    claimedSlots[slot] = factor;
    mappings[slot] = {
      value: `${match.value}rem`,
      source: `spacing(${factor})`,
      confidence: match.confidence,
      rationale: match.confidence === 'HIGH'
        ? `MUI 'spacing(${factor})' (${rem}rem) is an exact match for cia ${slot}.`
        : `Closest cia spacing slot to MUI 'spacing(${factor})' (${rem}rem) is ${slot} (${match.value}rem); delta ${match.deltaRem.toFixed(4)}rem.`,
    };
  }
  return { mappings, unmapped };
}

// ─── master mapping ─────────────────────────────────────────────────────────

function mapMuiToCia(theme) {
  const allMappings = {};
  const allUnmapped = [];

  const colors = mapMuiColors(theme.palette);
  Object.assign(allMappings, colors.mappings);
  allUnmapped.push(...colors.unmapped);

  if (theme.spacing != null) {
    const spacing = mapMuiSpacing(theme.spacing);
    Object.assign(allMappings, spacing.mappings);
    allUnmapped.push(...spacing.unmapped);
  }

  if (theme.shape && typeof theme.shape.borderRadius === 'number') {
    const rem = theme.shape.borderRadius / 16;
    const match = closestByRem(rem, CIA_RADII);
    if (match && match.key !== 'full' && match.key !== 'none') {
      allMappings[`radius-${match.key}`] = {
        value: `${match.value}rem`,
        source: 'shape.borderRadius',
        confidence: match.confidence,
        rationale: `MUI 'shape.borderRadius' (${theme.shape.borderRadius}px) is closest to cia radius-${match.key} (${match.value}rem).`,
      };
    } else {
      allUnmapped.push({ source: 'shape.borderRadius', value: `${theme.shape.borderRadius}px`, reason: 'No cia radius slot within ±0.25rem.' });
    }
  }

  if (theme.typography && typeof theme.typography.fontFamily === 'string') {
    allMappings['font-sans'] = {
      value: theme.typography.fontFamily,
      source: 'typography.fontFamily',
      confidence: 'HIGH',
      rationale: `MUI 'typography.fontFamily' → cia 'font-sans' (direct stack copy).`,
    };
  }

  // Deliberately not mapped — see the epic's scope note: MUI's 24-elevation
  // shadow system has no natural cia analog (cia has 5 named shadow steps),
  // and per-heading typography sizes / breakpoints are a long tail with no
  // single-value confidence story. Surfaced once, informationally, rather
  // than forcing an arbitrary per-field mapping.
  if (Array.isArray(theme.shadows) && theme.shadows.some((s) => s && s !== 'none')) {
    allUnmapped.push({
      source: 'shadows[0..24]',
      value: `${theme.shadows.length} elevation levels`,
      reason: `MUI's 24-elevation shadow system has no 1:1 cia analog (cia has 5 named steps: shadow-sm/md/lg/xl/2xl). Review and pick manually — mapping automatically would be arbitrary, not more correct.`,
    });
  }
  if (theme.breakpoints && theme.breakpoints.values) {
    allUnmapped.push({
      source: 'breakpoints.values',
      value: JSON.stringify(theme.breakpoints.values),
      reason: `cia's breakpoints are a fixed system scale (see scss/_system.scss), not themed per-project — not migrated. Note for reference only.`,
    });
  }

  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0, UNMAPPED: 0 };
  for (const m of Object.values(allMappings)) {
    if (counts[m.confidence] != null) counts[m.confidence] += 1;
  }
  counts.UNMAPPED = allUnmapped.length;
  counts.total = counts.HIGH + counts.MEDIUM + counts.LOW + counts.UNMAPPED;

  return { mappings: allMappings, unmapped: allUnmapped, report: counts };
}

// ─── CLI entry ────────────────────────────────────────────────────────────

const HELP = `cia migrate mui — convert a MUI (Material UI v5+) theme object to a cia theme.scss

Usage:
  cia migrate mui <path> [options]

Default behavior:
  Loads a module exporting a MUI theme (the result of createTheme({...}),
  as a default export, a named 'theme' export, or a plain theme-shaped
  object), maps its palette/spacing/shape/typography to cia contract
  tokens with confidence scoring, and writes a cia theme.scss to
  ./cia-themes/<name>.scss. Diagnostics print to stderr.

  Token-only: never imports @mui/material, never translates MUI React
  components — only reads plain values off the theme object.

Arguments:
  path             Path to a .js/.ts/.mjs/.cjs module exporting a MUI theme.

Options:
  --name <name>    Theme name. Default: migrated
  --out <path>     Custom output path. Default: ./cia-themes/<name>.scss
  --json           Skip the file write and dump JSON to stdout (pipe-safe).
  -h, --help       Show this help.

Examples:
  cia migrate mui ./src/theme.ts
  cia migrate mui ./src/theme.ts --name acme
  cia migrate mui ./src/theme.ts --json | jq '.cia.report'

Notes:
  - MUI's 24-elevation shadow system and per-breakpoint values are not
    mapped automatically — see the UNMAPPED block for why.
  - Hover/active states are NOT read from palette.<group>.dark/.light —
    cia derives them automatically from the -default value via m.states().
`;

async function run(args) {
  const { flags, positional } = parseFlags(args);
  if (flags.help) {
    process.stdout.write(HELP);
    return;
  }

  let themePath = positional[0];
  if (!themePath) {
    throw new Error(`cia migrate mui requires a path to a module exporting a MUI theme. Example: cia migrate mui ./src/theme.ts`);
  }
  if (!path.isAbsolute(themePath)) themePath = path.resolve(process.cwd(), themePath);
  if (!fs.existsSync(themePath)) throw new Error(`theme file not found: ${themePath}`);

  process.stderr.write(`cia migrate mui\n`);
  process.stderr.write(`  theme: ${themePath}\n`);
  process.stderr.write(`  loading...\n`);

  const mod = loadConfig(themePath);
  const theme = findMuiTheme(mod);
  if (!theme) {
    throw new Error(
      `Could not find a MUI theme in ${themePath}. Expected a default export, a named ` +
        `'theme' export, or the module itself to be a theme-shaped object with a 'palette' key ` +
        `(the result of createTheme({...})).`,
    );
  }

  process.stderr.write(`  found theme (mode: ${theme.palette?.mode ?? 'light'})\n`);
  process.stderr.write(`\n  mapping to cia contract tokens...\n`);
  const cia = mapMuiToCia(theme);

  process.stderr.write(`\n  ─── confidence report ─────────────────────────\n`);
  process.stderr.write(`    HIGH     (exact match):     ${cia.report.HIGH}\n`);
  process.stderr.write(`    MEDIUM   (close, ≤0.125rem): ${cia.report.MEDIUM}\n`);
  process.stderr.write(`    LOW      (best guess):       ${cia.report.LOW}\n`);
  process.stderr.write(`    UNMAPPED (no cia analog):    ${cia.report.UNMAPPED}\n`);
  process.stderr.write(`    ─────────────────────────────────────────────\n`);
  process.stderr.write(`    total                         ${cia.report.total}\n`);

  if (flags.json) {
    process.stderr.write(`\n  --- JSON dump on stdout below ---\n`);
    process.stdout.write(JSON.stringify({ source: themePath, cia }, null, 2));
    process.stdout.write('\n');
    return;
  }

  const scss = writeThemeScss(cia, { name: flags.name, source: themePath, tool: 'mui' });
  let outPath = flags.out;
  if (outPath) {
    if (!path.isAbsolute(outPath)) outPath = path.resolve(process.cwd(), outPath);
  } else {
    outPath = path.join(process.cwd(), 'cia-themes', `${flags.name}.scss`);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, scss, 'utf8');

  process.stderr.write(`\n  wrote ${outPath}\n`);
  process.stderr.write(`  ${scss.split('\n').length - 1} lines, ${Object.keys(cia.mappings).length} mapped tokens\n`);
  if (cia.report.UNMAPPED > 0) {
    process.stderr.write(`  ${cia.report.UNMAPPED} unmapped/informational entries appended as a comment block — review\n`);
  }
  process.stderr.write(`\n  Next steps:\n`);
  process.stderr.write(`    1. Review the file (MEDIUM/LOW/UNMAPPED entries are flagged)\n`);
  process.stderr.write(`    2. @use this file from your app's SCSS entry\n`);
  process.stderr.write(`    3. Set <html data-theme="${flags.name}"> and run npm run build:css\n`);
  process.stderr.write(`    4. Run npm run validate-themes to confirm WCAG 2.2 AA contrast\n`);
}

module.exports = {
  run,
  findMuiTheme,
  mapMuiColors,
  mapMuiSpacing,
  mapMuiToCia,
  sampleMuiSpacing,
};
