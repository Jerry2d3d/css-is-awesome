#!/usr/bin/env node
// ============================================================================
// validate-api.mjs
// ============================================================================
// Guards the zero-emit authoring barrel `scss/api.scss`.
//
// Five assertions:
//   1. `@use 'api'` and calling NOTHING emits zero CSS (no bytes).
//   2. …and emits no `:root` block. Together with (1) this is what makes the
//      barrel safe inside a `.module.scss` under Next.js CSS Modules "pure"
//      mode, which forbids a top-level `:root`.
//   3. A representative function (`cia.color`) resolves through the barrel.
//   4. A representative component mixin (`cia.btn`) resolves through the barrel.
//   5. `cia.spinner()` co-emits its keyframe AND the reference to it — zero-emit
//      must not mean broken-emit when a mixin IS called.
//
// Usage: node scripts/validate-api.mjs   (exit 0 = pass, 1 = fail)
// ============================================================================

import * as sass from 'sass';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCSS = resolve(__dirname, '..', 'scss');
const loadPaths = [SCSS];

let failures = 0;
const fail = (msg) => { console.error(`  ✗ ${msg}`); failures++; };
const pass = (msg) => console.log(`  ✓ ${msg}`);

function compile(src) {
  return sass.compileString(src, { loadPaths }).css;
}

// 1. Zero-emit when nothing is called.
try {
  const css = compile(`@use 'api' as cia;`).trim();
  if (css === '') {
    pass('api barrel emits zero CSS when no mixin is called');
  } else {
    fail(`api barrel emitted CSS when unused:\n${css}`);
  }
  if (/:root/.test(css)) {
    fail('api barrel emitted a :root block (breaks CSS Modules pure mode)');
  } else {
    pass('api barrel emits no :root block');
  }
} catch (e) {
  fail(`api barrel failed to compile: ${e.message}`);
}

// 2. A function resolves through the barrel.
try {
  const css = compile(`@use 'api' as cia;\n.x { color: cia.color(text-primary); }`);
  if (/var\(--/.test(css)) {
    pass('cia.color() resolves through the api barrel');
  } else {
    fail(`cia.color() did not resolve to a token var:\n${css}`);
  }
} catch (e) {
  fail(`cia.color() failed through the api barrel: ${e.message}`);
}

// 3. A component mixin resolves through the barrel.
try {
  const css = compile(`@use 'api' as cia;\n.y { @include cia.btn(primary); }`);
  if (css.trim().length > 0) {
    pass('cia.btn() resolves through the api barrel');
  } else {
    fail('cia.btn() produced no output through the api barrel');
  }
} catch (e) {
  fail(`cia.btn() failed through the api barrel: ${e.message}`);
}

// 4. Regression: a mixin that uses a keyframe must CO-EMIT the keyframe with
//    its animation reference when called (so CSS Modules renames both together).
//    Guards against component keyframes leaking to top-level module scope.
try {
  const css = compile(`@use 'api' as cia;\n.spin { @include cia.spinner; }`);
  const hasKeyframe = /@keyframes cia-spinner-rotate/.test(css);
  const hasRef = /animation: cia-spinner-rotate/.test(css);
  if (hasKeyframe && hasRef) {
    pass('cia.spinner() co-emits its keyframe + reference when called');
  } else {
    fail(`cia.spinner() keyframe co-emit broken (keyframe:${hasKeyframe} ref:${hasRef})`);
  }
} catch (e) {
  fail(`cia.spinner() failed through the api barrel: ${e.message}`);
}

if (failures > 0) {
  console.error(`\napi barrel validation FAILED (${failures} problem(s)).`);
  process.exit(1);
}
console.log('\napi barrel validation passed.');
