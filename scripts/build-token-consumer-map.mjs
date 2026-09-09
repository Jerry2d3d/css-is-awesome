#!/usr/bin/env node
// ============================================================================
// build-token-consumer-map.mjs
// ============================================================================
// Generates src/lib/generated/token-consumers.json — for a design token, which
// mixins/functions in cia's own source actually read it. Powers the theme
// editor's "used by" disclosure (v1.2 EPIC-07 F1.1/F2.1) and the CI zero-
// consumer guard (check-token-consumer-map.mjs).
//
// The hard part isn't literal `var(--token)` — it's that most component code
// never writes that. It calls a wrapper function instead: `m.color(ink)`
// compiles to `var(--ink, …)`, `m.space(4)` to `var(--space-4, …)`, `m.radius
// (lg)` to `var(--radius-lg, …)`. A plain `var(--x)` regex would miss most of
// cia's real token consumption.
//
// So this script first DERIVES a function-name -> token-prefix table by
// reading every `@function NAME($arg, …) { … }` in _mixins.scss and finding
// the `var(--PREFIX#{$arg}` line in its body — generic and self-updating, no
// hand-maintained function list. Then it scans every top-level `@mixin`/
// `@function` block in _mixins.scss, _layout.scss, and scss/components/*.scss
// for both literal `var(--token)` and `FN(<literal-arg>)` calls resolvable
// through that table, attributing each match to its enclosing mixin/function.
//
// A call whose argument is a Sass variable (`m.color($bg)`) or an
// interpolation (`#{$status}-subtle`) is SKIPPED, not guessed — the map is
// "direct, statically-resolvable consumers," not a full data-flow analysis.
// Same "accept false negatives over false positives" stance bin/analyze.cjs
// already documents for its own regex-based rules.
//
// Usage: node scripts/build-token-consumer-map.mjs
// ============================================================================

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCSS_DIR = resolve(ROOT, 'scss');
const OUT = resolve(ROOT, 'src/lib/generated/token-consumers.json');

// Walk `src` one top-level `@mixin`/`@function NAME($args) { … }` block at a
// time via brace-depth matching (nested @if/@each blocks don't confuse it).
function extractTopLevelBlocks(src) {
  const out = [];
  const headRe = /@(mixin|function)\s+([\w-]+)\s*(?:\(([^)]*)\))?\s*\{/g;
  let m;
  while ((m = headRe.exec(src))) {
    const [, kind, name, argsRaw] = m;
    let depth = 1;
    let i = headRe.lastIndex;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    const body = src.slice(headRe.lastIndex, i - 1);
    const firstArg = (argsRaw || '').split(',')[0].trim().replace(/^\$/, '').split(':')[0].trim();
    out.push({ kind, name, firstArg, body });
    headRe.lastIndex = i;
  }
  return out;
}

// function name -> token prefix, e.g. "radius" -> "radius-", "color" -> "".
function derivePrefixTable(functionBlocks) {
  const table = new Map();
  for (const fn of functionBlocks) {
    if (!fn.firstArg) continue;
    const re = new RegExp(`var\\(--([\\w-]*)#\\{\\$${escapeRe(fn.firstArg)}\\}`);
    const found = re.exec(fn.body);
    if (found) table.set(fn.name, found[1]);
  }
  return table;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}

// Literal var(--token) plus resolvable FN(<literal-arg>) calls in one block's
// body. A dynamic argument ($var, #{…}) simply fails to match — skipped, not
// guessed, per the file header.
function findTokenUses(body, prefixTable) {
  const tokens = new Set();
  for (const m of body.matchAll(/var\(\s*(--[\w-]+)/g)) tokens.add(m[1]);
  for (const [fnName, prefix] of prefixTable) {
    const re = new RegExp(`(?:^|[^\\w-])${escapeRe(fnName)}\\(\\s*([\\w-]+)\\s*[,)]`, 'g');
    for (const m of body.matchAll(re)) tokens.add(`--${prefix}${m[1]}`);
  }
  return tokens;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function readSource(path) {
  return stripComments(readFileSync(path, 'utf8'));
}

// Builds the map and returns it as a formatted JSON string (no timestamp
// field on purpose — check-token-consumer-map.mjs diffs this byte-for-byte
// against the committed file, and a live date would make every regeneration
// "drift" even when nothing about the map actually changed). Exported so the
// CI guard can regenerate in memory without shelling out or touching disk.
export function generateMapJson() {
  const mixinsSrc = readSource(resolve(SCSS_DIR, '_mixins.scss'));
  const layoutSrc = readSource(resolve(SCSS_DIR, '_layout.scss'));

  const prefixTable = derivePrefixTable(
    extractTopLevelBlocks(mixinsSrc).filter((b) => b.kind === 'function'),
  );

  const compDir = resolve(SCSS_DIR, 'components');
  const componentFiles = readdirSync(compDir)
    .filter((f) => f.endsWith('.scss'))
    .map((f) => resolve(compDir, f));

  const sources = [
    mixinsSrc,
    layoutSrc,
    ...componentFiles.map((file) => readSource(file)),
  ];

  // token -> Set(consumer mixin/function names)
  const consumers = new Map();

  for (const src of sources) {
    for (const block of extractTopLevelBlocks(src)) {
      const tokens = findTokenUses(block.body, prefixTable);
      for (const token of tokens) {
        if (!consumers.has(token)) consumers.set(token, new Set());
        consumers.get(token).add(block.name);
      }
    }
  }

  const sortedTokens = [...consumers.keys()].sort();
  const out = {
    tokenCount: sortedTokens.length,
    consumers: Object.fromEntries(
      sortedTokens.map((t) => [t, [...consumers.get(t)].sort()]),
    ),
  };
  return JSON.stringify(out, null, 2) + '\n';
}

export { OUT as TOKEN_CONSUMER_MAP_PATH };

// Only write to disk when run directly (`node build-token-consumer-map.mjs`),
// not when check-token-consumer-map.mjs imports generateMapJson().
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const json = generateMapJson();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, json, 'utf8');
  console.log(`token-consumer-map — ${JSON.parse(json).tokenCount} tokens with a resolved direct consumer`);
}
