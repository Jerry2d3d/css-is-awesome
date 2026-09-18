#!/usr/bin/env node
// ============================================================================
// check-contract-growth.mjs
// ============================================================================
// Fails CI when scripts/theme-contract.json changes in a way VERSIONING.md
// says needs a contract version bump — and the bump is missing.
//
// WHY THIS EXISTS
// 1.12.0 (2026-09-11) added `--space-unit` to the REQUIRED list in a MINOR
// release with the contract still at "1". Every consumer running the
// validator against a custom theme started failing on upgrade, and nothing
// in CI noticed because the shipped themes all declared the new token. A
// consumer (Gremlin Forge, 2026-09-18) caught it. Same shape as every other
// bug in this area: a green check that proves nothing. This closes it.
//
// RULES (from VERSIONING.md, "Contract" rows)
//   required token ADDED, RENAMED or REMOVED  → contract MAJOR must bump
//   required token RELAXED to optional        → contract MINOR must bump
//   optional token ADDED                      → contract MINOR must bump
//   optional token REMOVED                    → contract MAJOR must bump
//   no list change                            → version may stay
//
// The baseline is the contract at the most recent release tag reachable from
// HEAD (`v*`). With no tag in reach (shallow clone, fork without tags) the
// check reports "skipped" and exits 0 — better a visible skip than a false
// pass or a false fail. CI checks out with fetch-depth: 0 so tags exist there.
//
// Usage: node scripts/check-contract-growth.mjs [--base <git-ref>]
// ============================================================================
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'scripts/theme-contract.json';

const argv = process.argv.slice(2);
const baseIdx = argv.indexOf('--base');
let base = baseIdx !== -1 ? argv[baseIdx + 1] : null;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

if (!base) {
  try {
    base = git(['describe', '--tags', '--abbrev=0', '--match', 'v*']);
  } catch {
    console.log('check-contract-growth: skipped — no release tag reachable from HEAD (shallow clone?).');
    process.exit(0);
  }
}

let before;
try {
  before = JSON.parse(git(['show', `${base}:${CONTRACT}`]));
} catch {
  console.log(`check-contract-growth: skipped — ${CONTRACT} not found at ${base}.`);
  process.exit(0);
}
const after = JSON.parse(readFileSync(resolve(ROOT, CONTRACT), 'utf8'));

const parseVersion = (v) => {
  const [major, minor = '0'] = String(v).split('.');
  return { major: Number(major), minor: Number(minor) };
};
const vBefore = parseVersion(before.version);
const vAfter = parseVersion(after.version);
const majorBumped = vAfter.major > vBefore.major;
const minorBumped = majorBumped || (vAfter.major === vBefore.major && vAfter.minor > vBefore.minor);

const setOf = (a) => new Set(Array.isArray(a) ? a : []);
const reqB = setOf(before.required), reqA = setOf(after.required);
const optB = setOf(before.optional), optA = setOf(after.optional);
const diff = (x, y) => [...x].filter((t) => !y.has(t));

const requiredAdded = diff(reqA, reqB).filter((t) => !optB.has(t));       // brand new required
const requiredRemoved = diff(reqB, reqA).filter((t) => !optA.has(t));     // gone entirely
const relaxed = diff(reqB, reqA).filter((t) => optA.has(t));              // required → optional
const tightened = diff(reqA, reqB).filter((t) => optB.has(t));            // optional → required
const optionalAdded = diff(optA, optB).filter((t) => !reqB.has(t));
const optionalRemoved = diff(optB, optA).filter((t) => !reqA.has(t));

const problems = [];
const needMajor = [...requiredAdded, ...requiredRemoved, ...tightened, ...optionalRemoved];
const needMinor = [...relaxed, ...optionalAdded];
if (needMajor.length && !majorBumped) {
  problems.push(`contract MAJOR bump required ("${before.version}" → "${vBefore.major + 1}") for: ${needMajor.join(', ')}`);
}
if (needMinor.length && !minorBumped) {
  problems.push(`contract MINOR bump required ("${before.version}" → "${vBefore.major}.${vBefore.minor + 1}") for: ${needMinor.join(', ')}`);
}

console.log(`check-contract-growth — baseline ${base} (contract "${before.version}") → working tree (contract "${after.version}")`);
console.log(`  required: ${reqB.size} → ${reqA.size}   optional: ${optB.size} → ${optA.size}`);
const line = (label, list) => list.length && console.log(`  ${label}: ${list.join(', ')}`);
line('required added', requiredAdded);
line('required removed', requiredRemoved);
line('relaxed to optional', relaxed);
line('tightened to required', tightened);
line('optional added', optionalAdded);
line('optional removed', optionalRemoved);

if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('\ncheck-contract-growth FAILED — see VERSIONING.md "Contract" rows. A consumer\'s validator runs THIS file; a required token added without a MAJOR breaks every custom theme on upgrade.');
  process.exit(1);
}
console.log('  ✓ contract change (if any) carries the version bump VERSIONING.md requires.');
