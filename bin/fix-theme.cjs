/**
 * cia fix-theme — rewrite a theme's deprecated tokens to their replacements.
 *
 * The CLI face of scripts/fix-theme.cjs (the MCP tool `fix_theme` and the
 * in-process `handlers.fix_theme` are the same function). cia deprecates a
 * token rather than deleting it, so the old declaration keeps working — this
 * is the one command that moves you onto the current name.
 *
 * Only the property name changes. Values, comments, ordering and whitespace
 * survive byte-for-byte, so applying this cannot alter how the theme looks.
 *
 * Reads and prints by default; writes only with --write.
 *
 * Exit codes: 0 nothing to do or fixed, 1 collisions need a human, 2 usage /
 * input error.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HELP = `cia fix-theme — move a theme onto current token names

Usage:
  cia fix-theme <theme.css> [options]

Options:
  --write        Apply the changes to the file (default: print, change nothing)
  --json         Machine-readable { css, changes, unchanged, summary }
  -h, --help     This text

What it does:
  cia deprecates a token instead of deleting it, so your existing declaration
  keeps working. This renames it to the replacement the contract names. Only
  the property name moves — the value, your comments, the ordering and the
  whitespace are untouched, so the rendered theme is identical.

  If a block already declares the replacement, that line is left alone and
  reported: merging two values is your decision, not the tool's.

Examples:
  cia fix-theme src/styles/acme.css            # show me what would change
  cia fix-theme src/styles/acme.css --write    # do it
  cia fix-theme src/styles/acme.css --json     # for a script
`;

const isTTY = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (isTTY ? `[${code}m${s}[0m` : s);
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const green = (s) => c('32', s);
const yellow = (s) => c('33', s);
const red = (s) => c('31', s);

function parseArgs(argv) {
  const out = { file: null, write: false, json: false, help: false };
  for (const a of argv) {
    if (a === '--write') out.write = true;
    else if (a === '--json') out.json = true;
    else if (a === '-h' || a === '--help' || a === 'help') out.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown option '${a}'`);
    else if (out.file == null) out.file = a;
    else throw new Error(`unexpected extra argument '${a}'`);
  }
  return out;
}

async function run(argv) {
  let args;
  try {
    args = parseArgs(argv || []);
  } catch (err) {
    process.stderr.write(`${red('error:')} ${err.message}\n\n${HELP}`);
    process.exitCode = 2;
    return;
  }
  if (args.help || !args.file) {
    process.stdout.write(HELP);
    if (!args.help) process.exitCode = 2;
    return;
  }

  const abs = path.resolve(args.file);
  let css;
  try {
    css = fs.readFileSync(abs, 'utf8');
  } catch (err) {
    process.stderr.write(`${red('error:')} could not read ${args.file} — ${err.message}\n`);
    process.exitCode = 2;
    return;
  }

  const { fixTheme } = require(path.join(__dirname, '..', 'scripts', 'fix-theme.cjs'));
  let result;
  try {
    result = fixTheme({ css });
  } catch (err) {
    process.stderr.write(`${red('error:')} ${err.message}\n`);
    process.exitCode = 2;
    return;
  }

  const rewrites = result.changes.filter((x) => x.kind === 'rewrite');
  const conflicts = result.changes.filter((x) => x.kind === 'conflict');

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        { file: args.file, written: args.write && rewrites.length > 0, ...result },
        null,
        2
      ) + '\n'
    );
  } else {
    const rel = path.relative(process.cwd(), abs) || args.file;
    if (!result.changes.length) {
      process.stdout.write(`${green('✓')} ${bold(rel)} ${dim('— no deprecated tokens; already current')}\n`);
      return;
    }
    process.stdout.write(`${bold(rel)}\n`);
    for (const ch of rewrites) {
      process.stdout.write(`  ${green('→')} line ${ch.line}: ${ch.from} ${dim('→')} ${bold(ch.to)}\n`);
      process.stdout.write(`      ${dim(ch.reason)}\n`);
    }
    for (const ch of conflicts) {
      process.stdout.write(`  ${yellow('!')} line ${ch.line}: ${ch.from} ${dim('left as-is')}\n`);
      process.stdout.write(`      ${dim(ch.reason)}\n`);
    }
  }

  if (args.write && rewrites.length) {
    try {
      fs.writeFileSync(abs, result.css);
    } catch (err) {
      process.stderr.write(`${red('error:')} could not write ${args.file} — ${err.message}\n`);
      process.exitCode = 2;
      return;
    }
    if (!args.json) {
      process.stdout.write(`\n${green('✓')} wrote ${rewrites.length} change(s) to ${bold(path.relative(process.cwd(), abs) || args.file)}\n`);
    }
  } else if (rewrites.length && !args.json) {
    process.stdout.write(`\n${dim('nothing written — re-run with --write to apply')}\n`);
  }

  // Collisions are the one case a human has to settle, so say so in the exit
  // code too: a pipeline should stop rather than assume the theme is current.
  if (conflicts.length) process.exitCode = 1;
}

module.exports = { run, parseArgs, HELP };
