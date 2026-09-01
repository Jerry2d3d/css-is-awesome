#!/usr/bin/env node
// ============================================================================
// dtcg-to-scss.mjs
// ============================================================================
// Convert a DTCG v2025.10 token JSON file into a cia theme SCSS source.
//
// Usage:
//   node scripts/dtcg-to-scss.mjs <input.json> --name <theme-name>
//   node scripts/dtcg-to-scss.mjs tokens.json --name press --mode symmetric
//
// Output is written to stdout. Redirect to scss/themes/<name>.scss to install:
//   node scripts/dtcg-to-scss.mjs tokens.json --name press > scss/themes/press.scss
//
// What it does:
//   1. Parses DTCG v2025.10 JSON (Design Tokens Community Group format)
//   2. Flattens nested $value paths to dot-notation token names
//   3. Maps DTCG paths to cia token names via a built-in lookup table
//   4. Wraps the result in @include m.theme($name, $mode) for cia consumption
//
// DTCG paths NOT in the mapping table emit as bare --token-name custom properties
// (verbatim), so consumers can extend cia tokens with their own DTCG additions.
//
// Limitations (v0.9.1 — first ship):
//   - Only resolves `$value` fields; aliases (`{path.to.token}`) are not yet expanded
//   - Math/calc references in DTCG values pass through verbatim
//   - Color formats: hex, rgb(), hsl(), and named colors supported as-is
//   - Shadows: passes single-line strings; doesn't decompose to layers yet
//
// Full DTCG fidelity (alias resolution, mode references via $extensions, etc.)
// arrives in a future revision once the spec stabilizes more downstream tooling.
// ============================================================================

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let inputPath = null;
let name = null;
let mode = 'symmetric';

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--name') name = args[++i];
  else if (a === '--mode') mode = args[++i];
  else if (!a.startsWith('-')) inputPath = a;
}

if (!inputPath || !name) {
  console.error('Usage: dtcg-to-scss <input.json> --name <theme> [--mode stable|symmetric|asymmetric]');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// DTCG → cia token mapping
// ---------------------------------------------------------------------------
// Maps DTCG dot-paths to cia custom-property names. Extend as needed.
// DTCG paths are case-sensitive; cia tokens are always lowercase kebab.
const TOKEN_MAP = {
  // Color / surface
  'color.background.default':    '--background-default',
  'color.background.subtle':     '--background-subtle',
  'color.background.elevated':   '--background-elevated',
  'color.background.overlay':    '--background-overlay',
  'color.background.hero':       '--background-hero',
  'color.background.scrim':      '--background-scrim',
  'color.surface.default':       '--surface-default',
  'color.surface.raised':        '--surface-raised',
  'color.surface.muted':         '--surface-muted',

  // Text
  'color.text.primary':          '--text-primary',
  'color.text.secondary':        '--text-secondary',
  'color.text.muted':            '--text-muted',
  'color.text.inverse':          '--text-inverse',
  'color.text.link':             '--text-link',

  // Action
  'color.action.primary.default':   '--action-primary-default',
  'color.action.primary.hover':     '--action-primary-hover',
  'color.action.primary.active':    '--action-primary-active',
  'color.action.secondary.default': '--action-secondary-default',
  'color.action.secondary.hover':   '--action-secondary-hover',
  'color.action.secondary.active':  '--action-secondary-active',

  // Status
  'color.success.default':       '--success-default',
  'color.success.subtle':        '--success-subtle',
  'color.warning.default':       '--warning-default',
  'color.warning.subtle':        '--warning-subtle',
  'color.error.default':         '--error-default',
  'color.error.subtle':          '--error-subtle',

  // Border
  'color.border.default':        '--border-default',
  'color.border.subtle':         '--border-subtle',
  'color.border.focus':          '--border-focus',

  // Type
  'typography.font.display':     '--font-display',
  'typography.font.body':        '--font-sans',
  'typography.font.mono':        '--font-mono',
  'typography.font.serif':       '--font-serif',

  // Shape
  'shape.radius.sm':             '--radius-sm',
  'shape.radius.md':             '--radius-md',
  'shape.radius.lg':             '--radius-lg',
  'shape.radius.full':           '--radius-full',

  // Spacing
  'space.xs':                    '--space-xs',
  'space.sm':                    '--space-sm',
  'space.md':                    '--space-md',
  'space.lg':                    '--space-lg',
  'space.xl':                    '--space-xl',
};

// ---------------------------------------------------------------------------
// Flatten DTCG tree to dot-paths + values
// ---------------------------------------------------------------------------
function flattenDtcg(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // skip metadata keys
    const path = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object') {
      if ('$value' in val) {
        out.push({ path, value: val.$value, type: val.$type });
      } else {
        flattenDtcg(val, path, out);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Convert a DTCG path to a cia token name
// ---------------------------------------------------------------------------
function toCiaTokenName(dtcgPath) {
  return TOKEN_MAP[dtcgPath] || `--${dtcgPath.replace(/\./g, '-').toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const raw = await readFile(resolve(inputPath), 'utf-8');
const dtcg = JSON.parse(raw);
const tokens = flattenDtcg(dtcg);

const header = `// ============================================================================
// THEME — ${name} (generated from DTCG v2025.10 source)
// ============================================================================
// Auto-generated by scripts/dtcg-to-scss.mjs. Edit the DTCG source, not this file.
// Source: ${inputPath}
// Generated: ${new Date().toISOString().slice(0, 10)}
// ============================================================================
@use '../mixins' as m;
`;

const body = tokens
  .map((t) => `  ${toCiaTokenName(t.path)}: ${t.value};`)
  .join('\n');

const wrapper = mode === 'stable'
  ? `@include m.theme('${name}', light) {\n${body}\n}\n`
  : `@include m.theme('${name}') {\n${body}\n}\n`;

process.stdout.write(`${header}\n${wrapper}`);
