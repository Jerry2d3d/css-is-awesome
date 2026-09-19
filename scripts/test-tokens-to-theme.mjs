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
