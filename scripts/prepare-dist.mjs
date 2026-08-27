#!/usr/bin/env node
// ============================================================================
// prepare-dist.mjs — npm `prepare` hook
// ============================================================================
// `dist/` is gitignored, and npm runs `prepublishOnly` ONLY when publishing.
// It runs `prepare` in three cases: after `npm install` in a clone, before
// `npm pack`/`publish`, AND when a consumer installs the package from a git
// URL.
//
// That last case is the one that bit us. With only `prepublishOnly`, a
// consumer pinning `git+https://github.com/…/css-is-awesome.git#<sha>` — which
// is the ONLY way to install cia until it is published to npm — received a
// package with no `dist/` at all. Every CSS entry point silently pointed at a
// file that did not exist:
//
//   exports["."].style   -> ./dist/css-is-awesome.css      (missing)
//   exports["."].default -> ./dist/css-is-awesome.css      (missing)
//   exports["./core"]    -> ./dist/css-is-awesome.core.css (missing)
//
// SCSS consumers were unaffected (scss/ is committed), which is why it went
// unnoticed — the one consumer we have uses the SCSS path.
//
// Guards:
//   - Skips when dist/ is already populated, so a plain `npm install` in a
//     working clone doesn't pay for a rebuild every time.
//   - Skips when the build inputs are absent (installing from a published
//     tarball, where dist/ ships prebuilt and scss/ may be all that's needed).
//   - Never fails the install: a broken prepare would make cia impossible to
//     install at all, which is worse than a missing dist/.
// ============================================================================

import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SCSS = path.join(ROOT, "scss");

function distIsPopulated() {
  try {
    return readdirSync(DIST).some((f) => f.endsWith(".css"));
  } catch {
    return false;
  }
}

if (distIsPopulated()) {
  process.exit(0);
}

if (!existsSync(SCSS)) {
  // No sources to build from — nothing sensible to do.
  process.exit(0);
}

try {
  console.log("prepare: dist/ is empty — building CSS bundles…");
  execSync("npm run build:css:all", { cwd: ROOT, stdio: "inherit", shell: true });
} catch (err) {
  // Deliberately non-fatal. SCSS consumers work without dist/; failing here
  // would break the install outright.
  console.warn(`prepare: could not build dist/ (${err.message}). SCSS entry points still work.`);
}
