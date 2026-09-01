#!/usr/bin/env node
// ============================================================================
// size-budget.mjs
// ============================================================================
// Fails the build when a shipped bundle outgrows its budget.
//
// cia argues on size. The README quotes gzipped figures, /compare puts them in
// a table against Tailwind and Bootstrap, and "8 KB, zero JS" is the pitch.
// None of that was enforced — a change that doubled the CSS passed every gate.
//
// That is not hypothetical. The published figures had drifted to be overstated
// by up to 2x (utilities were documented at 11.5 KB against a real 4.1 KB, the
// full bundle at 15.2 KB against 7.3 KB) precisely because nothing measured
// them. A number you market on should be a gate, not a claim.
//
// Budgets are set slightly above today's real measurement — enough headroom
// that ordinary work doesn't trip it, tight enough that a doubling does. When
// a budget is legitimately exceeded, RAISE IT DELIBERATELY in this file, in
// the same commit as the change. The point is not that the number never moves;
// it is that it never moves silently.
//
// Usage:
//   node scripts/size-budget.mjs            # enforce
//   node scripts/size-budget.mjs --report   # print sizes, always exit 0
// ============================================================================

import { gzipSync } from "node:zlib";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportOnly = process.argv.includes("--report");

// Budget = gzipped KB ceiling. Keep the `docs` column pointing at wherever the
// number is quoted publicly, so a budget change flags the docs that must move
// with it.
const BUDGETS = [
  { file: "dist/tokens.css", budget: 2.5, docs: "README Size table" },
  { file: "dist/css-is-awesome.core.min.css", budget: 2.7, docs: "README + /compare" },
  { file: "dist/css-is-awesome.utilities.min.css", budget: 4.5, docs: "README + /compare BUNDLE_TIERS" },
  { file: "dist/css-is-awesome.min.css", budget: 8.0, docs: "README + /compare + homepage stat chip" },
];

// Themes ship one file per theme; the cap applies to the largest, since that is
// what a consumer actually downloads.
const THEME_BUDGET = 4.0;

function gzKb(file) {
  return gzipSync(readFileSync(file)).length / 1024;
}

let failures = 0;
console.log("size-budget — gzipped\n");

for (const { file, budget, docs } of BUDGETS) {
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) {
    console.log(`  ✗ ${file} — MISSING (run npm run build:css:all)`);
    failures++;
    continue;
  }
  const size = gzKb(abs);
  const pct = ((size / budget) * 100).toFixed(0);
  const line = `${file.padEnd(42)} ${size.toFixed(2).padStart(6)} / ${budget.toFixed(1)} KB  (${pct}%)`;
  if (size > budget) {
    console.log(`  ✗ ${line}`);
    console.log(`      over budget by ${(size - budget).toFixed(2)} KB — quoted in: ${docs}`);
    console.log(`      If this growth is intended, raise the budget HERE and update those docs in the same commit.`);
    failures++;
  } else {
    console.log(`  ✓ ${line}`);
  }
}

// Largest theme file
const themesDir = path.join(ROOT, "public", "themes");
if (existsSync(themesDir)) {
  let worst = { name: null, size: 0 };
  for (const t of readdirSync(themesDir)) {
    const p = path.join(themesDir, t, "theme.css");
    if (!existsSync(p)) continue;
    const size = gzKb(p);
    if (size > worst.size) worst = { name: t, size };
  }
  if (worst.name) {
    const pct = ((worst.size / THEME_BUDGET) * 100).toFixed(0);
    const line = `largest theme (${worst.name})`.padEnd(42) +
      ` ${worst.size.toFixed(2).padStart(6)} / ${THEME_BUDGET.toFixed(1)} KB  (${pct}%)`;
    if (worst.size > THEME_BUDGET) {
      console.log(`  ✗ ${line}`);
      failures++;
    } else {
      console.log(`  ✓ ${line}`);
    }
  }
}

if (reportOnly) {
  process.exit(0);
}
if (failures) {
  console.error(`\nsize-budget FAILED — ${failures} bundle(s) over budget.`);
  process.exit(1);
}
console.log("\nsize-budget passed — every bundle within its documented budget.");
