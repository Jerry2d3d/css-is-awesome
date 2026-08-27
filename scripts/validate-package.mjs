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
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
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

// Other specifiers the docs hand out. These are compile-only checks — they do
// not all expose `color()`, so a probe rule would be a false failure. Proving
// they RESOLVE is the point; the zero-emit contract is asserted above.
const RESOLVES = [
  "css-is-awesome/scss/main",
  "css-is-awesome/scss/components",
  "css-is-awesome/scss/components/buttons",
  "css-is-awesome/scss/icons",
  "css-is-awesome/scss/layout",
  "css-is-awesome/scss/recipes/bare-tags",
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
    // A byte-count floor is not enough. The root import silently stopped
    // emitting `:root` tokens once — 24 KB of keyframes cleared the size check
    // while the documented "emit the tokens once at your root" contract was
    // broken. Assert the tokens specifically.
    if (emits && !/:root\b/.test(out)) {
      console.log(`  ✗ @use '${spec}' — emitted ${out.length} bytes but no :root token block`);
      failures++;
      continue;
    }
    if (emits && !/--[a-z-]+:/.test(out)) {
      console.log(`  ✗ @use '${spec}' — :root present but declares no custom properties`);
      failures++;
      continue;
    }

    console.log(`  ✓ @use '${spec}'${emits ? "" : " (zero-emit)"}`);
  }

  for (const spec of RESOLVES) {
    writeFileSync(path.join(tmp, "probe.scss"), `@use '${spec}';\n`);
    try {
      run("npx", ["sass", "--no-source-map", "--load-path=node_modules", "probe.scss"], tmp);
      console.log(`  ✓ @use '${spec}' (resolves)`);
    } catch (err) {
      console.log(`  ✗ @use '${spec}' — ${String(err.stderr || err.message).split("\n")[0]}`);
      failures++;
    }
  }

  // ─── Load-path immunity of our internal relative forwards ────────────────
  // Boiler hit `Two forwarded modules both define a mixin named stack` with its
  // own styles dir on loadPaths, and that was blamed on the barrel. This checks
  // whether standard Sass is even capable of that failure.
  //
  // It is not. cia writes `@forward './mixins'` with an explicit `./`, and Sass
  // resolves relative loads against the IMPORTING FILE without consulting load
  // paths — so a consumer partial of the same name cannot displace ours. The
  // assertion below pins that guarantee: the barrel must compile even with a
  // hostile `styles/_mixins.scss` ahead of node_modules on the load path.
  //
  // If this ever starts failing, cia has grown a non-relative internal import
  // and consumers become shadowable. That is the regression worth catching.
  //
  // Corollary for the docs: the shadowing hazard is a reported Turbopack /
  // sass-loader deviation from Sass semantics, NOT something reproducible with
  // dart-sass, and it should be described that way rather than as a Sass rule.
  console.log(`\n  load-path immunity (internal forwards are ./-relative):`);

  mkdirSync(path.join(tmp, "styles"), { recursive: true });
  writeFileSync(
    path.join(tmp, "styles", "_mixins.scss"),
    "// A consumer partial whose name collides with cia's internal module.\n@mixin stack { display: flex; }\n",
  );
  writeFileSync(path.join(tmp, "hazard.scss"), `@use 'css-is-awesome/scss/api' as cia;\n.x { color: cia.color(text-primary); }\n`);

  try {
    run("npx", ["sass", "--no-source-map", "--load-path=node_modules", "hazard.scss"], tmp);
    console.log(`    ✓ barrel compiles with node_modules on the load path`);
  } catch (err) {
    console.log(`    ✗ barrel FAILED with only node_modules on the load path — ${String(err.stderr || err.message).split("\n")[0]}`);
    failures++;
  }

  try {
    run(
      "npx",
      ["sass", "--no-source-map", "--load-path=styles", "--load-path=node_modules", "hazard.scss"],
      tmp,
    );
    console.log(`    ✓ survives a hostile styles/_mixins.scss ahead of node_modules`);
  } catch (err) {
    console.log(`    ✗ a consumer load path SHADOWED an internal forward — ${String(err.stderr || err.message).split("\n")[0]}`);
    console.log(`      cia has grown a non-relative internal import; consumers are now shadowable.`);
    failures++;
  }
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}

if (failures) {
  console.error(`\npackage validation FAILED — ${failures} documented import(s) do not resolve.`);
  process.exit(1);
}
console.log("\npackage validation passed — every documented import resolves from a real install.");
