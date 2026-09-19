/**
 * cia theme from-tokens — design-tokens JSON → validated cia theme.css.
 *
 * The CLI face of scripts/tokens-to-theme.cjs (the MCP tool
 * `theme_from_tokens` and the in-process `handlers.theme_from_tokens` are the
 * same function). Zero dependencies, no Sass: the theme is emitted as CSS in
 * the exact shape the shipped themes use, then the shipped validator + WCAG
 * audit run on it before anything is written.
 *
 * Exit codes: 0 valid (or --no-validate), 1 contract/a11y failure (a11y only
 * unless --allow-a11y-fail), 2 usage / input error.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const HELP = `cia theme from-tokens — design-tokens JSON → validated cia theme.css

Usage:
  cia theme from-tokens <tokens.json> --name <slug> [options]

Options:
  --name <slug>        Theme name (kebab-case). Required.
  --format <f>         auto | dtcg | tokens-studio | cia-flat   (default: auto)
  --base <theme>       Shipped theme that supplies every REQUIRED token the file
                       does not (default: boilerplate). \`--base list\` prints them.
  --dark <dark.json>   Second tokens file for dark mode → light-dark() values.
  --mode light|dark    Single-mode color-scheme when no dark side (default: light).
  --out <theme.css>    Write the CSS here (default: stdout).
  --json               Print { report, validation } as JSON to stdout
                       (CSS goes to --out only).
  --no-validate        Skip the validator + WCAG audit.
  --allow-a11y-fail    Do not exit non-zero on a11y FAILs (report only).

Formats:
  dtcg           DTCG v2025.10 — leaves carry $value (+ $type); {aliases} resolve.
  tokens-studio  Tokens Studio for Figma — leaves carry value + type; single set
                 or multi-set export ($metadata.tokenSetOrder); {aliases} resolve.
                 Paired top-level groups (color-light + color-dark, or
                 light + dark) become light-dark() automatically.
  cia-flat       { "--brand-primary": "#3A5FCD", ... } passthrough.

Minimum content: none. Whatever the file does not supply is inherited from the
base theme and listed in the report, so the output is always contract-complete.

Examples:
  cia theme from-tokens tokens.json --name acme --out src/styles/acme.css
  cia theme from-tokens light.json --dark dark.json --name acme --json
  cia theme from-tokens brand.json --name acme --base press --format dtcg
`;

function parseArgs(argv) {
  const opts = { format: 'auto', base: 'boilerplate', mode: 'light', validate: true, allowA11yFail: false, json: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { const v = argv[++i]; if (v === undefined) throw new Error(`${a} needs a value`); return v; };
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--name') opts.name = next();
    else if (a === '--format') opts.format = next();
    else if (a === '--base') opts.base = next();
    else if (a === '--dark') opts.dark = next();
    else if (a === '--mode') opts.mode = next();
    else if (a === '--out') opts.out = next();
    else if (a === '--json') opts.json = true;
    else if (a === '--no-validate') opts.validate = false;
    else if (a === '--allow-a11y-fail') opts.allowA11yFail = true;
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else positional.push(a);
  }
  opts.input = positional[0];
  return opts;
}

function readJson(file) {
  const abs = path.resolve(file);
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch (e) { throw new Error(`cannot read ${file}: ${e.message}`); }
  try { return JSON.parse(text); } catch (e) { throw new Error(`${file} is not valid JSON: ${e.message}`); }
}

async function run(argv) {
  let opts;
  try { opts = parseArgs(argv); } catch (e) { process.stderr.write(`cia theme: ${e.message}\n`); process.exit(2); }
  if (opts.help || !opts.input && opts.base !== 'list') { process.stdout.write(HELP); return; }

  const { themeFromTokens, listBases } = require('../scripts/tokens-to-theme.cjs');
  if (opts.base === 'list') { process.stdout.write(listBases(path.join(__dirname, '..')).join('\n') + '\n'); return; }
  if (!opts.name) { process.stderr.write('cia theme: --name <slug> is required\n'); process.exit(2); }

  let result;
  try {
    result = themeFromTokens({
      tokens: readJson(opts.input),
      dark: opts.dark ? readJson(opts.dark) : undefined,
      name: opts.name,
      format: opts.format,
      base: opts.base,
      mode: opts.mode,
      validate: opts.validate,
    });
  } catch (e) {
    process.stderr.write(`cia theme: ${e.message}\n`);
    process.exit(2);
  }

  const { css, report, validation } = result;
  if (opts.out) fs.writeFileSync(path.resolve(opts.out), css, 'utf8');

  if (opts.json) {
    process.stdout.write(JSON.stringify({ report, validation, out: opts.out || null }, null, 2) + '\n');
  } else {
    if (!opts.out) process.stdout.write(css);
    const c = report.counts;
    const lines = [
      `theme "${report.name}" — ${report.format}${report.darkMode ? ' (light + dark)' : ''} · base ${report.base}`,
      `  from tokens   ${c.fromTokens}`,
      `  inherited     ${c.inherited}   (required tokens the file did not supply)`,
      `  passthrough   ${c.unmapped}   (not contract tokens — emitted verbatim)`,
      c.skipped ? `  skipped       ${c.skipped}   (composite values with no single-token home)` : null,
      opts.out ? `  written       ${opts.out}` : null,
    ].filter(Boolean);
    process.stderr.write(lines.join('\n') + '\n');
    if (validation) {
      const { reportResult, reportA11yForTheme } = require('../scripts/theme-validator.js');
      reportResult(validation);
      const themes = validation.mode === 'consolidated' ? validation.themes : [{ name: report.name, a11y: validation.a11y }];
      for (const t of themes) if (t.a11y) reportA11yForTheme(t.name, t.a11y, '    ');
    }
  }

  if (validation) {
    const a11yFail = validation.a11ySummary ? validation.a11ySummary.fail : 0;
    if (!validation.ok) process.exit(1);
    if (a11yFail && !opts.allowA11yFail) process.exit(1);
  }
}

module.exports = { run, parseArgs, HELP };
