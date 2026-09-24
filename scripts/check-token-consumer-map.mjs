#!/usr/bin/env node
// ============================================================================
// check-token-consumer-map.mjs
// ============================================================================
// Two checks (v1.2 EPIC-07 F1.2):
//
// 1. DRIFT (always fails CI on mismatch). src/lib/generated/token-consumers.json
//   is a committed build artifact, same as public/theme.css — this regenerates
//   it in memory and diffs byte-for-byte against what's committed. Same class
//   of bug as check-theme-drift.mjs guards against: a source change that never
//   got rebuilt, silently shipping stale data forever.
//
// 2. ZERO-CONSUMER REPORT (informational only — never fails the build). Lists
//   every contract token the map found no resolved consumer for.
//
// Why this never fails CI, not even behind a flag: the map is a STATIC scan
// (see build-token-consumer-map.mjs's header) that only resolves a call site
// whose argument is a literal, not a Sass variable. Measured on cia's own
// source: 85 of ~123 required contract tokens — including `--ink`, `--paper`,
// `--ai`, `--code-bg`: obviously real, heavily-used tokens — show ZERO
// consumers, because the mixins that read them do so through their OWN
// parameter (`focus-ring($color: border-focus) { color($color) }`), which
// this scanner correctly declines to guess through. That false-positive rate
// is far too high for a pass/fail gate; the list below is a starting point
// for a human to look at, not a verdict. Resolving call-site defaults through
// intermediate mixin parameters would need real data-flow analysis, which is
// out of scope for a zero-dependency regex tool (same trade-off
// bin/analyze.cjs already makes for its own rules).
//
// Usage: node scripts/check-token-consumer-map.mjs
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateMapJson, TOKEN_CONSUMER_MAP_PATH } from './build-token-consumer-map.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

let failed = false;

// ── 1. Drift ────────────────────────────────────────────────────────────────
const fresh = generateMapJson();
if (!existsSync(TOKEN_CONSUMER_MAP_PATH)) {
  console.log(`${red('x')} src/lib/generated/token-consumers.json is committed nowhere ${dim('— run npm run build:token-consumers')}`);
  failed = true;
} else {
  const committed = readFileSync(TOKEN_CONSUMER_MAP_PATH, 'utf8');
  if (committed !== fresh) {
    console.log(`${red('x')} token-consumers.json is out of sync with scss/ ${dim('— run npm run build:token-consumers and commit the result')}`);
    failed = true;
  } else {
    console.log(`${green('OK')} ${dim('- token-consumers.json matches its scss/ sources.')}`);
  }
}

// ── 2. Zero-consumer report ─────────────────────────────────────────────────
const contract = JSON.parse(readFileSync(resolve(ROOT, 'scripts/theme-contract.json'), 'utf8'));
const map = JSON.parse(fresh);
const requiredZero = (contract.required || []).filter((t) => !map.consumers[t]);
const optionalZero = (contract.optional || []).filter((t) => !map.consumers[t]);

if (requiredZero.length || optionalZero.length) {
  console.log(`\n${yellow('zero-consumer tokens')} ${dim('(informational — static scan found no literal-argument call site; see file header, this is not a pass/fail signal)')}`);
  if (requiredZero.length) console.log(`  required: ${requiredZero.join(', ')}`);
  if (optionalZero.length) console.log(`  optional: ${optionalZero.join(', ')}`);
} else {
  console.log(`${green('OK')} ${dim('- every contract token has at least one statically-resolved consumer.')}`);
}

process.exit(failed ? 1 : 0);
