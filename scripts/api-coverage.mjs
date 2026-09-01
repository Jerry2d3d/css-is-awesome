#!/usr/bin/env node
// ============================================================================
// api-coverage.mjs
// ============================================================================
// Call-and-assert coverage for the SCSS public API.
//
// For every public @mixin and @function in scss/, this generates a fixture
// that actually CALLS it, compiles the fixture with sass, and asserts the
// result is usable:
//
//   - it compiles without error
//   - the output contains no `null` / `undefined` leaking into CSS
//   - functions return a non-empty value
//   - mixins expected to emit actually emit
//
// This is deliberately NOT golden-file snapshotting. The goal is to catch
// renames, broken signatures and bad refactors without churning ~180 snapshot
// files every time a token value changes.
//
// Mixins that need a real argument can't be auto-called, so they get an entry
// in FIXTURES below. Anything missing from both auto-detection and FIXTURES
// counts as UNCOVERED and drags the percentage down — the number is only
// honest if failing to write a test lowers it.
//
// Usage:
//   node scripts/api-coverage.mjs            # report + enforce threshold
//   node scripts/api-coverage.mjs --list     # list uncovered units and exit 0
//   node scripts/api-coverage.mjs --threshold=98
// ============================================================================

import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCSS = path.join(ROOT, "scss");

const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const threshold = Number(
  (args.find((a) => a.startsWith("--threshold=")) || "--threshold=98").split("=")[1],
);

// ─── Hand-written call expressions ──────────────────────────────────────────
// Keyed by mixin/function name. Only needed where a required argument means we
// can't synthesise a call. `root: true` marks units that must be included at
// stylesheet top level rather than inside a selector (they emit :root/@page).
const FIXTURES = {
  // component + state
  "btn": "primary",
  "badge": "$status: info",
  "alert": "$status: info",
  "tag": "",
  // animation — animate-on takes an EFFECT (lift/glow/press/fade), not a keyframe
  "animate": "fade-in",
  "animate-on": "hover, lift",
  "keyframes-for": "fade-in",
  // responsive + container queries
  "media": "md",
  "media-down": "md",
  "media-between": "sm, lg",
  "contain": "md",
  "contain-down": "md",
  "contain-between": "sm, lg",
  // layout — Tier 2 takes rows of region names; named-layout takes a preset key
  "layout": "(nav),(side body),(foot)",
  "area": "nav",
  "named-layout": "default",
  // type + state — transition is variadic, so pass a bare property
  "type": "body",
  "hover": "color, red",
  "states": "action-primary",
  "transition": "color",
  "theme-properties": "$tokens: ('--probe': 1)",
  "font-face-local": "'Probe', '/probe.woff2'",
  "fa-spin": "check",
  // icons — these take a glyph name from the core pack
  "svg": "check",
  "svg-bg": "check",
  "svg-text": "check",
  "fa": "check",
  "fa-icon": "check",
  "fa-text": "check",
  "icon-svg": "check",
  "icon-svg-bg": "check",
  "icon-svg-text": "check",
  "icon-fa": "check",
  "icon-fa-icon": "check",
  "icon-fa-text": "check",
  // root-only emitters
  "print-base": { args: "", root: true },
  "theme": { args: "'probe'", root: true, content: "--x: 1;" },
  "font-face": { args: "'Probe', '/probe.woff2'", root: true },
};

// Functions need representative arguments; most take a token key.
const FN_FIXTURES = {
  "color": "text-primary",
  "space": "4",
  "radius": "md",
  "shadow": "2",
  "font": "reg",
  "font-size": "3",
  "z": "modal",
  "duration": "base",
  "ease": "standard",
  "breakpoint": "md",
  "grid": "4",
  "px": "16",
  "grid-from-px": "16",
  "resolve-size": "16",
  "icon": "check",
  "svg-url": "check",
  "comp": "'--probe', 1",
  "brand": "primary",
  "color-static": "text-primary",
  "space-raw": "4",
  "font-size-raw": "3",
  "line-height": "3",
  "line-height-raw": "3",
  "font-weight": "reg",
  "font-weight-raw": "reg",
  "letter-spacing": "wide",
  "radius-raw": "md",
  "shadow-raw": "2",
  "z-raw": "modal",
};

// ─── Parse the public surface ───────────────────────────────────────────────
function scssFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scssFiles(p));
    else if (e.name.endsWith(".scss")) out.push(p);
  }
  return out;
}

// Brace-match a mixin body starting at its opening `{`.
function extractBody(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  return src.slice(openIdx);
}

function moduleSpecifier(file) {
  // scss/components/_buttons.scss -> components/buttons
  const rel = path.relative(SCSS, file).split(path.sep).join("/");
  return rel.replace(/\.scss$/, "").replace(/(^|\/)_/, "$1");
}

const units = [];
for (const file of scssFiles(SCSS)) {
  // recipes/*.scss are opt-in consumer recipes, not part of the mixin API
  if (moduleSpecifier(file).startsWith("recipes/")) continue;
  const src = readFileSync(file, "utf8");
  const mod = moduleSpecifier(file);

  for (const m of src.matchAll(/^@mixin\s+([a-zA-Z0-9_-]+)\s*(\(([\s\S]*?)\))?\s*\{/gm)) {
    if (m[1].startsWith("_")) continue;
    // A mixin whose body is a bare @content wrapper (media queries, print,
    // hover) legitimately emits NOTHING when called without a block. Detect it
    // so the harness passes content instead of reporting a false failure.
    const body = extractBody(src, m.index + m[0].length - 1);
    units.push({
      kind: "mixin",
      name: m[1],
      params: (m[3] || "").trim(),
      mod,
      file,
      wrapsContent: /@content/.test(body),
    });
  }
  for (const m of src.matchAll(/^@function\s+([a-zA-Z0-9_-]+)\s*\(([\s\S]*?)\)\s*\{/gm)) {
    if (m[1].startsWith("_")) continue;
    units.push({ kind: "function", name: m[1], params: (m[2] || "").trim(), mod, file });
  }
}

// De-dupe: a name re-declared in two modules is one public unit.
const seen = new Map();
for (const u of units) if (!seen.has(`${u.kind}:${u.name}`)) seen.set(`${u.kind}:${u.name}`, u);
const ALL = [...seen.values()];

function requiredParams(params) {
  if (!params) return [];
  return params
    .split(/,(?![^(]*\))/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((p) => !p.includes(":") && !p.includes("..."));
}

// ─── Build + compile one fixture ────────────────────────────────────────────
function fixtureFor(u) {
  const fx = u.kind === "mixin" ? FIXTURES[u.name] : FN_FIXTURES[u.name];
  const spec = typeof fx === "object" ? fx : { args: fx };
  const needs = requiredParams(u.params);

  if (u.kind === "function") {
    const call = spec.args !== undefined ? `m.${u.name}(${spec.args})` : `m.${u.name}()`;
    if (needs.length && spec.args === undefined) return null; // uncovered
    return `@use '${u.mod}' as m;\n.probe { --v: #{${call}}; }\n`;
  }

  const argStr = spec.args !== undefined ? spec.args : "";
  if (needs.length && spec.args === undefined) return null; // uncovered
  const call = argStr ? `m.${u.name}(${argStr})` : `m.${u.name}`;
  // Content wrappers must be given a block or they correctly emit nothing.
  const inner = spec.content ?? (u.wrapsContent ? "color: red;" : null);
  const body = inner ? ` { ${inner} }` : "";

  return spec.root
    ? `@use '${u.mod}' as m;\n@include ${call}${body};\n`
    : `@use '${u.mod}' as m;\n.probe { @include ${call}${body}; }\n`;
}

const tmp = mkdtempSync(path.join(tmpdir(), "cia-cov-"));
const results = [];

try {
  for (const u of ALL) {
    const fixture = fixtureFor(u);
    if (fixture === null) {
      results.push({ u, status: "uncovered", why: `needs args: ${requiredParams(u.params).join(", ")}` });
      continue;
    }

    const f = path.join(tmp, "probe.scss");
    writeFileSync(f, fixture);

    let css;
    try {
      css = sass.compile(f, { loadPaths: [SCSS], style: "expanded" }).css;
    } catch (err) {
      results.push({ u, status: "fail", why: String(err.message).split("\n")[0] });
      continue;
    }

    if (/(^|[\s:(])(null|undefined)([\s;),]|$)/.test(css)) {
      results.push({ u, status: "fail", why: "null/undefined leaked into CSS output" });
      continue;
    }
    if (u.kind === "function" && !/--v:\s*\S/.test(css)) {
      results.push({ u, status: "fail", why: "function returned nothing usable" });
      continue;
    }
    if (u.kind === "mixin" && css.trim().length === 0) {
      results.push({ u, status: "fail", why: "mixin emitted nothing at all" });
      continue;
    }

    results.push({ u, status: "pass" });
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ─── Report ─────────────────────────────────────────────────────────────────
const pass = results.filter((r) => r.status === "pass");
const fail = results.filter((r) => r.status === "fail");
const uncovered = results.filter((r) => r.status === "uncovered");
const pct = ((pass.length / results.length) * 100).toFixed(1);

console.log(`api-coverage — SCSS public API\n`);
console.log(`  mixins    ${ALL.filter((u) => u.kind === "mixin").length}`);
console.log(`  functions ${ALL.filter((u) => u.kind === "function").length}`);
console.log(`  ─────────────────────`);
console.log(`  covered   ${pass.length}/${results.length}  (${pct}%)`);
console.log(`  failing   ${fail.length}`);
console.log(`  uncovered ${uncovered.length}`);

if (fail.length) {
  console.log(`\nFAILING:`);
  for (const r of fail) console.log(`  ✗ ${r.u.kind} ${r.u.name} (${r.u.mod}) — ${r.why}`);
}
if (uncovered.length && (listOnly || uncovered.length <= 40)) {
  console.log(`\nUNCOVERED (add a FIXTURES entry):`);
  for (const r of uncovered) console.log(`  · ${r.u.kind} ${r.u.name} (${r.u.mod}) — ${r.why}`);
}

if (listOnly) process.exit(0);

if (fail.length) {
  console.error(`\napi-coverage FAILED — ${fail.length} unit(s) broken.`);
  process.exit(1);
}
if (Number(pct) < threshold) {
  console.error(`\napi-coverage FAILED — ${pct}% is below the ${threshold}% threshold.`);
  process.exit(1);
}
console.log(`\napi-coverage passed — ${pct}% ≥ ${threshold}%.`);
