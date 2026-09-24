// node --test scripts/test-fix-theme.mjs
// Guards the deprecation fixer that ships in the package.
//
// The fixer's whole promise is that applying it is safe: it renames a property
// and nothing else, it never writes unless the caller writes, and it refuses
// rather than guesses when the answer is ambiguous. Each of those is a test
// here, because each of them is the kind of thing that breaks quietly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, statSync, mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { fixTheme, deprecations } = require(join(ROOT, 'scripts', 'fix-theme.cjs'));
const contract = JSON.parse(readFileSync(join(ROOT, 'scripts', 'theme-contract.json'), 'utf8'));

// The seeded deprecation everything below leans on.
const OLD = '--background-hero';
const NEW = '--page-hero-bg';

test('a theme on the deprecated token is rewritten to the replacement', () => {
  const css = `:root, :root[data-theme="acme"] {\n  ${OLD}: #eee;\n  --paper: #fff;\n}\n`;
  const r = fixTheme({ css });
  assert.equal(r.unchanged, false);
  assert.match(r.css, new RegExp(`${NEW}: #eee;`));
  assert.doesNotMatch(r.css, new RegExp(`${OLD}:`));
  const rewrites = r.changes.filter((c) => c.kind === 'rewrite');
  assert.equal(rewrites.length, 1);
  assert.equal(rewrites[0].from, OLD);
  assert.equal(rewrites[0].to, NEW);
  assert.equal(rewrites[0].line, 2, 'the change must name the real line number');
  assert.match(rewrites[0].reason, /deprecated/i);
  assert.deepEqual(r.deprecatedFound, [OLD]);
});

test('a theme already on the current token is left completely alone', () => {
  const css = `:root {\n  ${NEW}: #eee;\n  --paper: #fff;\n}\n`;
  const r = fixTheme({ css });
  assert.equal(r.unchanged, true);
  assert.equal(r.changes.length, 0);
  assert.equal(r.css, css, 'an already-current theme must come back byte-identical');
});

test('a theme declaring BOTH reports a conflict and rewrites nothing', () => {
  const css = `:root {\n  ${OLD}: #eee;\n  ${NEW}: #fff;\n}\n`;
  const r = fixTheme({ css });
  const conflicts = r.changes.filter((c) => c.kind === 'conflict');
  assert.equal(conflicts.length, 1, 'the collision must be reported');
  assert.equal(r.changes.filter((c) => c.kind === 'rewrite').length, 0);
  assert.equal(r.unchanged, true);
  assert.equal(r.css, css, 'a collision must never be resolved by guessing');
  assert.match(conflicts[0].reason, /already declared/i);
});

test('a collision in a DIFFERENT block does not block the rewrite', () => {
  // Two theme blocks in one bundled file are judged independently.
  const css =
    `:root[data-theme="a"] {\n  ${OLD}: #eee;\n}\n` +
    `:root[data-theme="b"] {\n  ${NEW}: #fff;\n}\n`;
  const r = fixTheme({ css });
  assert.equal(r.changes.filter((c) => c.kind === 'rewrite').length, 1);
  assert.equal(r.changes.filter((c) => c.kind === 'conflict').length, 0);
});

test('formatting, comments and light-dark() values survive byte-for-byte', () => {
  const css =
    `/* Acme theme */\n` +
    `:root, :root[data-theme="acme"] {\n` +
    `\t${OLD}:   light-dark(#eeeeee, #222222);   /* the hero */\n` +
    `  --paper: #fff;\n` +
    `}\n`;
  const r = fixTheme({ css });
  // Everything except the property name is identical.
  assert.equal(r.css, css.replace(OLD, NEW));
  assert.match(r.css, /\t--page-hero-bg:   light-dark\(#eeeeee, #222222\);   \/\* the hero \*\//);
});

test('a commented-out declaration is neither counted nor rewritten', () => {
  const css = `:root {\n  /* ${OLD}: #eee; */\n  --paper: #fff;\n}\n`;
  const r = fixTheme({ css });
  assert.equal(r.unchanged, true);
  assert.equal(r.css, css);
});

test('a longer token that merely starts with a deprecated name is untouched', () => {
  const css = `:root {\n  ${OLD}-extra: #eee;\n}\n`;
  const r = fixTheme({ css });
  assert.equal(r.unchanged, true);
  assert.equal(r.css, css);
});

test('the contract deprecation map is well-formed', () => {
  const all = new Set([...contract.required, ...contract.optional]);
  const dep = contract.deprecated || {};
  assert.ok(Object.keys(dep).length > 0, 'expected at least one deprecation to guard');
  const targets = new Set();
  for (const [token, def] of Object.entries(dep)) {
    assert.ok(all.has(token), `${token} is deprecated but no longer in the contract`);
    assert.ok(def.replacedBy, `${token} must name what replaces it`);
    assert.ok(all.has(def.replacedBy), `${token} points at ${def.replacedBy}, which is not a contract token`);
    assert.ok(def.since, `${token} must record when it was deprecated`);
    targets.add(def.replacedBy);
  }
  for (const t of targets) {
    assert.ok(!dep[t], `${t} is a replacement target and itself deprecated — a dead-end chain`);
  }
  // deprecations() is the serialisable view the validator and MCP both read.
  const list = deprecations();
  assert.equal(list.length, Object.keys(dep).length);
  assert.ok(list.every((d) => d.token && d.replacedBy));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(list)));
});

test('the fixer never writes to disk, and the CLI only writes with --write', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cia-fix-'));
  const file = join(dir, 'theme.css');
  const original = `:root {\n  ${OLD}: #eee;\n}\n`;
  writeFileSync(file, original);
  const before = statSync(file);

  // Library call: returns text, touches nothing.
  const r = fixTheme({ css: readFileSync(file, 'utf8') });
  assert.equal(r.unchanged, false, 'sanity: this fixture does have something to fix');
  assert.equal(readFileSync(file, 'utf8'), original, 'fixTheme must not write');
  assert.equal(statSync(file).mtimeMs, before.mtimeMs, 'fixTheme must not even touch mtime');

  // CLI without --write: prints, changes nothing.
  execFileSync(process.execPath, [join(ROOT, 'bin', 'cia.cjs'), 'fix-theme', file], { encoding: 'utf8' });
  assert.equal(readFileSync(file, 'utf8'), original, 'the CLI must not write without --write');

  // CLI with --write: applies exactly the rewrite.
  execFileSync(process.execPath, [join(ROOT, 'bin', 'cia.cjs'), 'fix-theme', file, '--write'], { encoding: 'utf8' });
  assert.equal(readFileSync(file, 'utf8'), original.replace(OLD, NEW), '--write must apply the rename and nothing else');
});

test('bad input fails clearly rather than silently doing nothing', () => {
  assert.throws(() => fixTheme({}), /css is required/);
  assert.throws(() => fixTheme({ css: 42 }), /must be a string/);
});
