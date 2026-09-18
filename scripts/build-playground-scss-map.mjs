#!/usr/bin/env node
// ============================================================================
// build-playground-scss-map.mjs
// ============================================================================
// Emits `public/playground/scss-map.json`: every `.scss` file under `scss/`,
// keyed by its path relative to `scss/` (forward slashes), value = source.
//
// Why: the /playground page compiles SCSS *in the browser* (dart-sass's
// pure-JS build inside a web worker). Sass needs somewhere to resolve
// `@use 'css-is-awesome/api' as cia` from, and there is no file system in a
// worker — so the site ships cia's own source as one static JSON asset and
// a custom importer (src/lib/playground/resolve.ts) answers `@use` from it.
// Fetched lazily by the worker; never part of the JS bundle.
//
// Runs as `prebuild` (see package.json), so `npm run build` — locally, in CI
// and on Vercel — always regenerates it from the current source. The output
// is git-ignored: it is a build artifact of scss/, not a second source.
// ============================================================================
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCSS = path.join(ROOT, "scss");
const OUT = path.join(ROOT, "public", "playground", "scss-map.json");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (name.endsWith(".scss")) out.push(abs);
  }
  return out;
}

const map = {};
for (const abs of walk(SCSS).sort()) {
  const rel = path.relative(SCSS, abs).split(path.sep).join("/");
  map[rel] = readFileSync(abs, "utf8");
}

mkdirSync(path.dirname(OUT), { recursive: true });
const json = JSON.stringify(map);
writeFileSync(OUT, json);
console.log(
  `playground scss map — ${Object.keys(map).length} files, ${(json.length / 1024).toFixed(0)} KB → ${path.relative(ROOT, OUT).split(path.sep).join("/")}`,
);
