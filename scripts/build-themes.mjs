#!/usr/bin/env node
// ============================================================================
// build-themes.mjs
// ============================================================================
// Compiles every scss/themes/*.scss source into public/themes/<name>/theme.css.
//
// Each scss/themes/<name>.scss is expected to contain ONE @include m.theme(name)
// block. The compiled output is a self-contained CSS file consumers can drop
// into <link rel="stylesheet">.
//
// Usage:
//   node scripts/build-themes.mjs                  # build all themes
//   node scripts/build-themes.mjs press            # build one theme
//
// Adds the gzipped size to stdout for each theme so the bundle budget is
// observable during build.
// ============================================================================

import { readdir, mkdir } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'scss/themes');
const OUT = resolve(ROOT, 'public/themes');

const filter = process.argv[2]; // optional single-theme name

if (!existsSync(SRC)) {
  console.error(`No scss/themes/ directory found at ${SRC}.`);
  process.exit(1);
}

const entries = (await readdir(SRC))
  .filter((f) => f.endsWith('.scss') && !f.startsWith('_'))
  .map((f) => basename(f, '.scss'));

const todo = filter ? entries.filter((n) => n === filter) : entries;

if (todo.length === 0) {
  console.error(filter ? `No theme named "${filter}".` : 'No themes found in scss/themes/.');
  process.exit(1);
}

const results = [];
for (const name of todo) {
  const src = resolve(SRC, `${name}.scss`);
  const outDir = resolve(OUT, name);
  const out = resolve(outDir, 'theme.css');

  await mkdir(outDir, { recursive: true });

  try {
    execSync(`npx sass --no-source-map "${src}" "${out}"`, { stdio: ['ignore', 'ignore', 'pipe'] });
    const raw = readFileSync(out);
    const gz = gzipSync(raw).length;
    results.push({ name, raw: raw.length, gz });
    console.log(`  ✓ ${name.padEnd(14)} ${(raw.length / 1024).toFixed(1).padStart(5)} KB  →  ${(gz / 1024).toFixed(1).padStart(4)} KB gz`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.stderr?.toString().trim() ?? err.message}`);
    process.exit(1);
  }
}

const total = results.reduce((sum, r) => sum + r.gz, 0);
console.log(`\nTotal: ${results.length} theme${results.length === 1 ? '' : 's'}, ${(total / 1024).toFixed(1)} KB gz combined.`);
