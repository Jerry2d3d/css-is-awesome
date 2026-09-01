#!/usr/bin/env node
/* eslint-disable */
/**
 * icon-validator.js
 * --------------------------------------------------------------
 * Validates the bundled icon packs against the contract in
 * scripts/icon-contract.json. Mirrors theme-validator.js: every
 * pack must declare every glyph the contract names; missing files
 * fail CI.
 *
 * Zero runtime dependencies — pure fs/path/process.
 *
 * Usage:
 *   node scripts/icon-validator.js              # validate every pack
 *   node scripts/icon-validator.js core         # validate one pack
 *   node scripts/icon-validator.js --json       # machine-readable
 *
 * What it checks (per pack):
 *   1. public/icons/<pack>/<name>.svg exists for every contract glyph.
 *   2. The file is a real SVG (starts with `<?xml` or `<svg`).
 *
 * What it does NOT check:
 *   - Per-theme override files. Themes opt in by declaring
 *     --cia-icon-<name> in their theme.css; they're never required
 *     to ship overrides.
 *
 * Exit codes:
 *   0  — every required glyph is present
 *   1  — at least one glyph is missing or unreadable
 *   2  — usage error (bad contract, bad args)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(__dirname, 'icon-contract.json');
const ICONS_DIR = path.join(REPO_ROOT, 'public', 'icons');

const USE_COLOR = Boolean(process.stdout.isTTY);
const color = (code, s) => (USE_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => color('32', s);
const red = (s) => color('31', s);
const dim = (s) => color('2', s);
const bold = (s) => color('1', s);

function loadContract() {
  let raw;
  try {
    raw = fs.readFileSync(CONTRACT_PATH, 'utf8');
  } catch (err) {
    console.error(red('error:') + ` could not read ${CONTRACT_PATH}\n       ${err.message}`);
    process.exit(2);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(red('error:') + ` icon-contract.json is not valid JSON: ${err.message}`);
    process.exit(2);
  }
  if (!parsed || !parsed.packs || typeof parsed.packs !== 'object') {
    console.error(red('error:') + ' icon-contract.json missing `packs` object');
    process.exit(2);
  }
  return parsed;
}

function validatePack(packName, packSpec) {
  const packDir = path.join(ICONS_DIR, packName);
  const result = {
    pack: packName,
    dir: packDir,
    glyphsExpected: packSpec.glyphs.length,
    glyphsFound: 0,
    missing: [],
    malformed: [],
  };

  if (!fs.existsSync(packDir)) {
    result.missing = [...packSpec.glyphs];
    return result;
  }

  for (const glyph of packSpec.glyphs) {
    const file = path.join(packDir, `${glyph}.svg`);
    if (!fs.existsSync(file)) {
      result.missing.push(glyph);
      continue;
    }
    let head;
    try {
      head = fs.readFileSync(file, 'utf8').slice(0, 200).trimStart();
    } catch (err) {
      result.malformed.push({ glyph, reason: err.message });
      continue;
    }
    if (!/^<\?xml/.test(head) && !/^<svg/.test(head)) {
      result.malformed.push({ glyph, reason: 'does not start with <?xml or <svg' });
      continue;
    }
    result.glyphsFound++;
  }

  return result;
}

function reportPack(r) {
  const ok = r.missing.length === 0 && r.malformed.length === 0;
  if (ok) {
    console.log(
      `${green('✓')} ${bold('pack:' + r.pack)} ${dim(
        `(${r.glyphsFound}/${r.glyphsExpected} glyphs)`
      )}`
    );
    return;
  }
  console.log(`${red('x')} ${bold('pack:' + r.pack)}`);
  if (r.missing.length > 0) {
    console.log(red(`    missing (${r.missing.length}):`));
    for (const g of r.missing) console.log(`      ${red(g)}`);
  }
  if (r.malformed.length > 0) {
    console.log(red(`    malformed (${r.malformed.length}):`));
    for (const m of r.malformed) console.log(`      ${red(m.glyph)} — ${dim(m.reason)}`);
  }
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/icon-validator.js [pack-name ...]',
      '  node scripts/icon-validator.js --json',
      '',
      'With no args, validates every pack listed in scripts/icon-contract.json.',
    ].join('\n')
  );
}

function main(argv) {
  const args = argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const contract = loadContract();
  const wantJson = args.includes('--json');
  const named = args.filter((a) => !a.startsWith('-'));

  const allPacks = Object.keys(contract.packs);
  const packsToCheck = named.length > 0 ? named : allPacks;

  for (const p of packsToCheck) {
    if (!contract.packs[p]) {
      console.error(red('error:') + ` unknown pack '${p}'. Known: ${allPacks.join(', ')}`);
      process.exit(2);
    }
  }

  if (!wantJson) {
    console.log(
      dim(`icon-validator — contract v${contract.version} (${packsToCheck.length} pack(s))`)
    );
    console.log('');
  }

  const results = packsToCheck.map((p) => validatePack(p, contract.packs[p]));

  if (wantJson) {
    process.stdout.write(JSON.stringify({ ok: results.every(r => r.missing.length === 0 && r.malformed.length === 0), results }, null, 2) + '\n');
    process.exit(results.every(r => r.missing.length === 0 && r.malformed.length === 0) ? 0 : 1);
  }

  let failed = false;
  for (const r of results) {
    reportPack(r);
    if (r.missing.length > 0 || r.malformed.length > 0) failed = true;
  }

  console.log('');
  if (failed) {
    console.log(red(bold('FAIL')) + dim(' — one or more packs incomplete'));
    process.exit(1);
  }
  console.log(
    green(bold('OK')) +
      dim(
        ` — ${results.length} pack(s), ${results.reduce(
          (n, r) => n + r.glyphsFound,
          0
        )} glyph(s) validated`
      )
  );
  process.exit(0);
}

module.exports = { validatePack, loadContract };

if (require.main === module) {
  main(process.argv);
}
