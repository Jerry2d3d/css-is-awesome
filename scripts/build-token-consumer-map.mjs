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
// for literal `var(--token)`, `FN(<literal-arg>)` calls resolvable through
// that table, and one hop through a wrapper mixin — attributing each match to
// its enclosing mixin/function.
//
// A call whose argument is a Sass variable (`m.color($bg)`) or an
// interpolation (`#{$status}-subtle`) is SKIPPED, not guessed — the map is
// "direct, statically-resolvable consumers," not a full data-flow analysis.
// Same "accept false negatives over false positives" stance bin/analyze.cjs
// already documents for its own regex-based rules.
//
// ---------------------------------------------------------------------------
// THREE BUGS FIXED 2026-09-25, each proved by this file's own committed output
// ---------------------------------------------------------------------------
//
// 1. A signature with PARENTHESES IN A DEFAULT VALUE never matched the header
//    regex, because it read arguments as `[^)]*` and stopped at the first
//    `)`. `@mixin modal-backdrop($bg: rgba(0,0,0,.5))` was therefore not
//    scanned at all — not "found no tokens", never read. Signatures now use
//    balanced-paren matching. This is the dangerous class of bug: the output
//    looked like an answer.
//
// 2. The literal `var()` scan matched the PREFIX OF AN INTERPOLATED
//    reference. In `var(--space-#{$key})` the pattern stopped at the `#` and
//    recorded a token literally named `--space-`. Twelve such non-tokens were
//    in the committed map: `--brand-`, `--font-`, `--gap-`, `--z-` and the
//    rest. Interpolated references are now skipped, which is what the
//    paragraph above always claimed happened.
//
// 3. Tokens reaching an accessor THROUGH A WRAPPER were lost. `btn` calls
//    `_btn-solid(action-primary-hover, …)`, and `_btn-solid` hands that
//    parameter to `m.color()`. The token is read; it is just one hop away.
//    Those hops are now followed positionally.
//
// Wrapper resolution is an INFERENCE, so it may assert only tokens the
// contract already declares: a wrapper argument that is not a declared token
// is far likelier to be an ordinary keyword. A literal `var(--x)` gets no
// such filter — it is direct evidence, and it legitimately includes
// component-scoped tokens (`--btn-radius`) the contract does not list.
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
const CONTRACT = resolve(ROOT, 'scripts/theme-contract.json');

/** Every token the contract declares. Bounds wrapper-hop inference only. */
function contractTokens() {
  const c = JSON.parse(readFileSync(CONTRACT, 'utf8'));
  return new Set([...(c.required || []), ...(c.optional || [])]);
}

/**
 * Read from `open` (the index of a '(') to its matching ')'.
 * Returns the inner text and the index just past the close, or null if the
 * parens never balance.
 */
function readParens(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) return { inner: src.slice(open + 1, i), end: i + 1 };
    }
  }
  return null;
}

/**
 * Split an argument list on TOP-LEVEL commas only, so `rgba(0, 0, 0, .5)`
 * counts as one argument rather than four.
 */
function splitArgs(inner) {
  const args = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      args.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(inner.slice(start).trim());
  return args;
}

/**
 * Walk `src` one top-level `@mixin`/`@function NAME($args) { … }` block at a
 * time via brace-depth matching (nested @if/@each blocks don't confuse it).
 *
 * The signature is read with BALANCED parens. See header note 1.
 */
function extractTopLevelBlocks(src) {
  const out = [];
  const headRe = /@(mixin|function)\s+([\w-]+)\s*/g;
  let m;

  while ((m = headRe.exec(src))) {
    const [, kind, name] = m;
    let i = headRe.lastIndex;
    let argsRaw = '';

    if (src[i] === '(') {
      const parsed = readParens(src, i);
      if (!parsed) continue;
      argsRaw = parsed.inner;
      i = parsed.end;
    }

    while (i < src.length && /\s/.test(src[i])) i++;
    // Not a definition after all (an `@include`, or a stray match).
    if (src[i] !== '{') {
      headRe.lastIndex = i;
      continue;
    }

    const bodyStart = i + 1;
    let depth = 1;
    i = bodyStart;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    const body = src.slice(bodyStart, i - 1);

    const params = argsRaw.trim()
      ? splitArgs(argsRaw)
          .map((a) => a.trim().replace(/^\$/, '').split(':')[0].trim())
          .filter(Boolean)
      : [];

    out.push({ kind, name, params, firstArg: params[0] || '', body });
    headRe.lastIndex = i;
  }

  return out;
}

/** function name -> token prefix, e.g. "radius" -> "radius-", "color" -> "". */
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

/**
 * mixin/function name -> Map(parameter index -> token prefix).
 *
 * A wrapper is any block that hands one of its own parameters to a token
 * accessor. `_btn-solid($default, …)` does `m.color($bg or $default)`, so
 * argument 0 of any `_btn-solid(...)` call names a colour token. Matching is
 * positional, and only literal arguments resolve — `_btn-solid($x)` stays
 * skipped, the same rule as everywhere else here.
 */
function deriveWrapperTable(blocks, prefixTable) {
  const wrappers = new Map();

  for (const block of blocks) {
    if (block.params.length === 0) continue;
    const byIndex = new Map();

    block.params.forEach((param, index) => {
      if (!param) return;
      for (const [fnName, prefix] of prefixTable) {
        // The parameter appearing anywhere inside an accessor's argument
        // list counts: `m.color($bg or $default)` reads both of them.
        const re = new RegExp(
          `(?:^|[^\\w-])${escapeRe(fnName)}\\([^)]*\\$${escapeRe(param)}\\b`,
        );
        if (re.test(block.body)) {
          byIndex.set(index, prefix);
          return;
        }
      }
    });

    if (byIndex.size > 0) wrappers.set(block.name, byIndex);
  }

  return wrappers;
}

/**
 * Literal `var(--token)`, resolvable `FN(<literal-arg>)` calls, and one hop
 * through a wrapper mixin, for a single block's body.
 */
function findTokenUses(body, prefixTable, wrapperTable, declared) {
  const tokens = new Set();

  // Literal `var(--token)`. The trailing capture rejects an interpolated
  // reference — see header note 2.
  for (const m of body.matchAll(/var\(\s*(--[\w-]+)(.?)/g)) {
    if (m[2] === '#') continue;
    tokens.add(m[1]);
  }

  // Direct accessor calls: `m.color(ink)` -> `--ink`.
  for (const [fnName, prefix] of prefixTable) {
    const re = new RegExp(
      `(?:^|[^\\w-])${escapeRe(fnName)}\\(\\s*([\\w-]+)\\s*[,)]`,
      'g',
    );
    for (const m of body.matchAll(re)) tokens.add(`--${prefix}${m[1]}`);
  }

  // One hop: `_btn-solid(action-primary-hover, …)` -> `--action-primary-hover`.
  for (const [name, byIndex] of wrapperTable) {
    const re = new RegExp(`(?:^|[^\\w-])${escapeRe(name)}\\(`, 'g');
    for (const m of body.matchAll(re)) {
      const parsed = readParens(body, m.index + m[0].length - 1);
      if (!parsed) continue;
      const args = splitArgs(parsed.inner);
      for (const [index, prefix] of byIndex) {
        const arg = args[index];
        if (!arg || !/^[\w-]+$/.test(arg)) continue;
        const token = `--${prefix}${arg}`;
        if (declared.has(token)) tokens.add(token);
      }
    }
  }

  return tokens;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function readSource(path) {
  return stripComments(readFileSync(path, 'utf8'));
}

/**
 * Builds the map and returns it as a formatted JSON string (no timestamp
 * field on purpose — check-token-consumer-map.mjs diffs this byte-for-byte
 * against the committed file, and a live date would make every regeneration
 * "drift" even when nothing about the map actually changed). Exported so the
 * CI guard can regenerate in memory without shelling out or touching disk.
 */
export function generateMapJson() {
  const mixinsSrc = readSource(resolve(SCSS_DIR, '_mixins.scss'));
  const layoutSrc = readSource(resolve(SCSS_DIR, '_layout.scss'));

  const prefixTable = derivePrefixTable(
    extractTopLevelBlocks(mixinsSrc).filter((b) => b.kind === 'function'),
  );
  const declared = contractTokens();

  const compDir = resolve(SCSS_DIR, 'components');
  const componentFiles = readdirSync(compDir)
    .filter((f) => f.endsWith('.scss'))
    .map((f) => resolve(compDir, f));

  const sources = [
    mixinsSrc,
    layoutSrc,
    ...componentFiles.map((file) => readSource(file)),
  ];

  // Wrappers are derived across EVERY scanned file, not just _mixins.scss:
  // `_btn-solid` lives in components/_buttons.scss and is called from the
  // same file, one block below.
  const allBlocks = sources.flatMap((src) => extractTopLevelBlocks(src));
  const wrapperTable = deriveWrapperTable(allBlocks, prefixTable);

  // token -> Set(consumer mixin/function names)
  const consumers = new Map();

  for (const block of allBlocks) {
    const tokens = findTokenUses(block.body, prefixTable, wrapperTable, declared);
    for (const token of tokens) {
      if (!consumers.has(token)) consumers.set(token, new Set());
      consumers.get(token).add(block.name);
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
  console.log(
    `token-consumer-map — ${JSON.parse(json).tokenCount} tokens with a resolved direct consumer`,
  );
}
