#!/usr/bin/env node
// ============================================================================
// validate-package.mjs
// ============================================================================
// Asserts that the DOCUMENTED import forms actually resolve from a real
// `npm install` of the packed tarball.
//
// Why this exists as a separate check from validate-api.mjs:
// validate-api compiles the barrel from INSIDE this repo, with scss/ on the
// load path. That passes even when the published package is unusable. On
// 2026-08-18 both headline imports in the README —
//
//   @use 'css-is-awesome' as cia;
//   @use 'css-is-awesome/api' as cia;
//
// — failed on a clean install with "Can't find stylesheet to import", because
// Sass does not read package.json "exports" and the real files live under
// scss/. Every in-repo check was green. This script is the one that would
// have caught it.
//
// It packs, installs into a temp dir, compiles each documented form, and also
// re-checks that the /api forms stay zero-emit once installed.
//
// Usage: node scripts/validate-package.mjs   (exit 0 = pass, 1 = fail)
// ============================================================================

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const TARBALL = `${pkg.name}-${pkg.version}.tgz`;

// Every specifier the docs tell a consumer to write. `emits: false` means the
// form must stay zero-emit — it may print nothing beyond the probe rule.
const FORMS = [
  { spec: "css-is-awesome", emits: true },
  { spec: "css-is-awesome/api", emits: false },
  { spec: "css-is-awesome/scss/api", emits: false },
  { spec: "css-is-awesome/scss/mixins", emits: false },
];

const PROBE = ".cia-probe { color: cia.color(text-primary); }";

let tmp;
let failures = 0;

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, shell: true, encoding: "utf8", stdio: "pipe" });
}

try {
  console.log(`validate-package — ${pkg.name}@${pkg.version}\n`);

  run("npm", ["pack"], ROOT);

  tmp = mkdtempSync(path.join(tmpdir(), "cia-pkg-"));
  writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "probe", private: true }, null, 2));
  run("npm", ["install", path.join(ROOT, TARBALL), "sass", "--silent", "--no-audit", "--no-fund"], tmp);

  for (const { spec, emits } of FORMS) {
    writeFileSync(path.join(tmp, "probe.scss"), `@use '${spec}' as cia;\n${PROBE}\n`);
    let out = "";
    try {
      out = run("npx", ["sass", "--no-source-map", "--load-path=node_modules", "probe.scss"], tmp);
    } catch (err) {
      const detail = String(err.stderr || err.message).split("\n")[0];
      console.log(`  ✗ @use '${spec}' — ${detail}`);
      failures++;
      continue;
    }

    if (!out.includes("cia-probe")) {
      console.log(`  ✗ @use '${spec}' — compiled but the probe rule is missing`);
      failures++;
      continue;
    }

    // Zero-emit forms must print the probe and essentially nothing else.
    const extra = out.replace(/\.cia-probe\s*\{[^}]*\}/, "").trim();
    if (!emits && extra.length > 0) {
      console.log(`  ✗ @use '${spec}' — expected zero-emit, got ${extra.length} extra bytes`);
      failures++;
      continue;
    }
    if (emits && out.length < 1000) {
      console.log(`  ✗ @use '${spec}' — expected the kitchen-sink barrel to emit, got ${out.length} bytes`);
      failures++;
      continue;
    }

    console.log(`  ✓ @use '${spec}'${emits ? "" : " (zero-emit)"}`);
  }
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}

if (failures) {
  console.error(`\npackage validation FAILED — ${failures} documented import(s) do not resolve.`);
  process.exit(1);
}
console.log("\npackage validation passed — every documented import resolves from a real install.");
