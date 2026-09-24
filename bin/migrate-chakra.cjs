/**
 * cia migrate chakra — parse a Chakra UI (v2) theme object + map to cia.
 *
 * v1.2 EPIC-05. Same shape as migrate-tailwind / migrate-bootstrap / migrate-mui.
 * Chakra's theme object shape (colors as {shade: hex} palettes, a flat
 * rem-keyed space/fontSizes scale, a named radii object) lines up closely
 * enough with Tailwind's that most of this is direct reuse of the shared
 * mapping engine, not new logic.
 *
 * Token-only: reads Chakra's theme VALUES. Never imports @chakra-ui/react,
 * never translates Chakra React components — same scope boundary as the
 * MUI migrator, for the same reason (cia has no component library to
 * translate them to).
 *
 * Scoped to Chakra v2 theme shape (still dominant as of this writing); v3
 * changed the theme shape significantly and isn't handled here.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Shared engine from the Tailwind module — no need to fork it. mapColors and
// mapBorderRadius are reused UNMODIFIED: Chakra's {shade: hex} color-palette
// shape and {name: length} radii shape are structurally identical to what
// those functions already walk for Tailwind.
const {
  loadConfig,
  writeThemeScss,
  parseFlags,
  mapColors,
  mapFlatScale,
  mapBorderRadius,
  CIA_SPACING,
  CIA_FONT_SIZES,
} = require('./migrate-tailwind.cjs');

// ─── theme object discovery ─────────────────────────────────────────────────

// extendTheme({...}) already returns a fully-resolved plain object — no
// Chakra import needed to read one.
function findChakraTheme(mod) {
  if (mod && typeof mod === 'object') {
    if (mod.theme && (mod.theme.colors || mod.theme.space || mod.theme.fonts)) return mod.theme;
    if (mod.default && (mod.default.colors || mod.default.space || mod.default.fonts)) return mod.default;
    if (mod.colors || mod.space || mod.fonts) return mod;
  }
  return null;
}

// ─── font mapping (Chakra's heading/body key names don't match Tailwind's) ──

function mapChakraFonts(fonts) {
  const mappings = {};
  if (!fonts || typeof fonts !== 'object') return mappings;
  if (typeof fonts.heading === 'string') {
    mappings['font-display'] = {
      value: fonts.heading,
      source: 'fonts.heading',
      confidence: 'HIGH',
      rationale: `Chakra 'fonts.heading' → cia 'font-display' (direct stack copy).`,
    };
  }
  if (typeof fonts.body === 'string') {
    mappings['font-sans'] = {
      value: fonts.body,
      source: 'fonts.body',
      confidence: 'HIGH',
      rationale: `Chakra 'fonts.body' → cia 'font-sans' (direct stack copy).`,
    };
  }
  return mappings;
}

// ─── master mapping ─────────────────────────────────────────────────────────

function mapChakraToCia(theme) {
  const allMappings = {};
  const allUnmapped = [];

  const colors = mapColors(theme.colors);
  Object.assign(allMappings, colors.mappings);
  allUnmapped.push(...colors.unmapped);

  const space = mapFlatScale(theme.space, CIA_SPACING, 'space', 'space');
  Object.assign(allMappings, space.mappings);
  allUnmapped.push(...space.unmapped);

  const fontSizes = mapFlatScale(theme.fontSizes, CIA_FONT_SIZES, 'font-size', 'fontSizes');
  Object.assign(allMappings, fontSizes.mappings);
  allUnmapped.push(...fontSizes.unmapped);

  const radii = mapBorderRadius(theme.radii);
  Object.assign(allMappings, radii.mappings);
  allUnmapped.push(...radii.unmapped);

  Object.assign(allMappings, mapChakraFonts(theme.fonts));

  // Deliberately not mapped — same disclosed scope cut as MUI's shadows:
  // Chakra's shadow/breakpoint/zIndex scales don't have a clean 1:1 cia
  // analog (cia's breakpoints and z-layers are a fixed system scale, not
  // themed per-project — see scss/_system.scss).
  if (theme.shadows && Object.keys(theme.shadows).length) {
    allUnmapped.push({
      source: 'shadows.*',
      value: `${Object.keys(theme.shadows).length} shadow token(s)`,
      reason: `No 1:1 cia analog (cia has 5 named steps: shadow-sm/md/lg/xl/2xl). Review and pick manually.`,
    });
  }
  if (theme.breakpoints) {
    allUnmapped.push({
      source: 'breakpoints.*',
      value: JSON.stringify(theme.breakpoints),
      reason: `cia's breakpoints are a fixed system scale, not themed per-project — not migrated. Note for reference only.`,
    });
  }
  if (theme.zIndices) {
    allUnmapped.push({
      source: 'zIndices.*',
      value: JSON.stringify(theme.zIndices),
      reason: `cia's z-layers are a fixed system scale (--z-dropdown/-modal/etc.), not themed per-project — not migrated. Note for reference only.`,
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

const HELP = `cia migrate chakra — convert a Chakra UI (v2) theme object to a cia theme.scss

Usage:
  cia migrate chakra <path> [options]

Default behavior:
  Loads a module exporting a Chakra theme (the result of extendTheme({...}),
  as a default export, a named 'theme' export, or a plain theme-shaped
  object), maps its colors/space/radii/fonts/fontSizes to cia contract
  tokens with confidence scoring, and writes a cia theme.scss to
  ./cia-themes/<name>.scss. Diagnostics print to stderr.

  Token-only: never imports @chakra-ui/react, never translates Chakra React
  components — only reads plain values off the theme object. Scoped to
  Chakra v2 theme shape.

Arguments:
  path             Path to a .js/.ts/.mjs/.cjs module exporting a Chakra theme.

Options:
  --name <name>    Theme name. Default: migrated
  --out <path>     Custom output path. Default: ./cia-themes/<name>.scss
  --json           Skip the file write and dump JSON to stdout (pipe-safe).
  -h, --help       Show this help.

Examples:
  cia migrate chakra ./src/theme.ts
  cia migrate chakra ./src/theme.ts --name acme
  cia migrate chakra ./src/theme.ts --json | jq '.cia.report'

Notes:
  - Chakra's 'colors' object uses the same {shade: hex} palette shape as
    Tailwind's, so the color-mapping heuristics (a 'brand'/'primary'-named
    scale, 'red'/'green'/'orange'/'blue' for status) apply unmodified.
  - shadows / breakpoints / zIndices are not mapped automatically — see
    the UNMAPPED block for why.
`;

async function run(args) {
  const { flags, positional } = parseFlags(args);
  if (flags.help) {
    process.stdout.write(HELP);
    return;
  }

  let themePath = positional[0];
  if (!themePath) {
    throw new Error(`cia migrate chakra requires a path to a module exporting a Chakra theme. Example: cia migrate chakra ./src/theme.ts`);
  }
  if (!path.isAbsolute(themePath)) themePath = path.resolve(process.cwd(), themePath);
  if (!fs.existsSync(themePath)) throw new Error(`theme file not found: ${themePath}`);

  process.stderr.write(`cia migrate chakra\n`);
  process.stderr.write(`  theme: ${themePath}\n`);
  process.stderr.write(`  loading...\n`);

  const mod = loadConfig(themePath);
  const theme = findChakraTheme(mod);
  if (!theme) {
    throw new Error(
      `Could not find a Chakra theme in ${themePath}. Expected a default export, a named ` +
        `'theme' export, or the module itself to be a theme-shaped object with a 'colors', ` +
        `'space', or 'fonts' key (the result of extendTheme({...})).`,
    );
  }

  process.stderr.write(`  found theme\n`);
  process.stderr.write(`\n  mapping to cia contract tokens...\n`);
  const cia = mapChakraToCia(theme);

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

  const scss = writeThemeScss(cia, { name: flags.name, source: themePath, tool: 'chakra' });
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
  findChakraTheme,
  mapChakraFonts,
  mapChakraToCia,
};
