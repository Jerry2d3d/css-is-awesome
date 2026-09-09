#!/usr/bin/env node
// ============================================================================
// audit-logical-properties.mjs
// ============================================================================
// Scans scss/**/*.scss (excluding scss/themes/ — themes are token-only, no
// component CSS) for physical-direction CSS that should almost always be a
// logical property instead: margin-left/-right, padding-left/-right,
// border-left/-right, text-align: left/right, and bare left:/right:.
//
// A line intentionally kept physical (e.g. a Tier-1 utility class whose own
// name IS the physical direction, like .cia-ml-md, or a background-position
// that has no reliable logical-keyword equivalent) is annotated inline with
// `// cia-rtl-allow: <reason>` and skipped, not silently ignored — the
// annotation is the record of why.
//
// Usage: node scripts/audit-logical-properties.mjs
// Exit 1 if any unannotated violation is found (CI-gating, v1.2 EPIC-01 F1.1).
// ============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCSS_DIR = resolve(ROOT, 'scss');

function walkScss(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'themes') continue; // token-only, no component CSS
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkScss(full, out);
    else if (entry.name.endsWith('.scss')) out.push(full);
  }
  return out;
}

// [pattern, suggested fix text]
const RULES = [
  [/\bmargin-left\s*:/, 'margin-inline-start'],
  [/\bmargin-right\s*:/, 'margin-inline-end'],
  [/\bpadding-left\s*:/, 'padding-inline-start'],
  [/\bpadding-right\s*:/, 'padding-inline-end'],
  [/\bborder-left\b\s*:/, 'border-inline-start'],
  [/\bborder-right\b\s*:/, 'border-inline-end'],
  [/\btext-align\s*:\s*left\b/, 'text-align: start'],
  [/\btext-align\s*:\s*right\b/, 'text-align: end'],
  // Bare left:/right: (positioning) — only at a declaration position, not
  // inside a word (e.g. "overflow:" won't match, "left:" as a value key
  // will). Deliberately conservative: requires the property to start the
  // trimmed line, same shape as a real declaration.
  [/(?:^|[{;])\s*left\s*:/, 'inset-inline-start'],
  [/(?:^|[{;])\s*right\s*:/, 'inset-inline-end'],
];

const ALLOW_RE = /cia-rtl-allow\s*:\s*(.+)$/;

function auditFile(file) {
  const raw = readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip a line comment for pattern matching, but keep the raw line to
    // check for a trailing cia-rtl-allow annotation (which itself lives in
    // a // comment, so must be checked against the UNSTRIPPED line).
    const codePart = line.replace(/\/\/.*$/, '');
    const allowed = ALLOW_RE.exec(line);
    for (const [re, fix] of RULES) {
      if (re.test(codePart)) {
        if (allowed) break; // annotated — record nothing, skip this line
        findings.push({ line: i + 1, text: line.trim(), fix });
        break; // one finding per line is enough
      }
    }
  }
  return findings;
}

const files = walkScss(SCSS_DIR);
let total = 0;
const byFile = [];

for (const file of files) {
  const findings = auditFile(file);
  if (findings.length) {
    byFile.push({ file: relative(ROOT, file), findings });
    total += findings.length;
  }
}

if (total === 0) {
  console.log(`audit-logical-properties — OK, 0 unannotated violations across ${files.length} files`);
  process.exit(0);
}

console.log(`audit-logical-properties — ${total} unannotated violation(s):\n`);
for (const { file, findings } of byFile) {
  console.log(file);
  for (const f of findings) {
    console.log(`  ${f.line}: ${f.text}`);
    console.log(`     → ${f.fix}, or annotate the line with // cia-rtl-allow: <reason>`);
  }
}
process.exit(1);
