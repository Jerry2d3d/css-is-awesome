// node --test scripts/test-tokens-to-theme.mjs
// Guards the design-tokens → theme converter that ships in the package.
// Every fixture must keep producing a contract-valid theme against the CURRENT
// contract — if a required token is added, these fail before a consumer does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIX = join(ROOT, 'scripts', 'fixtures', 'tokens');
const { themeFromTokens, detectFormat, mapPath, listBases, tokenMap, resolvePath, TOKEN_MAP } = require(join(ROOT, 'scripts', 'tokens-to-theme.cjs'));
const contract = JSON.parse(readFileSync(join(ROOT, 'scripts', 'theme-contract.json'), 'utf8'));
const json = (f) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));

function assertValid(result, label) {
  assert.equal(result.validation.ok, true, `${label}: contract should validate — missing: ${JSON.stringify(result.validation.themes?.[0]?.missing ?? result.validation.missing)}`);
  assert.match(result.css, /^\/\* css-is-awesome theme "/, `${label}: header comment`);
  assert.match(result.css, new RegExp(`:root, :root\\[data-theme="${result.report.name}"\\] \\{`), `${label}: selector shape`);
  for (const t of contract.required) assert.match(result.css, new RegExp(`\\n  ${t.replace(/[-]/g, '\\-')}: `), `${label}: emits required ${t}`);
}

test('dtcg: aliases, composite values, unmapped extras', () => {
  const r = themeFromTokens({ tokens: json('dtcg-aliases.json'), name: 'dtcg-fixture' });
  assert.equal(r.report.format, 'dtcg');
  assertValid(r, 'dtcg');
  assert.ok(r.report.fromTokens.includes('--text-link'), 'alias to brand resolves');
  assert.match(r.css, /--text-link: #3a5fcd;/);
  assert.match(r.css, /--action-primary-hover: #2e4a99;/, 'camelCase alias target resolves');
  assert.match(r.css, /--text-primary: #0f172a;/, 'colour object uses hex');
  assert.match(r.css, /--space-4: 16px;/, 'dimension object');
  assert.match(r.css, /--space-5: 24px;/, 'bare dimension number gets px');
  assert.match(r.css, /--font-sans: Inter, system-ui, sans-serif;/, 'fontFamily array');
  assert.match(r.css, /--line-height-normal: 1.5;/, 'unitless by contract');
  assert.match(r.css, /--shadow-md: 0px 4px 12px 0px #0000001f;/, 'shadow object');
  assert.match(r.css, /--duration-fast: 120ms;/);
  assert.match(r.css, /--ease: cubic-bezier\(0.2, 0, 0, 1\);/);
  assert.match(r.css, /--z-modal: 1000;/);
  assert.deepEqual(r.report.unmapped, [{ path: 'color.extra.coral', emittedAs: '--extra-coral' }]);
  assert.match(r.css, /--extra-coral: #ff6b6b;/, 'unmapped emitted verbatim');
  assert.ok(r.report.inherited.length > 100, 'most of the contract is inherited from the base');
  assert.equal(r.report.darkMode, false);
  assert.match(r.css, /color-scheme: light;/);
});

test('tokens-studio: single set with paired color-light/color-dark groups (figma-tokens/tokens.json)', () => {
  const tokens = JSON.parse(readFileSync(join(ROOT, 'figma-tokens', 'tokens.json'), 'utf8'));
  const r = themeFromTokens({ tokens, name: 'figma-demo' });
  assert.equal(r.report.format, 'tokens-studio');
  assert.equal(r.report.darkMode, true);
  assert.deepEqual(r.report.pairedGroups, ['color-light', 'color-dark']);
  assertValid(r, 'tokens-studio single');
  assert.match(r.css, /color-scheme: light dark;/);
  assert.match(r.css, /--action-primary-default: light-dark\(#3A5FCD, #60A5FA\);/);
  assert.equal(r.report.skipped.length, 0);
});

test('tokens-studio: multi-set export merges in $metadata.tokenSetOrder', () => {
  const r = themeFromTokens({ tokens: json('tokens-studio-multiset.json'), name: 'multiset' });
  assert.equal(r.report.format, 'tokens-studio');
  assertValid(r, 'multiset');
  assert.match(r.css, /--brand-primary: #6d28d9;/, 'later set overrides earlier');
  assert.match(r.css, /--action-primary-default: #6d28d9;/, 'alias resolves against the merged set');
  assert.match(r.css, /--space-4: 16px;/, 'spacing.4 → --space-4 with px');
  assert.match(r.css, /--radius-md: 10px;/, 'border-radius.md → --radius-md');
  assert.match(r.css, /--font-weight-medium: 500;/, 'unitless weight');
  assert.match(r.css, /--line-height-normal: 1.55;/);
  assert.match(r.css, /--shadow-md: 0px 4px 12px 0px #0000001f;/, 'Tokens Studio boxShadow object');
});

test('cia-flat: passthrough, optional token declared, non-contract key listed as unmapped', () => {
  const r = themeFromTokens({ tokens: json('cia-flat.json'), name: 'flat' });
  assert.equal(r.report.format, 'cia-flat');
  assertValid(r, 'cia-flat');
  assert.ok(r.report.optionalDeclared.includes('--space-unit'));
  assert.deepEqual(r.report.unmapped, [{ path: '--my-app-hero-gradient', emittedAs: '--my-app-hero-gradient' }]);
  assert.match(r.css, /--my-app-hero-gradient: linear-gradient/);
});

test('light + dark files → light-dark() only where values differ', () => {
  const r = themeFromTokens({ tokens: json('light.json'), dark: json('dark.json'), name: 'paired' });
  assertValid(r, 'paired');
  assert.equal(r.report.darkMode, true);
  assert.match(r.css, /--text-primary: light-dark\(#0f172a, #f8fafc\);/);
  assert.match(r.css, /--space-4: 16px;/, 'identical non-colour values stay single');
  assert.match(r.css, /color-scheme: light dark;/);
});

test('mode: dark single-mode theme', () => {
  const r = themeFromTokens({ tokens: json('light.json'), name: 'single-dark', mode: 'dark' });
  assert.match(r.css, /color-scheme: dark;/);
  assertValid(r, 'single-dark');
});

test('base: every shipped theme works as a base; unknown base lists the options', () => {
  const bases = listBases(ROOT);
  assert.ok(bases.includes('boilerplate') && bases.includes('sketchbook'));
  const r = themeFromTokens({ tokens: json('light.json'), name: 'on-press', base: 'press' });
  assertValid(r, 'base press');
  assert.equal(r.report.base, 'press');
  assert.throws(() => themeFromTokens({ tokens: json('light.json'), name: 'x', base: 'nope' }), /unknown base theme "nope". Available: .*boilerplate/);
});

test('errors are loud: unresolved alias, alias cycle, bad name, bad format', () => {
  assert.throws(() => themeFromTokens({ tokens: { a: { $value: '{b.c}' } }, name: 'x' }), /unresolved alias \{b\.c\}/);
  assert.throws(() => themeFromTokens({ tokens: { a: { $value: '{b}' }, b: { $value: '{a}' } }, name: 'x' }), /alias cycle/);
  assert.throws(() => themeFromTokens({ tokens: json('light.json'), name: 'Not A Slug' }), /kebab-case slug/);
  assert.throws(() => themeFromTokens({ tokens: json('light.json'), name: 'x', format: 'yaml' }), /format must be/);
});

test('determinism + JSON-string input + validate:false', () => {
  const a = themeFromTokens({ tokens: json('dtcg-aliases.json'), name: 'det' });
  const b = themeFromTokens({ tokens: JSON.stringify(json('dtcg-aliases.json')), name: 'det' });
  assert.equal(a.css, b.css);
  const c = themeFromTokens({ tokens: json('light.json'), name: 'nv', validate: false });
  assert.equal(c.validation, null);
  assert.match(c.css, /--text-primary: #0f172a;/);
});

test('detectFormat + mapPath rules', () => {
  assert.equal(detectFormat({ '--paper': '#fff' }), 'cia-flat');
  assert.equal(detectFormat({ a: { b: { $value: 1 } } }), 'dtcg');
  assert.equal(detectFormat({ a: { b: { value: 1, type: 'color' } } }), 'tokens-studio');
  const c = { all: new Set([...contract.required, ...contract.optional]) };
  assert.deepEqual(mapPath('space.4', c), { token: '--space-4', mapped: true });
  assert.deepEqual(mapPath('colors.text.primary', c), { token: '--text-primary', mapped: true });
  assert.deepEqual(mapPath('typography.font.body', c), { token: '--font-sans', mapped: true });
  assert.deepEqual(mapPath('zIndex.modal', c), { token: '--z-modal', mapped: true });
  assert.deepEqual(mapPath('color.text.linkHover', c), { token: '--text-link-hover', mapped: true });
  assert.deepEqual(mapPath('nothing.here', c), { token: '--nothing-here', mapped: false });
});

test('tokenMap(): JSON-serialisable, agrees with TOKEN_MAP, aliases compile, deterministic', () => {
  const m = tokenMap();
  const round = JSON.parse(JSON.stringify(m));
  assert.deepEqual(round, m, 'must survive a JSON round-trip (no RegExp / functions)');
  assert.deepEqual(m.explicit, TOKEN_MAP);
  assert.ok(m.aliases.length >= 10);
  for (const a of m.aliases) assert.doesNotThrow(() => new RegExp(a.pattern), `alias pattern compiles: ${a.pattern}`);
  assert.equal(typeof m.genericRule, 'string');
  assert.ok(m.genericRule.length > 80);
  assert.equal(m.contractVersion, contract.version);
  assert.deepEqual(m.targets.required, contract.required);
  assert.deepEqual(m.targets.optional, contract.optional);
  assert.equal(typeof m.generatorVersion, 'string');
  assert.deepEqual(tokenMap(), m, 'deterministic');
});

test('resolvePath(): mapped, unmapped, via + contract status', () => {
  assert.deepEqual(resolvePath('color.text.primary'), { path: 'color.text.primary', token: '--text-primary', mapped: true, via: 'explicit', status: 'required' });
  assert.deepEqual(resolvePath('spacing.4'), { path: 'spacing.4', token: '--space-4', mapped: true, via: 'generic', status: 'required' });
  assert.deepEqual(resolvePath('spacing.unit'), { path: 'spacing.unit', token: '--space-unit', mapped: true, via: 'generic', status: 'optional' });
  assert.deepEqual(resolvePath('elevation.md'), { path: 'elevation.md', token: '--shadow-md', mapped: true, via: 'generic', status: 'required' });
  assert.deepEqual(resolvePath('typography.size.lg'), { path: 'typography.size.lg', token: '--typography-size-lg', mapped: false, via: 'passthrough', status: null });
  assert.throws(() => resolvePath(''), /path is required/);
});

test('boilerplate DTCG layout: top-level light/dark modes, font.family roles, component.* overrides', () => {
  const dim = (v) => ({ $value: { value: v, unit: 'px' }, $type: 'dimension' });
  const tokens = {
    light: { color: { brand: { primary: { $value: '#3A5FCD', $type: 'color' } }, text: { primary: { $value: '#111111', $type: 'color' } } } },
    dark:  { color: { brand: { primary: { $value: '#8FB0FF', $type: 'color' } }, text: { primary: { $value: '#F5F5F5', $type: 'color' } } } },
    font: { family: { primary: { $value: 'Inter, sans-serif', $type: 'fontFamily' }, secondary: { $value: 'Fraunces, serif', $type: 'fontFamily' }, mono: { $value: 'JetBrains Mono, monospace', $type: 'fontFamily' } } },
    radius: { md: dim(8) }, shadow: { md: { $value: '0 2px 8px rgba(0,0,0,.2)', $type: 'shadow' } },
    space: { unit: dim(4), 4: dim(16) }, typography: { size: { base: dim(16) } },
    component: { button: { radius: dim(999) }, card: { shadow: { $value: '0 1px 2px rgba(0,0,0,.1)', $type: 'shadow' } } },
    components: { input: { radius: dim(6) } },
  };
  const r = themeFromTokens({ tokens, name: 'forge-layout', ciaRoot: ROOT });
  assert.equal(r.report.format, 'dtcg');
  assert.equal(r.report.darkMode, true);
  assert.deepEqual(r.report.pairedGroups, ['light', 'dark']);
  assert.match(r.css, /--brand-primary: light-dark\(#3A5FCD, #8FB0FF\)/);
  for (const t of ['--font-primary', '--font-display', '--font-mono', '--btn-radius', '--shadow-card', '--input-radius', '--space-unit', '--font-size-base']) {
    assert.ok(r.report.fromTokens.includes(t) || r.report.optionalDeclared.includes(t), `${t} should be mapped`);
  }
  assert.deepEqual(r.report.unmapped, [], 'nothing in the boilerplate layout should be unmapped');
  assert.equal(r.validation.ok, true);
});

// ── Consumer-reported regressions, 2026-09-19 ───────────────────────────────

// A `light`/`dark` pair names a MODE, so the group holds a FULL token set.
// Wrapping it in `color.` mis-routed every non-colour group and did it
// silently: the required token was inherited from the base theme, so
// validation.ok stayed true while the design's value landed on a bystander.
test('paired light/dark: non-colour groups inside the mode survive the split', () => {
  const c = (v) => ({ $value: v, $type: 'color' });
  const dim = (v) => ({ $value: { value: v, unit: 'px' }, $type: 'dimension' });
  const doc = {
    light: {
      color: { brand: { primary: c('#3A5FCD'), 'primary-hover': c('#1D4ED8') }, text: { primary: c('#111111') } },
      spacing: { unit: dim(4), 4: dim(16) },
      font: { family: { primary: { $value: 'Inter', $type: 'fontFamily' } } },
      radius: { md: dim(8) },
      component: { 'btn-radius': dim(6) },
    },
    dark: {
      color: { brand: { primary: c('#8FB0FF'), 'primary-hover': c('#93B4FF') }, text: { primary: c('#EEEEEE') } },
    },
  };
  const wrapped = themeFromTokens({ tokens: doc, name: 'paired-wrapped', ciaRoot: ROOT });
  const split = themeFromTokens({ tokens: doc.light, dark: doc.dark, name: 'paired-split', ciaRoot: ROOT });

  assert.deepEqual(wrapped.report.unmapped, [], 'whole-document form should leave nothing unmapped');
  assert.equal(wrapped.report.darkMode, true);
  assert.deepEqual(wrapped.report.pairedGroups, ['light', 'dark']);
  // The two documented call shapes must agree on every token.
  assert.deepEqual(
    [...wrapped.report.fromTokens].sort(),
    [...split.report.fromTokens].sort(),
    'passing the whole document must equal passing light + dark separately',
  );
  // The specific silent failure: density lost, design value on a bystander.
  assert.match(wrapped.css, /--space-unit:/, '--space-unit must be declared, not inherited');
  assert.doesNotMatch(wrapped.css, /--spacing-unit:/, 'must not emit the mis-routed --spacing-unit');
  assert.doesNotMatch(wrapped.css, /--color-brand-primary-hover:/, 'must not emit the mis-routed colour');
  assert.match(wrapped.css, /--brand-primary-hover: light-dark\(#1D4ED8, #93B4FF\)/);
  assertValid(wrapped, 'paired-wrapped');
});

// The other convention must keep its old meaning: `color-light` names a COLOUR
// SET, so its children are colours and still nest under `color.`.
test('paired color-light/color-dark: group children stay colours', () => {
  const c = (v) => ({ value: v, type: 'color' });
  const doc = {
    'color-light': { brand: { primary: c('#3A5FCD') }, text: { primary: c('#111111') } },
    'color-dark': { brand: { primary: c('#8FB0FF') }, text: { primary: c('#EEEEEE') } },
  };
  const r = themeFromTokens({ tokens: doc, name: 'paired-colorset', ciaRoot: ROOT });
  assert.deepEqual(r.report.pairedGroups, ['color-light', 'color-dark']);
  assert.ok(r.report.fromTokens.includes('--brand-primary'), 'brand.primary should resolve through the color. wrap');
  assert.ok(r.report.fromTokens.includes('--text-primary'));
  assert.match(r.css, /--brand-primary: light-dark\(#3A5FCD, #8FB0FF\)/);
  assertValid(r, 'paired-colorset');
});

// Exporters flatten the component group; the explicit table carries the nested
// shape. Both must land on the same contract token. Radius trails the
// component (`--card-radius`) but shadow/border/duration lead it
// (`--shadow-card`), so the flat form needs the swap too.
test('component overrides map flat and nested alike', () => {
  const expected = {
    'component.btn-radius': '--btn-radius',
    'component.input-radius': '--input-radius',
    'component.modal-radius': '--modal-radius',
    'component.badge-radius': '--badge-radius',
    'component.tag-radius': '--tag-radius',
    'component.card-shadow': '--shadow-card',
    'component.dropdown-shadow': '--shadow-dropdown',
    'component.input-focus-shadow': '--shadow-input-focus',
    'component.card-border': '--border-card',
    'component.touch-target-min': '--touch-target-min',
    'component.button.radius': '--btn-radius',
    'component.card.shadow': '--shadow-card',
    'components.input.radius': '--input-radius',
  };
  for (const [path, token] of Object.entries(expected)) {
    const r = mapPath(path);
    assert.equal(r.token, token, `${path} should map to ${token}`);
    assert.equal(r.mapped, true, `${path} should be mapped`);
    assert.ok(
      contract.required.includes(token) || contract.optional.includes(token),
      `${token} should be a real contract token`,
    );
  }
  // A name that is not a contract token stays unmapped rather than inventing one.
  const miss = mapPath('component.made-up-thing');
  assert.equal(miss.mapped, false);
  assert.equal(miss.token, '--component-made-up-thing');
});

// mapPath's contract argument was only read on the generic-rule branch, so an
// explicit-table path appeared to work without it and the mistake surfaced
// later as a TypeError somewhere else.
test('mapPath: contract is optional, bad input fails clearly', () => {
  assert.equal(mapPath('spacing.4').token, '--space-4');
  assert.equal(mapPath('color.text.primary').token, '--text-primary');
  assert.throws(() => mapPath(''), /non-empty token path/);
  assert.throws(() => mapPath(null), /non-empty token path/);
  assert.throws(() => mapPath('a.b', {}), /contract from loadContract/);
});

// The in-process entry point is documented, so the exports map must expose it:
// shipping the file is not enough, Node blocks an unlisted subpath.
test('package exports expose the documented in-process entry points', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  for (const sub of ['./scripts/tokens-to-theme.cjs', './scripts/tokens-to-theme']) {
    assert.equal(pkg.exports[sub], './scripts/tokens-to-theme.cjs', `${sub} must be exported`);
  }
  assert.ok(pkg.files.some((f) => f === 'scripts/tokens-to-theme.cjs' || f === 'scripts'), 'the file must also ship');
});
