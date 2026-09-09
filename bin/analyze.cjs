/**
 * cia analyze — design-system health check for a consumer project.
 *
 * Reads the REAL API surface from the installed package's SCSS sources
 * (the same files the MCP server serves), then audits the project's
 * stylesheets for:
 *   - cia.* calls that don't resolve (dead symbols — typos, removals)
 *   - the space() scale trap (numbered scale is 1–9; unknown keys pass
 *     through raw and silently invalidate the declaration)
 *   - hard-coded hex colors (values should come from tokens)
 *   - BEM-style class names (__ / -- chains are forbidden in cia projects)
 *   - hand-written grid-template-areas (the layout mixins own the maps)
 *
 * Zero dependencies, filesystem only — same philosophy as the MCP server.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PKG_SCSS = path.join(__dirname, '..', 'scss');
const CONTRACT_PATH = path.join(__dirname, '..', 'scripts', 'theme-contract.json');

// All contract token names (required + optional). Used to catch typo'd tokens —
// a var(--x) that's a near-miss of a real token silently breaks the style.
// The contract is optional; if it can't be read the rule simply goes quiet.
function loadContractTokens() {
  try {
    const c = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
    return new Set([...(c.required || []), ...(c.optional || [])]);
  } catch {
    return new Set();
  }
}

// Tiny Levenshtein (zero-dep). Only called on var(--x) misses, so cost is trivial.
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[m][n];
}

const HELP = `cia analyze — design-system health check

Usage:
  cia analyze [path] [options]

Scans [path] (default: current directory) for *.scss files and audits
them against the installed css-is-awesome API.

Rules: unknown-symbol, space-scale, off-contract-token, off-scale-length,
hard-coded-color, bem, hand-written-areas, missing-focus-visible.
Full reference: https://cssisawesome.com/docs/analyzer

Options:
  --namespace <ns>   Extra namespace(s) to treat as cia (comma-separated).
                     Auto-detected per file from @use lines; use this when
                     imports are aliased through an intermediate file.
  --json             Machine-readable report on stdout.
  --verbose          The per-file listing instead of the graded report.
  --strict           Exit 1 on warnings too (default: errors only).

Examples:
  cia analyze
  cia analyze src/styles --json
  cia analyze src --namespace m,l
`;

// ── API surface discovery ───────────────────────────────────────────────────

function collectSymbols() {
  const symbols = new Set();
  const files = [];
  const top = ['_mixins.scss', '_layout.scss', '_animations.scss', '_generator.scss'];
  for (const f of top) files.push(path.join(PKG_SCSS, f));
  const compDir = path.join(PKG_SCSS, 'components');
  for (const f of fs.readdirSync(compDir)) {
    if (f.endsWith('.scss')) files.push(path.join(compDir, f));
  }
  for (const file of files) {
    let src = '';
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const m of src.matchAll(/@(?:mixin|function)\s+([a-zA-Z][\w-]*)/g)) {
      if (!m[1].startsWith('_')) symbols.add(m[1]);
    }
  }
  // Icon mixins are forwarded with an icon- prefix by the /api barrel.
  const icons = path.join(PKG_SCSS, '_icons.scss');
  try {
    const src = fs.readFileSync(icons, 'utf8');
    for (const m of src.matchAll(/@(?:mixin|function)\s+([a-zA-Z][\w-]*)/g)) {
      if (!m[1].startsWith('_')) symbols.add(`icon-${m[1]}`);
    }
  } catch {
    /* icons module optional */
  }
  return symbols;
}

// ── project scan ────────────────────────────────────────────────────────────

function walkScss(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkScss(full, out);
    else if (entry.name.endsWith('.scss')) out.push(full);
  }
  return out;
}

const CIA_SOURCE = /^(?:css-is-awesome(?:\/|$)|pkg:css-is-awesome|api$|mixins$|layout$|animations$|generator$|icons$|components(?:\/|$))/;

function detectNamespaces(src, extra) {
  const ns = new Set(extra);
  for (const m of src.matchAll(/@use\s+['"]([^'"]+)['"]\s+as\s+([a-zA-Z][\w-]*)/g)) {
    if (CIA_SOURCE.test(m[1])) ns.add(m[2]);
  }
  // `@use 'css-is-awesome/api';` without `as` → namespace is the last segment.
  for (const m of src.matchAll(/@use\s+['"]([^'"]+)['"]\s*;/g)) {
    if (CIA_SOURCE.test(m[1])) ns.add(m[1].split('/').pop().replace(/\.scss$/, ''));
  }
  return ns;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

// A hex inside a `var(--token, #hex)` fallback is token-driven, not a hard-coded
// color — that's the correct pattern (token first, literal only if unset).
// Strip var() expressions innermost-first so nested fallbacks
// (`var(--a, var(--b, #fff))`) collapse too, leaving only genuine literals.
function stripVarExpr(src) {
  let prev;
  let s = src;
  do {
    prev = s;
    s = s.replace(/var\([^()]*\)/g, '');
  } while (s !== prev);
  return s;
}

// Literals inside an @media print block are intentional: print deliberately
// escapes theme colours (ink-on-white for legibility, grays for rules) so a
// hard-coded #000/#fff there is correct, not a smell. Remove print @media
// blocks — brace-balanced, so nested selectors are handled — before the
// hard-coded-color scan. Non-print @media queries are kept and still scanned.
function stripPrintBlocks(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf('@media', i);
    if (at === -1) { out += src.slice(i); break; }
    const braceOpen = src.indexOf('{', at);
    if (braceOpen === -1) { out += src.slice(i); break; }
    out += src.slice(i, at);
    let depth = 0;
    let j = braceOpen;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}' && --depth === 0) { j++; break; }
    }
    if (!/\bprint\b/.test(src.slice(at + 6, braceOpen))) out += src.slice(at, j);
    i = j;
  }
  return out;
}

// Reference-scale hints for the off-scale-length rule. Sourced from Sketchbook
// (public/themes/sketchbook/theme.css) — CONTRACT.md's own designated
// "reference implementation." These are HINTS, not a value guarantee: real
// themes intentionally diverge (Terminal flattens every --radius-* to 0), so
// a suggestion names the nearest named STEP, never asserts the consumer's
// active theme actually holds this exact pixel value.
const SCALE_HINTS = [
  { token: '--radius-sm', px: 2 },
  { token: '--radius-md', px: 3 },
  { token: '--radius-lg', px: 6 },
  { token: '--radius-xl', px: 12 },
  { token: '--radius-full', px: 9999 },
  { token: '--space-1', px: 8 },
  { token: '--space-2', px: 12 },
  { token: '--space-3', px: 14 },
  { token: '--space-4', px: 16 },
  { token: '--space-5', px: 24 },
  { token: '--space-6', px: 32 },
  { token: '--space-7', px: 48 },
  { token: '--space-8', px: 64 },
  { token: '--space-9', px: 96 },
];
const LENGTH_PROP_RE = /(?:^|[{;\s])(border-radius|padding|margin|gap)\s*:\s*([^;{}]+);/g;

// "7px" / "0.75rem" -> px, or null if not a plain single-value length
// (percentages, calc(), keywords like "auto" are left alone — out of scope).
function parseLengthPx(raw) {
  const m = /^(-?\d*\.?\d+)(px|rem)$/.exec(raw.trim());
  if (!m) return null;
  return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
}

// off-scale-length: a literal border-radius/padding/margin/gap value that's
// close to a scale step — almost certainly meant to be that token. Values
// already routed through var() (with or without a literal fallback) were
// stripped by the caller, so only genuine literals reach here. `0` is never
// flagged: it's unambiguous and a legitimate theme choice in its own right
// (Terminal sets every --radius-* to 0) — flagging it would be a guaranteed
// false positive for exactly that theme's consumers.
function offScaleLength(varStrippedSrc) {
  const findings = [];
  for (const m of varStrippedSrc.matchAll(LENGTH_PROP_RE)) {
    const prop = m[1];
    for (const tok of m[2].trim().split(/\s+/)) {
      if (tok === '0' || tok === '0px' || tok === '0rem') continue;
      const px = parseLengthPx(tok);
      if (px == null || px === 0) continue;
      let best = null;
      let bestDiff = Infinity;
      for (const hint of SCALE_HINTS) {
        const diff = Math.abs(hint.px - px);
        if (diff < bestDiff) { bestDiff = diff; best = hint; }
      }
      if (best && bestDiff > 0 && bestDiff <= 2) {
        findings.push({ level: 'warn', rule: 'off-scale-length', detail: `${prop}: ${tok} — close to the reference scale's ${best.token}; consider the token instead of a literal (exact px varies by theme)` });
      }
    }
  }
  return findings;
}

// missing-focus-visible: a file styles :hover/:active on something
// button/link-shaped but never mentions :focus-visible or focus-ring
// anywhere in the same file — keyboard users likely get no visible
// feedback. File-level co-occurrence, not selector-pairing: SCSS commonly
// nests hover/active under `&` while focus-ring is set once for the whole
// component elsewhere in the file (see scss/components/_buttons.scss),
// so per-selector adjacency would false-positive on that exact shape.
const INTERACTIVE_SHAPE_RE = /(?:^|[^\w-])(?:button|a)(?:[.:#[\s{,]|$)|\[role\s*=\s*["']?button["']?\]|\.[\w-]*btn[\w-]*/i;
const HOVER_ACTIVE_RE = /:(?:hover|active)\b/;
const FOCUS_VISIBLE_RE = /:focus-visible\b|focus-ring/i;

function missingFocusVisible(strippedSrc) {
  if (!HOVER_ACTIVE_RE.test(strippedSrc)) return [];
  if (!INTERACTIVE_SHAPE_RE.test(strippedSrc)) return [];
  if (FOCUS_VISIBLE_RE.test(strippedSrc)) return [];
  return [{ level: 'info', rule: 'missing-focus-visible', detail: 'interactive :hover/:active styling with no :focus-visible or focus-ring anywhere in this file — keyboard users may get no visible feedback' }];
}

function analyzeFile(file, symbols, contractTokens, extraNs) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const src = stripComments(raw);
  const ns = detectNamespaces(src, extraNs);
  const findings = [];
  if (ns.size) {
    const nsPattern = [...ns].map((n) => n.replace(/[-]/g, '\\-')).join('|');
    const callRe = new RegExp(`\\b(?:${nsPattern})\\.([a-zA-Z][\\w-]*)`, 'g');
    for (const m of src.matchAll(callRe)) {
      const sym = m[1];
      if (!symbols.has(sym)) {
        findings.push({ level: 'error', rule: 'unknown-symbol', detail: `cia.${sym} does not exist in the installed API` });
      }
    }
    // space() scale trap: numbered keys are 1–9; higher/fractional numbers
    // pass through raw and silently invalidate the declaration.
    const spaceRe = new RegExp(`\\b(?:${nsPattern})\\.space\\(\\s*(\\d+(?:\\.\\d+)?)\\s*\\)`, 'g');
    for (const m of src.matchAll(spaceRe)) {
      const n = Number(m[1]);
      if (!Number.isInteger(n) || n > 9) {
        findings.push({ level: 'error', rule: 'space-scale', detail: `space(${m[1]}) — the numbered scale is 1–9; this emits a unitless number and the browser drops the declaration. Use grid(n) for 4px multiples or pass an explicit unit.` });
      }
    }
  }
  // off-contract-token: a var(--x) that's a near-miss of a real contract token
  // (a typo → the declaration silently fails). Pure custom tokens — not close to
  // any contract token — are the consumer's own and are left alone.
  if (contractTokens && contractTokens.size) {
    const seen = new Set();
    for (const m of src.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const tok = m[1];
      if (contractTokens.has(tok) || seen.has(tok)) continue;
      seen.add(tok);
      let best = null;
      let bestD = Infinity;
      for (const known of contractTokens) {
        const d = editDistance(tok, known);
        if (d < bestD) { bestD = d; best = known; }
      }
      if (best && bestD > 0 && bestD <= 2) {
        findings.push({ level: 'warn', rule: 'off-contract-token', detail: `${tok} — not a contract token; did you mean ${best}?` });
      }
    }
  }
  // Genuine literal colors only — a hex used as a var() fallback is token-driven,
  // and a hex inside @media print is an intentional paper colour.
  for (const m of stripVarExpr(stripPrintBlocks(src)).matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) {
    findings.push({ level: 'warn', rule: 'hard-coded-color', detail: `${m[0]} — values should come from tokens (cia.color(...) / var(--...))` });
  }
  findings.push(...offScaleLength(stripVarExpr(src)));
  findings.push(...missingFocusVisible(src));
  for (const m of src.matchAll(/\.[a-zA-Z][\w]*(?:__|--)[\w-]+/g)) {
    findings.push({ level: 'warn', rule: 'bem', detail: `${m[0]} — BEM chains are forbidden; use semantic single-class names` });
  }
  if (/(?:^|[{;\s])grid-template-areas\s*:/m.test(src)) {
    findings.push({ level: 'info', rule: 'hand-written-areas', detail: 'grid-template-areas written by hand — the layout mixins (page-layout / layout / area) own the maps' });
  }
  return { file, namespaces: [...ns], findings };
}

// ── report ──────────────────────────────────────────────────────────────────

// Every rule belongs to a category, so the default report reads as a graded
// health check (a section per concern) rather than a flat dump. Categories with
// no findings print a ✓.
const RULE_CATEGORY = {
  'unknown-symbol': 'API',
  'space-scale': 'Spacing',
  'off-contract-token': 'Contract',
  'off-scale-length': 'Spacing',
  'hard-coded-color': 'Color',
  bem: 'Naming',
  'hand-written-areas': 'Layout',
  'missing-focus-visible': 'Accessibility',
};
// The categories with rules implemented today — shown ✓ when clean so a passing
// audit reads as coverage, not silence.
const IMPLEMENTED_CATEGORIES = ['API', 'Contract', 'Spacing', 'Color', 'Naming', 'Layout', 'Accessibility'];

// Details are authored as "claim — suggested fix"; split so the graded report
// can put the fix on its own `→` line.
function splitDetail(detail) {
  const i = detail.indexOf(' — ');
  if (i === -1) return { claim: detail, suggestion: '' };
  return { claim: detail.slice(0, i), suggestion: detail.slice(i + 3) };
}

const LEVEL_MARK = { error: '✗', warn: '⚠', info: 'ℹ' };

async function run(args) {
  if (args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    process.stdout.write(HELP);
    return;
  }
  const json = args.includes('--json');
  const strict = args.includes('--strict');
  const verbose = args.includes('--verbose');
  const nsFlag = args.indexOf('--namespace');
  const extraNs = nsFlag !== -1 && args[nsFlag + 1] ? args[nsFlag + 1].split(',') : [];
  const target = path.resolve(args.find((a) => !a.startsWith('--') && a !== extraNs.join(',')) || '.');

  if (!fs.existsSync(target)) {
    process.stderr.write(`cia analyze: path not found: ${target}\n`);
    process.exit(1);
  }

  const symbols = collectSymbols();
  const contractTokens = loadContractTokens();
  const files = walkScss(target);
  const results = files.map((f) => analyzeFile(f, symbols, contractTokens, extraNs)).filter((r) => r.findings.length || r.namespaces.length);

  const counts = { error: 0, warn: 0, info: 0 };
  for (const r of results) for (const f of r.findings) counts[f.level]++;
  const ciaFiles = results.filter((r) => r.namespaces.length).length;
  const health = Math.max(0, 100 - counts.error * 10 - counts.warn * 2 - counts.info);

  // Enrich every finding with its category and a split-out suggestion — additive
  // fields, so `--json` consumers of counts/health/results keep working.
  for (const r of results) {
    for (const f of r.findings) {
      f.category = RULE_CATEGORY[f.rule] || 'Other';
      const { suggestion } = splitDetail(f.detail);
      if (suggestion) f.suggestion = suggestion;
    }
  }

  const rel = path.relative(process.cwd(), target) || '.';
  const out = (s) => process.stdout.write(s);

  if (json) {
    out(JSON.stringify({ target, files: files.length, ciaFiles, apiSymbols: symbols.size, counts, health, results }, null, 2) + '\n');
  } else if (verbose) {
    // The per-file listing — every finding under its file, unabridged.
    out(`\ncia analyze — ${rel}\n`);
    out(`${files.length} scss file(s), ${ciaFiles} using cia, ${symbols.size} API symbols known\n\n`);
    for (const r of results) {
      if (!r.findings.length) continue;
      out(`${path.relative(process.cwd(), r.file)}\n`);
      for (const f of r.findings) {
        out(`  ${LEVEL_MARK[f.level]} [${f.rule}] ${f.detail}\n`);
      }
    }
    out(`\nDesign-system health: ${health}%  (${counts.error} error, ${counts.warn} warn, ${counts.info} info)\n`);
  } else {
    // The graded report — a section per category, ✓ when clean, each finding
    // with its file and a suggested fix on its own line.
    const all = [];
    for (const r of results) {
      for (const f of r.findings) all.push({ ...f, file: path.relative(process.cwd(), r.file) });
    }
    const extraCats = [...new Set(all.map((f) => f.category))].filter((c) => !IMPLEMENTED_CATEGORIES.includes(c));
    const cats = [...IMPLEMENTED_CATEGORIES, ...extraCats];

    out(`\ncia analyze — ${rel}\n`);
    out(`${files.length} scss file(s) · ${ciaFiles} using cia · ${symbols.size} API symbols\n\n`);
    out(`Design-system health: ${health}/100\n\n`);

    for (const cat of cats) {
      const items = all.filter((f) => f.category === cat);
      if (!items.length) {
        out(`  ${cat.padEnd(9)} ✓\n`);
        continue;
      }
      const worst = items.some((i) => i.level === 'error') ? 'error' : items.some((i) => i.level === 'warn') ? 'warn' : 'info';
      out(`  ${cat.padEnd(9)} ${LEVEL_MARK[worst]} ${items.length}\n`);
      for (const it of items) {
        out(`    ${LEVEL_MARK[it.level]} ${it.file}  ${it.suggestion ? it.claim ?? splitDetail(it.detail).claim : it.detail}\n`);
        if (it.suggestion) out(`       → ${it.suggestion}\n`);
      }
    }

    const tally = `${counts.error} error · ${counts.warn} warn · ${counts.info} info`;
    out(`\n${tally}${counts.error || counts.warn || counts.info ? ' · run with --verbose for the per-file list' : ''}\n`);
  }

  if (counts.error > 0 || (strict && counts.warn > 0)) process.exit(1);
}

module.exports = { run };
