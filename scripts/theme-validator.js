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
 * Two file shapes are supported transparently:
 *
 *   1. PER-FILE (legacy, still used for public/themes/*\/theme.css
 *      and any user-authored theme): one or more `:root { ... }`
 *      blocks. Each block contributes tokens to a single set;
 *      the file passes when that set covers every required token.
 *
 *   2. CONSOLIDATED: one file with multiple
 *      `[data-theme="<name>"] { ... }` blocks (plus an optional
 *      `:root:not([data-theme])` fallback). Each data-theme block
 *      is validated as its own theme; the file passes only when
 *      every block declares every required token. This is the
 *      shape of the root `public/theme.css` under Path A.
 *
 *   Detection is automatic — if at least one `[data-theme="..."]`
 *   selector is present, the file is treated as consolidated.
 *
 * Exit codes:
 *   0  — every validated file / block declares every required token
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
// Helper — strip block comments so comment-shaped `--foo: bar;`
// inside a comment (docs example) isn't counted.
// -----------------------------------------------------------
function stripBlockComments(cssText) {
  return cssText.replace(/\/\*[\s\S]*?\*\//g, '');
}

// -----------------------------------------------------------
// Helper — match a balanced `{ ... }` block starting AT `openIdx`
// where stripped[openIdx] === '{'. Returns the body (contents
// between the braces) plus the index of the closing brace, or
// null if the braces aren't balanced.
// -----------------------------------------------------------
function readBracedBlock(stripped, openIdx) {
  if (stripped[openIdx] !== '{') return null;
  let depth = 1;
  let k = openIdx + 1;
  while (k < stripped.length && depth > 0) {
    const ch = stripped[k];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) break;
    k++;
  }
  if (depth !== 0) return null;
  return { body: stripped.slice(openIdx + 1, k), end: k };
}

// -----------------------------------------------------------
// Helper — extract every top-level `--name:` declaration from a
// block body into a Set of token names.
// -----------------------------------------------------------
function collectTokensFromBlock(blockBody) {
  const declRe = /(^|[{;\s])(--[A-Za-z_][A-Za-z0-9_-]*)\s*:/g;
  const out = new Set();
  let m;
  while ((m = declRe.exec(blockBody)) !== null) {
    out.add(m[2]);
  }
  return out;
}

// -----------------------------------------------------------
// Parser — extract `--token-name` declarations from any :root
// block(s) in the file. Values don't matter, only names.
//
// KEPT for backward compatibility: other scripts may import this
// module via require() and rely on the old function name/shape.
// -----------------------------------------------------------
function extractDeclaredTokens(cssText) {
  const stripped = stripBlockComments(cssText);
  const tokens = new Set();

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
      // Not a block — skip past this occurrence.
      i = rootIdx + ':root'.length;
      continue;
    }

    const block = readBracedBlock(stripped, j);
    if (!block) {
      i = j + 1;
      continue;
    }

    for (const tok of collectTokensFromBlock(block.body)) {
      tokens.add(tok);
    }
    i = block.end + 1;
  }

  return tokens;
}

// -----------------------------------------------------------
// Parser — find every `[data-theme="<name>"] ... { ... }` block
// (possibly preceded or followed by other comma-separated
// selectors on the same rule) and return them as
// { name, tokens: Set<string> } entries in source order.
//
// Rules whose selector list includes `[data-theme="<name>"]`
// contribute their tokens to that name. A rule may carry
// multiple data-theme selectors (rare, but supported) — in
// that case the tokens are counted toward each named theme.
// -----------------------------------------------------------
function extractDataThemeBlocks(cssText) {
  const stripped = stripBlockComments(cssText);
  const blocks = [];
  const order = []; // preserves first-seen order of theme names
  const byName = new Map();

  let i = 0;
  while (i < stripped.length) {
    // Find the next `{` — the block-opener — then look BACKWARDS
    // for its selector list (up to the previous `}` or start).
    const braceIdx = stripped.indexOf('{', i);
    if (braceIdx === -1) break;

    // Find the start of this rule's selector list. The selector
    // starts after the previous `}` (or `;` at top level, for
    // @import etc.) or at position 0.
    let selStart = braceIdx - 1;
    while (selStart >= 0) {
      const ch = stripped[selStart];
      if (ch === '}' || ch === ';') {
        selStart++;
        break;
      }
      selStart--;
    }
    if (selStart < 0) selStart = 0;

    const selector = stripped.slice(selStart, braceIdx);

    const block = readBracedBlock(stripped, braceIdx);
    if (!block) break;

    // Find every [data-theme="<name>"] occurrence in this rule's
    // selector list. A rule can have multiple (e.g. grouped).
    const nameRe = /\[data-theme\s*=\s*["']([^"']+)["']\s*\]/g;
    const names = [];
    let nm;
    while ((nm = nameRe.exec(selector)) !== null) {
      names.push(nm[1]);
    }

    if (names.length > 0) {
      const blockTokens = collectTokensFromBlock(block.body);
      for (const name of names) {
        if (!byName.has(name)) {
          byName.set(name, new Set());
          order.push(name);
        }
        const set = byName.get(name);
        for (const t of blockTokens) set.add(t);
      }
    }

    i = block.end + 1;
  }

  for (const name of order) {
    blocks.push({ name, tokens: byName.get(name) });
  }
  return blocks;
}

// -----------------------------------------------------------
// Detect whether a file is the consolidated [data-theme] shape.
// Any occurrence of `[data-theme=` in the (comment-stripped)
// source is enough to switch modes.
// -----------------------------------------------------------
function isConsolidated(cssText) {
  const stripped = stripBlockComments(cssText);
  return /\[data-theme\s*=\s*["']/.test(stripped);
}

// -----------------------------------------------------------
// Validate a single theme block (used in both modes)
// -----------------------------------------------------------
function validateTokenSet(declared, contract) {
  const missing = [];
  for (const required of contract.required) {
    if (!declared.has(required)) missing.push(required);
  }
  return { ok: missing.length === 0, missing, declaredCount: declared.size };
}

// -----------------------------------------------------------
// Validate a single file. Auto-detects per-file vs consolidated.
// Returns a unified result shape with either a flat pass/fail
// (per-file) or a list of per-theme pass/fails (consolidated).
// -----------------------------------------------------------
function validateFile(filePath, contract) {
  const result = {
    file: filePath,
    mode: 'per-file',
    ok: false,
    declaredCount: 0,
    missing: [],
    themes: null, // populated only in consolidated mode
    error: null,
  };

  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    result.error = err.message;
    return result;
  }

  if (isConsolidated(text)) {
    result.mode = 'consolidated';
    const blocks = extractDataThemeBlocks(text);

    if (blocks.length === 0) {
      // Detected the attribute but couldn't pull a named block —
      // this is a malformed consolidated file.
      result.error =
        'consolidated file has no [data-theme="<name>"] blocks we could parse';
      return result;
    }

    result.themes = blocks.map(({ name, tokens }) => {
      const v = validateTokenSet(tokens, contract);
      return {
        name,
        ok: v.ok,
        declaredCount: v.declaredCount,
        missing: v.missing,
      };
    });
    result.ok = result.themes.every((t) => t.ok);
    return result;
  }

  // Legacy per-file mode — union of all :root { ... } blocks.
  const declared = extractDeclaredTokens(text);
  const v = validateTokenSet(declared, contract);
  result.declaredCount = v.declaredCount;
  result.missing = v.missing;
  result.ok = v.ok;
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
    console.log(`${red('x')} ${bold(rel)} ${red('— could not read / parse file')}`);
    console.log(`    ${dim(result.error)}`);
    return;
  }

  if (result.mode === 'consolidated') {
    const header = result.ok
      ? `${green('✓')} ${bold(rel)} ${dim(`consolidated — ${result.themes.length} theme block(s)`)}`
      : `${red('x')} ${bold(rel)} ${red('— consolidated, one or more theme blocks failed')}`;
    console.log(header);

    for (const t of result.themes) {
      if (t.ok) {
        console.log(
          `    ${green('✓')} [data-theme="${t.name}"] ${dim(`(${t.declaredCount} tokens)`)}`
        );
      } else {
        const n = t.missing.length;
        console.log(
          `    ${red('x')} [data-theme="${t.name}"] ${red(`— ${n} missing:`)}`
        );
        for (const token of t.missing) {
          console.log(`        ${red(token)}`);
        }
      }
    }
    return;
  }

  // per-file mode
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
    'Each input file is auto-detected as:',
    '  per-file     — one or more `:root { ... }` blocks (legacy)',
    '  consolidated — contains `[data-theme="<name>"] { ... }` blocks;',
    '                 every block must satisfy the contract.',
    '',
    'Exit codes:',
    '  0  all validated files / blocks declare every required token',
    '  1  one or more files/blocks missing tokens',
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
  let themeBlocksCounted = 0;
  for (const f of files) {
    const r = validateFile(f, contract);
    reportResult(r);
    if (!r.ok || r.error) hadFailure = true;
    if (r.mode === 'consolidated' && r.themes) {
      themeBlocksCounted += r.themes.length;
    } else if (!r.error) {
      themeBlocksCounted += 1;
    }
  }

  console.log('');
  if (hadFailure) {
    console.log(red(bold('FAIL')) + dim(` — one or more theme files/blocks are incomplete`));
    process.exit(1);
  }
  console.log(
    green(bold('OK')) +
      dim(
        ` — ${files.length} file(s) / ${themeBlocksCounted} theme block(s) validated`
      )
  );
  process.exit(0);
}

// -----------------------------------------------------------
// Module exports — some scripts may require() this file. Keep
// the historical name (`extractDeclaredTokens`) plus the new
// consolidated helpers.
// -----------------------------------------------------------
module.exports = {
  extractDeclaredTokens,
  extractDataThemeBlocks,
  isConsolidated,
  validateFile,
  loadContract,
};

if (require.main === module) {
  main(process.argv);
}
