#!/usr/bin/env node
/* eslint-disable */
/**
 * theme-validator.js
 * --------------------------------------------------------------
 * Validates a theme.css against the token contract in
 * scripts/theme-contract.json. Exits non-zero if any required
 * custom property is missing.
 *
 * Zero runtime dependencies — pure fs/path/process.
 *
 * Usage:
 *   node scripts/theme-validator.js <path-to-theme.css> [more-paths...]
 *   node scripts/theme-validator.js --all
 *
 * Exit codes:
 *   0  — every validated file declares every required token
 *   1  — one or more files are missing tokens
 *   2  — usage error (file not found, bad args, bad contract)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------
// Paths
// -----------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(__dirname, 'theme-contract.json');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const THEMES_DIR = path.join(PUBLIC_DIR, 'themes');
const ROOT_THEME = path.join(PUBLIC_DIR, 'theme.css');

// -----------------------------------------------------------
// ANSI coloring — only when stdout is a TTY
// -----------------------------------------------------------
const USE_COLOR = Boolean(process.stdout.isTTY);
const color = (code, s) => (USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => color('32', s);
const red = (s) => color('31', s);
const dim = (s) => color('2', s);
const bold = (s) => color('1', s);

// -----------------------------------------------------------
// Contract loader
// -----------------------------------------------------------
function loadContract() {
  let raw;
  try {
    raw = fs.readFileSync(CONTRACT_PATH, 'utf8');
  } catch (err) {
    console.error(
      red('error:') +
        ` could not read contract at ${CONTRACT_PATH}\n       ${err.message}`
    );
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(
      red('error:') + ` theme-contract.json is not valid JSON: ${err.message}`
    );
    process.exit(2);
  }
  if (!parsed || !Array.isArray(parsed.required)) {
    console.error(red('error:') + ' theme-contract.json is missing `required` array');
    process.exit(2);
  }
  return parsed;
}

// -----------------------------------------------------------
// File discovery for --all
// -----------------------------------------------------------
function discoverAllThemes() {
  const files = [];
  if (fs.existsSync(ROOT_THEME)) files.push(ROOT_THEME);

  if (fs.existsSync(THEMES_DIR)) {
    for (const entry of fs.readdirSync(THEMES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const themeFile = path.join(THEMES_DIR, entry.name, 'theme.css');
      if (fs.existsSync(themeFile)) files.push(themeFile);
    }
  }

  return files;
}

// -----------------------------------------------------------
// Parser — extract `--token-name` declarations from any :root
// block(s) in the file. Values don't matter, only names.
// -----------------------------------------------------------
function extractDeclaredTokens(cssText) {
  // Strip block comments so comment-shaped `--foo: bar;` inside a
  // comment (docs example) isn't counted.
  const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  const tokens = new Set();

  // Find every `:root { ... }` block. We walk manually to support
  // multiple :root blocks and nested braces (e.g. inside url() or
  // rgba() — unlikely, but cheap to handle).
  let i = 0;
  while (i < stripped.length) {
    const rootIdx = stripped.indexOf(':root', i);
    if (rootIdx === -1) break;

    // Move to the opening brace after `:root`
    let j = rootIdx + ':root'.length;
    while (j < stripped.length && stripped[j] !== '{' && stripped[j] !== ';') {
      j++;
    }
    if (j >= stripped.length || stripped[j] !== '{') {
      // Not a block (unusual) — skip past this occurrence.
      i = rootIdx + ':root'.length;
      continue;
    }

    // Match braces
    let depth = 1;
    let k = j + 1;
    while (k < stripped.length && depth > 0) {
      const ch = stripped[k];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth === 0) break;
      k++;
    }

    const block = stripped.slice(j + 1, k);

    // Match only top-level custom property declarations in the block.
    // `--name: value;` — name is [A-Za-z0-9_-]
    const declRe = /(^|[{;\s])(--[A-Za-z_][A-Za-z0-9_-]*)\s*:/g;
    let m;
    while ((m = declRe.exec(block)) !== null) {
      tokens.add(m[2]);
    }

    i = k + 1;
  }

  return tokens;
}

// -----------------------------------------------------------
// Validate a single file
// -----------------------------------------------------------
function validateFile(filePath, contract) {
  const result = {
    file: filePath,
    ok: false,
    declaredCount: 0,
    missing: [],
    error: null,
  };

  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    result.error = err.message;
    return result;
  }

  const declared = extractDeclaredTokens(text);
  result.declaredCount = declared.size;

  for (const required of contract.required) {
    if (!declared.has(required)) result.missing.push(required);
  }

  result.ok = result.missing.length === 0;
  return result;
}

// -----------------------------------------------------------
// Reporter
// -----------------------------------------------------------
function relForDisplay(p) {
  const rel = path.relative(REPO_ROOT, p).split(path.sep).join('/');
  return rel || p;
}

function reportResult(result) {
  const rel = relForDisplay(result.file);

  if (result.error) {
    console.log(`${red('x')} ${bold(rel)} ${red('— could not read file')}`);
    console.log(`    ${dim(result.error)}`);
    return;
  }

  if (result.ok) {
    console.log(
      `${green('✓')} ${bold(rel)} ${dim(`passes (${result.declaredCount} tokens declared)`)}`
    );
    return;
  }

  const n = result.missing.length;
  console.log(
    `${red('x')} ${bold(rel)} ${red(`— ${n} missing:`)}`
  );
  for (const token of result.missing) {
    console.log(`     ${red(token)}`);
  }
}

// -----------------------------------------------------------
// CLI
// -----------------------------------------------------------
function printUsage() {
  const u = [
    'Usage:',
    '  node scripts/theme-validator.js <path-to-theme.css> [more-paths...]',
    '  node scripts/theme-validator.js --all',
    '',
    'Exit codes:',
    '  0  all validated files declare every required token',
    '  1  one or more files missing tokens',
    '  2  usage error (file not found, bad args)',
  ].join('\n');
  console.log(u);
}

function main(argv) {
  const args = argv.slice(2).filter((a) => a !== '--watch'); // watch reserved; not v1
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(args.length === 0 ? 2 : 0);
  }

  const contract = loadContract();

  let files = [];
  if (args.includes('--all')) {
    files = discoverAllThemes();
    if (files.length === 0) {
      console.error(red('error:') + ' --all found no theme files to validate');
      process.exit(2);
    }
  } else {
    for (const a of args) {
      if (a.startsWith('--')) continue; // ignore unknown flags quietly
      const resolved = path.resolve(a);
      if (!fs.existsSync(resolved)) {
        console.error(red('error:') + ` file not found: ${a}`);
        process.exit(2);
      }
      files.push(resolved);
    }
    if (files.length === 0) {
      printUsage();
      process.exit(2);
    }
  }

  console.log(
    dim(
      `theme-validator — contract v${contract.version} (${contract.required.length} required tokens)`
    )
  );
  console.log('');

  let hadFailure = false;
  for (const f of files) {
    const r = validateFile(f, contract);
    reportResult(r);
    if (!r.ok || r.error) hadFailure = true;
  }

  console.log('');
  if (hadFailure) {
    console.log(red(bold('FAIL')) + dim(` — one or more theme files are incomplete`));
    process.exit(1);
  }
  console.log(green(bold('OK')) + dim(` — ${files.length} theme file(s) validated`));
  process.exit(0);
}

main(process.argv);
