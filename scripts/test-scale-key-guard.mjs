// node --test scripts/test-scale-key-guard.mjs
// ============================================================================
// The scale-key guard.
// ============================================================================
// Every cia accessor resolves a KEY against a scale map, and a key that is
// not in that map used to be silently wrong:
//
//   font-size(2xs)  ->  var(--font-size-2xs, 1rem)  ->  renders 16px
//
// No theme declares `--font-size-2xs`, so a caption asking for the smallest
// type got the body size. It compiled, it rendered, nothing said a word, and
// four components in one consumer's library had been doing it for months.
//
// `scss/_mixins.scss` now warns on every such call. The warning IS the fix,
// which makes it the thing that has to be tested — and a warning is uniquely
// easy to delete by accident, because removing one breaks no build and
// changes no output. A refactor that drops a `_bad-scale-key()` line looks
// green everywhere except here.
//
// This compiles deliberately-wrong and deliberately-right calls and asserts,
// per call, whether Sass warned. It checks behaviour against a written-down
// expectation rather than against another generator, which is the difference
// between a test and a tautology.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOAD_PATHS = [resolve(ROOT, 'scss')];

/**
 * Compile one accessor call on its own and report whether it warned.
 *
 * One call per compile, deliberately: Sass gives no machine-readable link
 * from a warning back to the call that caused it, so a fixture holding twelve
 * calls and one warning cannot say WHICH call warned. Isolation makes the
 * attribution exact. The JS API keeps that cheap — no process per case.
 *
 * `padding` and not `--x`. A custom property's value is not parsed as SCSS at
 * all; `--x: m.font-size(2xs)` emits that text verbatim, calls nothing, and
 * warns about nothing. A fixture built on custom properties would pass this
 * entire file while testing absolutely nothing, which is how the first draft
 * of this test was written.
 */
function compileCall(call) {
  const warnings = [];
  const { css } = sass.compileString(`@use 'mixins' as m;\n.probe { padding: m.${call}; }\n`, {
    loadPaths: LOAD_PATHS,
    logger: { warn: (message) => warnings.push(message) },
  });
  return { warnings, css };
}

// Calls that MUST warn, each with the reason it is wrong. The reason is not
// decoration — when one of these fails, the failing line is the explanation.
const MUST_WARN = [
  ['font-size(2xs)',        'the reported bug: 2xs is a spacing step and typography has none'],
  ['font-size(md)',         "the type scale's middle step is `base`, not `md` — and --font-size-md falls back to 1rem, which is what base is, so it looks correct until a theme retunes its type"],
  ['line-height(md)',       'the line-height scale has no md either'],
  ['line-height(2xs)',      'the same confusion on a different scale'],
  ['font-size-raw(2xs)',    'the -raw variants read the same map and carry the same trap'],
  ['radius(0)',             'a literal handed to an accessor that has no pass-through path'],
  ['z(100)',                'looks like a z-index, returns var(--z-100, 0)'],
  ['gap(hueg)',             'a plain typo'],
  ['padding(loose)',        'a plausible-sounding key that does not exist'],
  ['shadow(9)',             'past the end of the shadow scale'],
  ['letter-spacing(loose)', 'loose is a LINE-HEIGHT key, not a tracking key'],
  ['space(3xs)',            'the old space() trap: emits `3xs`, which the browser discards'],
];

// Calls that MUST NOT warn. These matter more than the ones above. A guard
// that cries wolf on correct code gets ignored, and an ignored guard protects
// nothing — so the cost of a false positive here is the whole feature.
const MUST_NOT_WARN = [
  ['space(4)',               'a numbered step'],
  ['space(0)',               'zero is a real step on the spacing scale'],
  ['space(2xl)',             'Sass parses 2xl as a number with unit `xl`, but it is still a key'],
  ['space(12px)',            'a raw length — the documented pass-through'],
  ['space(50%)',             'a percentage is a legitimate literal too'],
  ['letter-spacing(0.03em)', 'the other accessor that takes a literal'],
  ['letter-spacing(wide)',   'a tracking key'],
  ['font-size(2)',           'a numbered type step'],
  ['font-size(3xl)',         'a t-shirt type step that is also a Sass number'],
  ['font-size(base)',        'the type scale really does call its middle step base'],
  ['space(md)',              'spacing really does call its middle step md — the pair to font-size(md) above, which does not exist'],
  ['line-height(normal)',    'the line-height scale uses word steps, not t-shirt sizes'],
  ['radius(md)',             'an ordinary key'],
  ['z(modal)',               'an ordinary key'],
  ['gap()',                  'the default argument must not warn'],

  // Values that arrive ALREADY RESOLVED, because cia's own mixins resolve
  // their arguments and a caller may resolve first:
  //
  //   @include m.flex($gap: m.space(1));            // StatChip
  //   @include m.flex($gap: m.space(2) m.space(5)); // SiteFooter
  //
  // `flex()` then calls `space()` on what `space()` already returned. That has
  // always worked through the pass-through, and the first version of this
  // guard warned on it in ten files of cia's own docs site — caught by
  // compiling every .scss in the repo rather than by reading the code.
  ['space(m.space(1))',      'an already-resolved value handed back into space()'],
  ['space(m.space(2) m.space(5))', 'a two-axis shorthand, which arrives as a list'],
  ['space(calc(100% - 2rem))', "a calc() expression is a value, not a key — and Sass gives it its own `calculation` type, so the parenthesis test for var() does not cover it"],
  ['space(clamp(1rem, 2vw, 3rem))', 'clamp() is a calculation too'],
  ['space(min(2rem, 5%))',   'so are min() and max()'],
];

// A duplicate entry runs twice and proves nothing twice; an entry in BOTH
// lists makes one of them fail forever and the other pass for the wrong
// reason. Neither is visible in a green run, so check it rather than trusting
// the lists to stay tidy — the first draft of this file already had
// `space(md)` in one list twice.
test('the fixture lists are well formed', () => {
  const warn = MUST_WARN.map(([c]) => c);
  const quiet = MUST_NOT_WARN.map(([c]) => c);
  for (const [name, list] of [['MUST_WARN', warn], ['MUST_NOT_WARN', quiet]]) {
    const dupes = list.filter((c, i) => list.indexOf(c) !== i);
    assert.deepEqual(dupes, [], `${name} lists these more than once: ${dupes}`);
  }
  const both = warn.filter((c) => quiet.includes(c));
  assert.deepEqual(both, [],
    `these are expected to warn AND to stay silent, which cannot both hold: ${both}`);
});

test('unknown scale keys warn', async (t) => {
  for (const [call, why] of MUST_WARN) {
    await t.test(`${call} — ${why}`, () => {
      const { warnings } = compileCall(call);
      assert.ok(
        warnings.length > 0,
        `m.${call} produced no warning. It resolves to a custom property no `
        + `theme declares, so it renders the fallback instead of what was asked `
        + `for, silently. Why it is wrong: ${why}.`,
      );
    });
  }
});

test('valid calls stay silent', async (t) => {
  for (const [call, why] of MUST_NOT_WARN) {
    await t.test(`${call} — ${why}`, () => {
      const { warnings } = compileCall(call);
      assert.equal(
        warnings.length, 0,
        `m.${call} warned, but it is valid: ${why}.\n${warnings.join('\n')}`,
      );
    });
  }
});

// The warning has to say enough to act on. "Invalid key" would be true and
// useless; the point of the message is that the author can fix the call
// without opening cia's source.
test('the warning names the valid keys and the sibling scale', () => {
  const { warnings } = compileCall('font-size(2xs)');
  const msg = warnings.join('\n');
  assert.match(msg, /font-size/, 'must name the function that was called');
  assert.match(msg, /\b3xl\b/, 'must list the keys that DO exist');
  assert.match(msg, /spacing key/,
    'must say 2xs is a spacing key. That is the actual confusion: the spacing '
    + 'scale has this step and the type scale does not, so the author was '
    + 'following a pattern the system taught them.');
});

// This is what makes the change MINOR rather than MAJOR. Consumer code that
// compiled yesterday compiles to exactly the same bytes today and only gains
// a message. If a future edit turns a warning into different output, the
// release type changes with it, and this test is where that gets noticed.
test('the guard changes no output', () => {
  const cases = [
    ['font-size(2xs)', 'var(--font-size-2xs, 1rem)'],
    ['radius(0)',      'var(--radius-0, 0.25rem)'],
    ['z(100)',         'var(--z-100, 0)'],
    ['space(3xs)',     '3xs'],
    ['space(12px)',    '12px'],
    ['font-size(2)',   'var(--font-size-2, 0.875rem)'],
  ];
  for (const [call, expected] of cases) {
    const { css } = compileCall(call);
    const got = css.replace(/\s+/g, ' ').match(/padding:\s*(.+?);/)?.[1];
    assert.equal(got, expected,
      `m.${call} used to emit \`${expected}\` and now emits \`${got}\`. The `
      + `guard is meant to warn and change nothing; if this value is now `
      + `correct rather than merely different, that is a breaking change and `
      + `needs a major version, not this test relaxed.`);
  }
});
