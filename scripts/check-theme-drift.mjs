#!/usr/bin/env node
// ============================================================================
// check-theme-drift.mjs
// ============================================================================
// Fails if the committed theme artifacts do not match what the SCSS sources
// produce right now.
//
// WHY THIS EXISTS
// validate-themes reads the COMMITTED CSS under public/, not the SCSS sources.
// For months that meant a theme fix could land in scss/themes/*.scss, never be
// rebuilt, and CI would happily validate the stale output and report success.
// It is the same shape as every other bug found in this area: a green check
// that proves nothing.
//
// This closes it. It rebuilds into a scratch copy and diffs. Source and
// artifacts cannot silently diverge again.
//
// Usage: node scripts/check-theme-drift.mjs
// ============================================================================

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');

const red = (s) => `[31m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;

// Snapshot what is committed right now.
const snap = mkdtempSync(join(tmpdir(), 'cia-theme-drift-'));
cpSync(resolve(PUBLIC, 'themes'), resolve(snap, 'themes'), { recursive: true });
if (existsSync(resolve(PUBLIC, 'theme.css'))) {
  cpSync(resolve(PUBLIC, 'theme.css'), resolve(snap, 'theme.css'));
}

let failed = false;
try {
  execFileSync('node', [resolve(__dirname, 'build-themes.mjs')], { stdio: 'ignore' });
  execFileSync('node', [resolve(__dirname, 'build-theme-bundle.mjs')], { stdio: 'ignore' });

  // Compare declaration-by-declaration rather than byte-by-byte, so a
  // formatting-only change in the compiler does not fail the build.
  const decls = (txt) => {
    const out = [];
    const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m;
    while ((m = re.exec(txt)) !== null) {
      out.push(`${m[1]}:${m[2].trim().replace(/\s+/g, ' ')}`);
    }
    return out.join('\n');
  };

  const files = [];
  for (const d of readdirSync(resolve(snap, 'themes'), { withFileTypes: true })) {
    if (d.isDirectory()) files.push(['themes/' + d.name + '/theme.css', d.name]);
  }
  if (existsSync(resolve(snap, 'theme.css'))) files.push(['theme.css', 'bundle']);

  for (const [rel, label] of files) {
    const before = resolve(snap, rel);
    const after = resolve(PUBLIC, rel);
    if (!existsSync(after)) {
      console.log(`${red('x')} ${label} ${dim('— committed but no longer produced by the build')}`);
      failed = true;
      continue;
    }
    if (decls(readFileSync(before, 'utf8')) !== decls(readFileSync(after, 'utf8'))) {
      console.log(`${red('x')} ${label} ${dim('— committed artifact does not match its SCSS source')}`);
      failed = true;
    }
  }

  // A source with no committed artifact at all.
  for (const f of readdirSync(resolve(ROOT, 'scss/themes'))) {
    if (!f.endsWith('.scss') || f.startsWith('_')) continue;
    const name = f.replace(/\.scss$/, '');
    if (!existsSync(resolve(PUBLIC, 'themes', name, 'theme.css'))) {
      console.log(`${red('x')} ${name} ${dim('— SCSS source has no committed theme.css')}`);
      failed = true;
    }
  }
} finally {
  // Restore the committed state so the check is read-only.
  cpSync(resolve(snap, 'themes'), resolve(PUBLIC, 'themes'), { recursive: true });
  if (existsSync(resolve(snap, 'theme.css'))) {
    cpSync(resolve(snap, 'theme.css'), resolve(PUBLIC, 'theme.css'));
  }
  rmSync(snap, { recursive: true, force: true });
}

if (failed) {
  console.log(
    '\n' + red('FAIL') +
    ' - theme artifacts are out of sync with scss/themes/.\n' +
    '       Run `npm run build:css:themes` and commit the result.'
  );
  process.exit(1);
}
console.log(green('OK') + dim(' - every committed theme artifact matches its SCSS source.'));
