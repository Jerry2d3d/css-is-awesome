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

const HELP = `cia analyze — design-system health check

Usage:
  cia analyze [path] [options]

Scans [path] (default: current directory) for *.scss files and audits
them against the installed css-is-awesome API.

Options:
  --namespace <ns>   Extra namespace(s) to treat as cia (comma-separated).
                     Auto-detected per file from @use lines; use this when
                     imports are aliased through an intermediate file.
  --json             Machine-readable report on stdout.
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

function analyzeFile(file, symbols, extraNs) {
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
  for (const m of src.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) {
    findings.push({ level: 'warn', rule: 'hard-coded-color', detail: `${m[0]} — values should come from tokens (cia.color(...) / var(--...))` });
  }
  for (const m of src.matchAll(/\.[a-zA-Z][\w]*(?:__|--)[\w-]+/g)) {
    findings.push({ level: 'warn', rule: 'bem', detail: `${m[0]} — BEM chains are forbidden; use semantic single-class names` });
  }
  if (/(?:^|[{;\s])grid-template-areas\s*:/m.test(src)) {
    findings.push({ level: 'info', rule: 'hand-written-areas', detail: 'grid-template-areas written by hand — the layout mixins (page-layout / layout / area) own the maps' });
  }
  return { file, namespaces: [...ns], findings };
}

// ── report ──────────────────────────────────────────────────────────────────

async function run(args) {
  if (args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    process.stdout.write(HELP);
    return;
  }
  const json = args.includes('--json');
  const strict = args.includes('--strict');
  const nsFlag = args.indexOf('--namespace');
  const extraNs = nsFlag !== -1 && args[nsFlag + 1] ? args[nsFlag + 1].split(',') : [];
  const target = path.resolve(args.find((a) => !a.startsWith('--') && a !== extraNs.join(',')) || '.');

  if (!fs.existsSync(target)) {
    process.stderr.write(`cia analyze: path not found: ${target}\n`);
    process.exit(1);
  }

  const symbols = collectSymbols();
  const files = walkScss(target);
  const results = files.map((f) => analyzeFile(f, symbols, extraNs)).filter((r) => r.findings.length || r.namespaces.length);

  const counts = { error: 0, warn: 0, info: 0 };
  for (const r of results) for (const f of r.findings) counts[f.level]++;
  const ciaFiles = results.filter((r) => r.namespaces.length).length;
  const health = Math.max(0, 100 - counts.error * 10 - counts.warn * 2 - counts.info);

  if (json) {
    process.stdout.write(JSON.stringify({ target, files: files.length, ciaFiles, apiSymbols: symbols.size, counts, health, results }, null, 2) + '\n');
  } else {
    process.stdout.write(`\ncia analyze — ${path.relative(process.cwd(), target) || '.'}\n`);
    process.stdout.write(`${files.length} scss file(s), ${ciaFiles} using cia, ${symbols.size} API symbols known\n\n`);
    for (const r of results) {
      if (!r.findings.length) continue;
      process.stdout.write(`${path.relative(process.cwd(), r.file)}\n`);
      for (const f of r.findings) {
        const mark = f.level === 'error' ? '✗' : f.level === 'warn' ? '⚠' : 'ℹ';
        process.stdout.write(`  ${mark} [${f.rule}] ${f.detail}\n`);
      }
    }
    process.stdout.write(`\nDesign-system health: ${health}%  (${counts.error} error, ${counts.warn} warn, ${counts.info} info)\n`);
  }

  if (counts.error > 0 || (strict && counts.warn > 0)) process.exit(1);
}

module.exports = { run };
