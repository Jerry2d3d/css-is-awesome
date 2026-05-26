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
  process.stderr.write(`\n`);
  process.stderr.write(`  --- JSON dump on stdout below ---\n`);

  const output = {
    source: configPath,
    cia_cli_version_phase: 'PR 1 — parse + dump (no token mapping yet)',
    summary: stats,
    theme,
  };
  process.stdout.write(JSON.stringify(output, null, 2));
  process.stdout.write('\n');
}

module.exports = { run, findTailwindConfig, extractTheme, summary };
