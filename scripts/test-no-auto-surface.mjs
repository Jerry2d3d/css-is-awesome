// node --test scripts/test-no-auto-surface.mjs
// ============================================================================
// The page-surface guarantee.
// ============================================================================
// Adding --page-hero-* / --page-band-* to all 24 shipped themes is only safe
// because NOTHING in cia applies a page surface on its own. A theme declaring
// the tokens changes no pixel until the consumer writes `cia.surface(hero)`
// or `data-surface="hero"`. That is the entire reason an existing consumer's
// site cannot shift when they upgrade.
//
// A guarantee nobody tests is a promise, not a guarantee — and this one is
// easy to break by accident, because the tempting place to "helpfully" wire
// a hero is exactly the places this test forbids: the reset, `body`, or a
// layout mixin that everyone already calls.
//
// So: compile every shipped bundle and assert that no selector reads a page
// surface token, and that `data-surface` appears nowhere. If someone later
// adds an automatic application, this goes red and says why.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Compile one SCSS entry point to CSS with the repo's own load path. */
function compile(entry) {
  return execFileSync(
    'npx',
    ['sass', '--load-path=scss', '--no-source-map', entry],
    { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
  );
}

// Every entry point a consumer can load. If a page surface leaks into any of
// them, somebody's page changes on upgrade without asking.
const ENTRIES = [
  'scss/main.scss',
  'scss/core.scss',
  'scss/utilities-only.scss',
  'scss/tokens.scss',
];

for (const entry of ENTRIES) {
  test(`${entry} never applies a page surface automatically`, () => {
    const css = compile(entry);

    // Reading a page-surface token means something is APPLYING the surface.
    // Themes may freely DECLARE `--page-hero-bg: …`; that is inert. What must
    // not appear in a default bundle is a rule consuming it.
    const reads = [...css.matchAll(/var\(\s*(--page-(?:hero|band)-[a-z-]+)/g)].map((m) => m[1]);
    assert.deepEqual(
      [...new Set(reads)],
      [],
      `${entry} reads page-surface token(s) — something applies a surface by default. ` +
        'cia.surface() and cia.surface-attributes() must stay opt-in.',
    );

    // The attribute form is emitted only by cia.surface-attributes(), which
    // a consumer calls deliberately. It must never ship in a default bundle.
    assert.equal(
      /\[data-surface/.test(css),
      false,
      `${entry} emits a [data-surface] rule — surface-attributes() must stay opt-in.`,
    );
  });
}

test('the mixins still work when a consumer does ask for them', () => {
  // The guard above would also pass if the feature simply did not exist, so
  // prove the opt-in path still produces a surface.
  const probe = resolve(ROOT, 'scripts/.tmp-surface-probe.scss');
  writeFileSync(probe, "@use 'api' as cia;\n.x { @include cia.surface(hero); }\n@include cia.surface-attributes;\n");
  try {
    const css = compile(probe);
    assert.match(css, /var\(--page-hero-bg/, 'cia.surface(hero) should read --page-hero-bg');
    assert.match(css, /\[data-surface=hero\]/, 'surface-attributes() should emit the attribute rule');
  } finally {
    rmSync(probe, { force: true });
  }
});
