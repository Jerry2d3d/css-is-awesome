#!/usr/bin/env node
// ============================================================================
// pack-to-consumer.mjs
// ============================================================================
// One command to get the CURRENT cia into a local consumer project.
//
// Without this, every cia release costs three manual steps in the consumer:
//   1. npm pack here
//   2. hand-edit the consumer's package.json to the new tarball FILENAME
//      (which carries the version, so it changes every release)
//   3. npm install there
// Step 2 is the one that gets forgotten, and the failure is silent — the
// consumer keeps building against a stale tarball and nobody notices.
//
// WHY A TARBALL AND NOT A DIRECTORY LINK:
// `file:../css-is-awesome` would symlink and need no re-pack at all, which is
// tempting. But a symlink ignores the `files` manifest, so a file that is
// missing from the published package still resolves locally — exactly the bug
// fixed in 5d24066, where theme-contract.json worked in dev and broke on a
// real npm install. The tarball IS the packaging test. Keep it; just make it
// one step.
//
// Usage:
//   node scripts/pack-to-consumer.mjs [consumerDir] [--dry-run]
//
//   consumerDir  defaults to ../boiler-project-ai
//   --dry-run    report what would change, touch nothing
// ============================================================================

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const consumerArg = args.find((a) => !a.startsWith("--"));
const consumer = path.resolve(ROOT, consumerArg || "../boiler-project-ai");

const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const NAME = pkg.name;
const VERSION = pkg.version;
const tarball = `${NAME}-${VERSION}.tgz`;

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!existsSync(consumer)) fail(`consumer not found: ${consumer}`);
const consumerPkgPath = path.join(consumer, "package.json");
if (!existsSync(consumerPkgPath)) fail(`no package.json in ${consumer}`);

const consumerPkg = JSON.parse(readFileSync(consumerPkgPath, "utf8"));
const depField = ["dependencies", "devDependencies"].find(
  (f) => consumerPkg[f] && consumerPkg[f][NAME],
);
if (!depField) fail(`${consumer} does not depend on ${NAME}`);

const current = consumerPkg[depField][NAME];
const wanted = `file:${path
  .relative(consumer, path.join(ROOT, tarball))
  .split(path.sep)
  .join("/")}`;

console.log(`${NAME}@${VERSION}`);
console.log(`  consumer : ${consumer}`);
console.log(`  current  : ${current}`);
console.log(`  wanted   : ${wanted}`);

if (dryRun) {
  console.log(
    current === wanted
      ? "\n[dry-run] pin already correct; would still re-pack + install to pick up code changes."
      : "\n[dry-run] would re-pack, rewrite the pin, and npm install in the consumer.",
  );
  process.exit(0);
}

// 1. Pack. `prepublishOnly` rebuilds the CSS bundles first, so the tarball
//    always carries freshly-compiled dist/ rather than whatever was on disk.
console.log("\n→ npm pack");
for (const stale of readdirSync(ROOT).filter((f) => f.startsWith(`${NAME}-`) && f.endsWith(".tgz"))) {
  if (stale !== tarball) {
    unlinkSync(path.join(ROOT, stale));
    console.log(`  removed stale ${stale}`);
  }
}
execFileSync("npm", ["pack"], { cwd: ROOT, stdio: "inherit", shell: true });

// 2. Rewrite the pin only if it actually moved, so the diff stays empty on a
//    same-version re-pack.
if (current !== wanted) {
  consumerPkg[depField][NAME] = wanted;
  writeFileSync(consumerPkgPath, `${JSON.stringify(consumerPkg, null, 2)}\n`);
  console.log(`\n→ pin updated: ${current} → ${wanted}`);
} else {
  console.log("\n→ pin already correct, left alone");
}

// 3. Install. --no-save keeps npm from reshuffling unrelated ranges.
console.log("\n→ npm install (consumer)");
execFileSync("npm", ["install", wanted, "--no-save"], {
  cwd: consumer,
  stdio: "inherit",
  shell: true,
});

console.log(`\n✓ ${consumer} now has ${NAME}@${VERSION}`);
