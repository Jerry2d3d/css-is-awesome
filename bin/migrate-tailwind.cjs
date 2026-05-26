/**
 * cia migrate tailwind — extract theme from a tailwind.config.* file.
 *
 * Status: PR 1 — parse + dump JSON to stdout. Future PRs:
 *   - US-03.1.3: map Tailwind tokens to cia contract tokens (color palette,
 *                spacing scale, font-size matching, confidence report)
 *   - US-03.1.4: write the cia theme.scss file wrapped in @include cia.theme()
 *
 * This module is self-contained — no cia internals. Loaded lazily by the
 * bin/cia.cjs router when the user invokes `cia migrate tailwind`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Search order matches Tailwind's own resolution: .ts → .mjs → .cjs → .js.
// We walk upward from the given start dir until one match is found.
const SEARCH_NAMES = [
  'tailwind.config.ts',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
  'tailwind.config.js',
];

function findTailwindConfig(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    for (const name of SEARCH_NAMES) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// jiti gives us .ts/.mjs support via a runtime require shim. Optional dep —
// consumers who only have .js/.cjs configs don't need it installed.
function loadConfig(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  try {
    const jiti = require('jiti')(__filename, { interopDefault: true });
    return jiti(absPath);
  } catch {
    if (ext === '.ts' || ext === '.mjs') {
      throw new Error(
        `Loading ${ext} configs requires jiti. Install it in your project: ` +
          `npm install -D jiti`,
      );
    }
    // .js / .cjs work via plain require — drop cache for a clean reload.
    delete require.cache[require.resolve(absPath)];
    const mod = require(absPath);
    return mod && mod.default ? mod.default : mod;
  }
}

// Use Tailwind's resolveConfig when available so extends + plugins + defaults
// are folded in. When Tailwind isn't installed in the consumer's project,
// fall back to a manual merge: combine `theme.extend.*` into `theme.*` for
// each known field. Less complete than resolveConfig (no plugin theme
// additions, no default values for unconfigured fields) but enough to surface
// the fields the consumer actually customized.
function resolveTailwindConfig(rawConfig) {
  try {
    const resolveConfig = require('tailwindcss/resolveConfig');
    return { resolved: resolveConfig(rawConfig), resolverUsed: 'tailwindcss/resolveConfig' };
  } catch {
    return { resolved: mergeExtend(rawConfig), resolverUsed: 'manual-merge (tailwindcss not installed)' };
  }
}

// Merge theme.extend.<field> into theme.<field> for known fields. Honors
// theme.<field> overrides — when both define a key, theme.<field> wins
// (matches Tailwind's actual override semantics).
function mergeExtend(rawConfig) {
  const theme = (rawConfig && rawConfig.theme) || {};
  const extend = theme.extend || {};
  const out = { ...rawConfig, theme: {} };
  const fields = new Set([...Object.keys(theme), ...Object.keys(extend)]);
  fields.delete('extend');
  for (const field of fields) {
    const base = theme[field];
    const ext = extend[field];
    if (base && typeof base === 'object' && ext && typeof ext === 'object') {
      out.theme[field] = { ...ext, ...base }; // theme.<field> overrides extend
    } else {
      out.theme[field] = base !== undefined ? base : ext;
    }
  }
  return out;
}

function extractTheme(resolved) {
  const theme = (resolved && resolved.theme) || {};
  return {
    colors: theme.colors || {},
    spacing: theme.spacing || {},
    fontSize: theme.fontSize || {},
    fontFamily: theme.fontFamily || {},
    fontWeight: theme.fontWeight || {},
    lineHeight: theme.lineHeight || {},
    letterSpacing: theme.letterSpacing || {},
    borderRadius: theme.borderRadius || {},
    boxShadow: theme.boxShadow || {},
    screens: theme.screens || {},
    zIndex: theme.zIndex || {},
  };
}

// Count leaves in a nested theme map (Tailwind's color objects are 2 deep:
// {blue: {50: '#...', 100: '#...', ...}}).
function countLeaves(obj) {
  if (!obj || typeof obj !== 'object') return obj == null ? 0 : 1;
  let count = 0;
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') count += countLeaves(v);
    else count += 1;
  }
  return count;
}

function summary(theme) {
  const out = {};
  for (const [field, value] of Object.entries(theme)) out[field] = countLeaves(value);
  return out;
}

// ─── cia contract scales (mirror scss/_system.scss + scss/theme/_shape.scss) ──

const CIA_SPACING = {
  1: 0.5,    // 8px
  2: 0.75,   // 12px
  3: 0.875,  // 14px
  4: 1,      // 16px
  5: 1.5,    // 24px
  6: 2,      // 32px
  7: 3,      // 48px
  8: 4,      // 64px
  9: 6,      // 96px
};

const CIA_FONT_SIZES = {
  1: 0.75,    // 12px
  2: 0.875,   // 14px
  3: 1,       // 16px
  4: 1.125,   // 18px
  5: 1.25,    // 20px
  6: 1.5,     // 24px
  7: 1.875,   // 30px
  8: 2.25,    // 36px
  9: 3,       // 48px
  10: 3.75,   // 60px
};

const CIA_RADII = {
  none: 0,
  sm: 0.25,
  md: 0.375,
  lg: 0.5,
  xl: 0.75,
  '2xl': 1,
  full: 9999, // sentinel; we match on the keyword 'full'
};

const STATUS_PALETTE_NAMES = {
  // Tailwind palette name → cia status token group
  red: 'error',
  rose: 'error',
  error: 'error',
  danger: 'error',
  green: 'success',
  emerald: 'success',
  success: 'success',
  yellow: 'warning',
  amber: 'warning',
  warning: 'warning',
  orange: 'warning',
  blue: 'info',
  sky: 'info',
  info: 'info',
};

const PRIMARY_PALETTE_NAMES = new Set([
  'primary', 'brand', 'accent', 'theme', 'main',
]);

// ─── rem parsing + value comparison ──────────────────────────────────────────

// Parse a Tailwind value into a numeric rem. Accepts "1rem", "16px", numbers,
// or returns null for unparseable values (variables, gradients, etc.).
function parseRem(value) {
  if (value == null) return null;
  if (typeof value === 'number') return value; // assume rem
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (/^-?\d*\.?\d+rem$/i.test(trimmed)) return parseFloat(trimmed);
  if (/^-?\d*\.?\d+px$/i.test(trimmed)) return parseFloat(trimmed) / 16;
  if (/^-?\d*\.?\d+em$/i.test(trimmed)) return parseFloat(trimmed); // treat as rem
  if (/^-?\d*\.?\d+$/i.test(trimmed)) {
    const n = parseFloat(trimmed);
    return n === 0 ? 0 : null; // bare 0 is fine; other bare numbers are ambiguous
  }
  return null;
}

// Find the closest cia scale entry by rem proximity. Returns
// { key, value, deltaRem, confidence }. confidence buckets:
//   HIGH   = exact (delta ≤ 0.001)
//   MEDIUM = close (delta ≤ 0.125rem = 2px)
//   LOW    = best-guess (delta ≤ 0.25rem = 4px)
//   null   = no acceptable match
function closestByRem(targetRem, scale) {
  let best = null;
  for (const [key, value] of Object.entries(scale)) {
    if (typeof value !== 'number') continue;
    const delta = Math.abs(value - targetRem);
    if (!best || delta < best.delta) best = { key, value, delta };
  }
  if (!best) return null;
  let confidence;
  if (best.delta < 0.001) confidence = 'HIGH';
  else if (best.delta <= 0.125) confidence = 'MEDIUM';
  else if (best.delta <= 0.25) confidence = 'LOW';
  else return null;
  return { key: best.key, value: best.value, deltaRem: best.delta, confidence };
}

// ─── color palette mapping ───────────────────────────────────────────────────

// Pick a "default shade" from a numeric Tailwind palette. Convention:
// 500 is the typical default, 600 if no 500 (some palettes start at 100/950).
function defaultShade(palette) {
  if (!palette || typeof palette !== 'object') return null;
  const keys = Object.keys(palette);
  for (const k of ['500', '600', '400', '700', 'DEFAULT']) {
    if (palette[k] != null && typeof palette[k] === 'string') return { shade: k, value: palette[k] };
  }
  // First string value as last resort
  for (const k of keys) {
    if (typeof palette[k] === 'string') return { shade: k, value: palette[k] };
  }
  return null;
}

// Map Tailwind colors object → cia color tokens (action-primary, error, etc.).
// Returns { mappings: {...}, unmapped: [...] }.
function mapColors(twColors) {
  const mappings = {};
  const unmapped = [];

  if (!twColors || typeof twColors !== 'object') return { mappings, unmapped };

  // Track which palettes we've already consumed so we don't double-map
  let primaryUsed = null;

  // Pass 1: status palettes by known names
  for (const [name, value] of Object.entries(twColors)) {
    const status = STATUS_PALETTE_NAMES[name.toLowerCase()];
    if (status && typeof value === 'object') {
      const pick = defaultShade(value);
      if (pick) {
        mappings[`${status}-default`] = {
          value: pick.value,
          source: `colors.${name}.${pick.shade}`,
          confidence: 'MEDIUM',
          rationale: `Tailwind palette '${name}' maps to cia status '${status}'; picked the ${pick.shade} shade by convention.`,
        };
      }
    }
  }

  // Pass 2: explicitly-named primary palettes
  for (const name of PRIMARY_PALETTE_NAMES) {
    const value = twColors[name];
    if (!value) continue;
    if (typeof value === 'string') {
      mappings['action-primary-default'] = {
        value,
        source: `colors.${name}`,
        confidence: 'HIGH',
        rationale: `Tailwind color named '${name}' — direct map to cia action-primary-default.`,
      };
      primaryUsed = name;
      break;
    }
    if (typeof value === 'object') {
      const pick = defaultShade(value);
      if (pick) {
        mappings['action-primary-default'] = {
          value: pick.value,
          source: `colors.${name}.${pick.shade}`,
          confidence: 'HIGH',
          rationale: `Tailwind palette named '${name}' — picked the ${pick.shade} shade as cia action-primary-default.`,
        };
        primaryUsed = name;
        break;
      }
    }
  }

  // Pass 3: if no primary identified, pick the FIRST non-status, non-utility palette
  if (!primaryUsed) {
    for (const [name, value] of Object.entries(twColors)) {
      if (STATUS_PALETTE_NAMES[name.toLowerCase()]) continue;
      if (['white', 'black', 'transparent', 'current', 'inherit', 'gray', 'grey', 'slate', 'zinc', 'neutral', 'stone'].includes(name.toLowerCase())) continue;
      if (typeof value === 'string') {
        mappings['action-primary-default'] = {
          value,
          source: `colors.${name}`,
          confidence: 'LOW',
          rationale: `No 'primary'/'brand' palette found; picked '${name}' as best guess for cia action-primary-default. Review + adjust.`,
        };
        primaryUsed = name;
        break;
      }
      if (typeof value === 'object') {
        const pick = defaultShade(value);
        if (pick) {
          mappings['action-primary-default'] = {
            value: pick.value,
            source: `colors.${name}.${pick.shade}`,
            confidence: 'LOW',
            rationale: `No 'primary'/'brand' palette found; picked '${name}' (${pick.shade} shade) as best guess for cia action-primary-default. Review + adjust.`,
          };
          primaryUsed = name;
          break;
        }
      }
    }
  }

  // Collect everything we didn't map into unmapped
  for (const [name, value] of Object.entries(twColors)) {
    if (name === primaryUsed) continue;
    if (STATUS_PALETTE_NAMES[name.toLowerCase()]) continue;
    if (['white', 'black', 'transparent', 'current', 'inherit'].includes(name.toLowerCase())) continue;
    if (typeof value === 'object') {
      const pick = defaultShade(value);
      if (pick) {
        unmapped.push({
          source: `colors.${name}`,
          value: pick.value,
          shade: pick.shade,
          reason: `Tailwind palette '${name}' — no matching cia semantic token. Suggested cia override: add as a brand-* token in your theme.scss.`,
        });
      }
    } else if (typeof value === 'string') {
      unmapped.push({
        source: `colors.${name}`,
        value,
        reason: `Tailwind color '${name}' — no matching cia semantic token. Suggested: add to brand layer.`,
      });
    }
  }

  return { mappings, unmapped };
}

// ─── flat scale mapping (spacing / fontSize) ─────────────────────────────────

// Map each Tailwind entry to the closest cia scale step. Each Tailwind key
// either picks a cia step (with confidence) or goes to UNMAPPED.
function mapFlatScale(twValues, ciaScale, ciaTokenPrefix, kind) {
  const mappings = {};
  const unmapped = [];
  if (!twValues || typeof twValues !== 'object') return { mappings, unmapped };

  // Each Tailwind step picks the closest cia slot. Multiple Tailwind steps can
  // map to the same cia slot — only the closest wins (the rest fall into
  // unmapped/competing).
  const claimedSlots = {};

  // Sort Tailwind entries by closeness to cia so we resolve "best" first
  const sorted = Object.entries(twValues)
    .map(([twKey, twVal]) => {
      const rem = parseRem(twVal);
      const match = rem == null ? null : closestByRem(rem, ciaScale);
      return { twKey, twVal, rem, match };
    })
    .sort((a, b) => {
      const ad = a.match ? a.match.deltaRem : Infinity;
      const bd = b.match ? b.match.deltaRem : Infinity;
      return ad - bd;
    });

  for (const { twKey, twVal, rem, match } of sorted) {
    if (rem == null) {
      unmapped.push({
        source: `${kind}.${twKey}`,
        value: twVal,
        reason: `Could not parse '${twVal}' as a rem/px value (variable, expression, or non-length).`,
      });
      continue;
    }
    if (!match) {
      unmapped.push({
        source: `${kind}.${twKey}`,
        value: twVal,
        reason: `No cia ${kind} slot within ±0.25rem of ${rem}rem.`,
      });
      continue;
    }
    const slot = `${ciaTokenPrefix}-${match.key}`;
    if (claimedSlots[slot]) {
      // Another Tailwind key already claimed this slot more closely — record
      // this one as competing/unmapped
      unmapped.push({
        source: `${kind}.${twKey}`,
        value: twVal,
        reason: `Closest cia slot (${slot} = ${match.value}rem) was already taken by '${claimedSlots[slot]}'. Consider extending the cia ${kind} scale or overriding the slot.`,
      });
      continue;
    }
    claimedSlots[slot] = `${kind}.${twKey}`;
    mappings[slot] = {
      value: `${match.value}rem`,
      source: `${kind}.${twKey}`,
      twRem: rem,
      ciaRem: match.value,
      deltaRem: match.deltaRem,
      confidence: match.confidence,
      rationale: match.confidence === 'HIGH'
        ? `Exact rem match (${rem}rem = cia ${slot}).`
        : `Closest cia ${kind} slot is ${slot} (${match.value}rem); Tailwind value ${rem}rem differs by ${match.deltaRem.toFixed(4)}rem.`,
    };
  }

  return { mappings, unmapped };
}

// ─── border radius mapping ───────────────────────────────────────────────────

function mapBorderRadius(twRadii) {
  const mappings = {};
  const unmapped = [];
  if (!twRadii || typeof twRadii !== 'object') return { mappings, unmapped };

  for (const [twKey, twVal] of Object.entries(twRadii)) {
    // Tailwind uses 'full' for 9999px-ish; cia uses 'full' too
    if (typeof twVal === 'string' && (twVal.includes('9999') || twVal === '9999px')) {
      mappings['radius-full'] = {
        value: '9999px',
        source: `borderRadius.${twKey}`,
        confidence: 'HIGH',
        rationale: 'Tailwind \'full\' (or 9999px) maps directly to cia radius-full.',
      };
      continue;
    }
    if (twVal === '0' || twVal === 0 || twVal === '0px' || twVal === '0rem') {
      mappings['radius-none'] = {
        value: '0',
        source: `borderRadius.${twKey}`,
        confidence: 'HIGH',
      };
      continue;
    }
    const rem = parseRem(twVal);
    if (rem == null) {
      unmapped.push({ source: `borderRadius.${twKey}`, value: twVal, reason: 'Could not parse as a length.' });
      continue;
    }
    const match = closestByRem(rem, CIA_RADII);
    if (!match || match.key === 'full' || match.key === 'none') {
      unmapped.push({ source: `borderRadius.${twKey}`, value: twVal, reason: `No cia radius within ±0.25rem of ${rem}rem.` });
      continue;
    }
    const slot = `radius-${match.key}`;
    mappings[slot] = {
      value: `${match.value}rem`,
      source: `borderRadius.${twKey}`,
      twRem: rem,
      ciaRem: match.value,
      deltaRem: match.deltaRem,
      confidence: match.confidence,
    };
  }
  return { mappings, unmapped };
}

// ─── font-family mapping (always HIGH — pass-through to cia --font-* tokens) ──

function mapFontFamily(twFamilies) {
  const mappings = {};
  if (!twFamilies || typeof twFamilies !== 'object') return { mappings, unmapped: [] };
  for (const [twKey, twVal] of Object.entries(twFamilies)) {
    // cia uses font-sans, font-serif, font-mono, font-display, font-script
    const ciaKey =
      twKey === 'sans' ? 'font-sans' :
      twKey === 'serif' ? 'font-serif' :
      twKey === 'mono' ? 'font-mono' :
      twKey === 'display' ? 'font-display' :
      null;
    if (!ciaKey) continue;
    const stack = Array.isArray(twVal) ? twVal.join(', ') : String(twVal);
    mappings[ciaKey] = {
      value: stack,
      source: `fontFamily.${twKey}`,
      confidence: 'HIGH',
      rationale: `Tailwind fontFamily.${twKey} → cia ${ciaKey} (direct stack copy).`,
    };
  }
  return { mappings, unmapped: [] };
}

// ─── master mapping function ─────────────────────────────────────────────────

function mapToCia(theme) {
  const allMappings = {};
  const allUnmapped = [];
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0, UNMAPPED: 0 };

  const colors = mapColors(theme.colors);
  Object.assign(allMappings, colors.mappings);
  allUnmapped.push(...colors.unmapped);

  const spacing = mapFlatScale(theme.spacing, CIA_SPACING, 'space', 'spacing');
  Object.assign(allMappings, spacing.mappings);
  allUnmapped.push(...spacing.unmapped);

  const fontSize = mapFlatScale(theme.fontSize, CIA_FONT_SIZES, 'font-size', 'fontSize');
  Object.assign(allMappings, fontSize.mappings);
  allUnmapped.push(...fontSize.unmapped);

  const radii = mapBorderRadius(theme.borderRadius);
  Object.assign(allMappings, radii.mappings);
  allUnmapped.push(...radii.unmapped);

  const families = mapFontFamily(theme.fontFamily);
  Object.assign(allMappings, families.mappings);

  for (const m of Object.values(allMappings)) {
    if (counts[m.confidence] != null) counts[m.confidence] += 1;
  }
  counts.UNMAPPED = allUnmapped.length;
  counts.total = counts.HIGH + counts.MEDIUM + counts.LOW + counts.UNMAPPED;

  return { mappings: allMappings, unmapped: allUnmapped, report: counts };
}

const HELP = `cia migrate tailwind — extract theme from tailwind.config.*

Usage:
  cia migrate tailwind [path]

Behavior (PR 1):
  Parses the config + dumps the theme as JSON to stdout. Progress / diagnostics
  print to stderr so the JSON is pipe-safe.

Future PRs (planned in roadmap/epics/v1-0/EPIC-03):
  - Map Tailwind tokens to cia contract tokens (color palette mapping,
    spacing scale alignment, font-size matching) with a HIGH/MEDIUM/LOW/UNMAPPED
    confidence report.
  - Write a cia theme.scss file wrapped in @include cia.theme('<name>').

Arguments:
  path   Optional. Path to tailwind.config.{js,ts,mjs,cjs}. If omitted, searches
         the current directory upward for the first match.

Examples:
  cia migrate tailwind ./tailwind.config.js
  cia migrate tailwind ./apps/web/tailwind.config.ts
  cia migrate tailwind                       # auto-detect

Pipe the JSON elsewhere if you need it in a script:
  cia migrate tailwind > theme.json
  cia migrate tailwind | jq .theme.colors
`;

async function run(args) {
  if (args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    process.stdout.write(HELP);
    return;
  }

  let configPath = args[0];
  if (configPath) {
    if (!path.isAbsolute(configPath)) {
      configPath = path.resolve(process.cwd(), configPath);
    }
    if (!fs.existsSync(configPath)) {
      throw new Error(`config path not found: ${configPath}`);
    }
  } else {
    configPath = findTailwindConfig();
    if (!configPath) {
      throw new Error(
        `no tailwind.config.{js,ts,mjs,cjs} found in current directory or any parent. ` +
          `Pass an explicit path: cia migrate tailwind <path>`,
      );
    }
  }

  process.stderr.write(`cia migrate tailwind\n`);
  process.stderr.write(`  config: ${configPath}\n`);
  process.stderr.write(`  loading...\n`);

  const rawConfig = loadConfig(configPath);
  if (!rawConfig || typeof rawConfig !== 'object') {
    throw new Error(`config did not export a valid object`);
  }

  process.stderr.write(`  resolving (tailwindcss/resolveConfig if available)...\n`);
  const { resolved, resolverUsed } = resolveTailwindConfig(rawConfig);
  process.stderr.write(`  resolver: ${resolverUsed}\n`);
  const theme = extractTheme(resolved);
  const stats = summary(theme);

  process.stderr.write(`  extracted theme fields:\n`);
  for (const [field, count] of Object.entries(stats)) {
    process.stderr.write(`    ${field.padEnd(14)}: ${count} values\n`);
  }

  process.stderr.write(`\n  mapping to cia contract tokens...\n`);
  const cia = mapToCia(theme);

  process.stderr.write(`\n  ─── confidence report ─────────────────────────\n`);
  process.stderr.write(`    HIGH     (exact match):     ${cia.report.HIGH}\n`);
  process.stderr.write(`    MEDIUM   (close, ≤0.125rem): ${cia.report.MEDIUM}\n`);
  process.stderr.write(`    LOW      (best guess):       ${cia.report.LOW}\n`);
  process.stderr.write(`    UNMAPPED (no cia analog):    ${cia.report.UNMAPPED}\n`);
  process.stderr.write(`    ─────────────────────────────────────────────\n`);
  process.stderr.write(`    total                         ${cia.report.total}\n`);

  if (cia.report.UNMAPPED > 0) {
    process.stderr.write(`\n  ${cia.report.UNMAPPED} unmapped value(s) — review at the bottom of the JSON output\n`);
    process.stderr.write(`  or pipe to jq: cia migrate tailwind <path> | jq '.cia.unmapped'\n`);
  }

  process.stderr.write(`\n  --- JSON dump on stdout below ---\n`);

  const output = {
    source: configPath,
    cia_cli_version_phase: 'PR 2 — parse + map (no theme.scss output yet)',
    summary: stats,
    theme,
    cia,
  };
  process.stdout.write(JSON.stringify(output, null, 2));
  process.stdout.write('\n');
}

module.exports = {
  run,
  findTailwindConfig,
  extractTheme,
  summary,
  // Mapping internals exported for unit testing + external introspection
  mapToCia,
  mapColors,
  mapFlatScale,
  mapBorderRadius,
  mapFontFamily,
  closestByRem,
  parseRem,
  CIA_SPACING,
  CIA_FONT_SIZES,
  CIA_RADII,
};
