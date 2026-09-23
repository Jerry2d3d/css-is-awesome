#!/usr/bin/env node
// ============================================================================
// fix-theme.cjs
// ============================================================================
// Rewrite a theme's DEPRECATED token declarations to their replacements.
//
// WHY THIS EXISTS
// Until now the tooling could only *say* a token was deprecated. A consumer
// then had to find it, look up what replaced it, and edit by hand — for a
// rename that a machine can do exactly. `scripts/theme-contract.json` already
// carries the `deprecated` map (old token → replacedBy / since / removeIn /
// note); this turns that map into an offer: here is what changed, here is the
// corrected file, say the word and it is yours.
//
// WHAT IT WILL NOT DO
//   * It never writes to disk. It returns text. The caller decides — same
//     contract as themeFromTokens(), for the same reason: a tool that edits
//     a consumer's file as a side effect of being asked a question is a tool
//     nobody can trust in a pipeline.
//   * It never changes a VALUE. Only the property name on the left of the
//     colon moves. A rename cannot alter how the theme looks.
//   * It never duplicates. If a block already declares the replacement, the
//     old line is left exactly where it is and the collision is reported,
//     because merging two values is a judgement call, not a rewrite.
//
// FORMATTING
// Line-based on purpose. A CSS parser would round-trip the file through an
// AST and quietly restyle whitespace, comment placement and declaration
// order — a diff full of noise around the one line that mattered. Here the
// bytes either side of the property name survive untouched.
//
// Usage (library):
//   const { fixTheme } = require('css-is-awesome/scripts/fix-theme.cjs');
//   const { css, changes, unchanged } = fixTheme({ css: themeText });
// ============================================================================
'use strict';

const fs = require('fs');
const path = require('path');

const CONTRACT_PATH = path.join(__dirname, 'theme-contract.json');

/** Load the token contract, or throw something a human can act on. */
function loadContract(ciaRoot) {
  const p = ciaRoot ? path.join(ciaRoot, 'scripts', 'theme-contract.json') : CONTRACT_PATH;
  let raw;
  try {
    raw = fs.readFileSync(p, 'utf8');
  } catch (err) {
    throw new Error(`fix-theme: could not read the token contract at ${p} — ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`fix-theme: the token contract at ${p} is not valid JSON — ${err.message}`);
  }
}

/**
 * The deprecations as a flat, serialisable list — the same data `get_token`
 * and the validator report, so all three can never disagree.
 */
function deprecations(opts) {
  const contract = (opts && opts.contract) || loadContract(opts && opts.ciaRoot);
  const map = contract.deprecated && typeof contract.deprecated === 'object' ? contract.deprecated : {};
  return Object.entries(map).map(([token, d]) => ({
    token,
    replacedBy: (d && d.replacedBy) || null,
    since: (d && d.since) || null,
    removeIn: (d && d.removeIn) || null,
    note: (d && d.note) || null,
  }));
}

// A custom-property declaration: leading whitespace, the name, optional
// whitespace, the colon. Everything from the colon rightwards is untouched.
const DECL = /^(\s*)(--[A-Za-z0-9_-]+)(\s*):/;

// Strip /* … */ so a commented-out declaration is never counted as declared
// nor rewritten. Length is preserved so line numbers stay honest.
function blankComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Rewrite deprecated declarations.
 *
 * @param {object}  o
 * @param {string}  o.css        theme CSS (compiled, not .scss source)
 * @param {object} [o.contract]  pre-loaded contract (tests / callers with one)
 * @param {string} [o.ciaRoot]   resolve the contract from another install
 * @returns {{css:string, changes:Array, unchanged:boolean, deprecatedFound:string[]}}
 *   changes[] entries are `{ line, from, to, reason, kind }` where kind is
 *   'rewrite' (applied) or 'conflict' (left alone, and why).
 */
function fixTheme(o) {
  const opts = o || {};
  if (typeof opts.css !== 'string') {
    throw new Error('fix-theme: css is required and must be a string (compiled CSS, not .scss source)');
  }
  const contract = opts.contract || loadContract(opts.ciaRoot);
  const map = contract.deprecated && typeof contract.deprecated === 'object' ? contract.deprecated : {};

  const lines = opts.css.split('\n');
  const scan = blankComments(opts.css).split('\n');

  // ── Pass 1: which tokens does each brace-scope already declare? ──────────
  // Scope id changes on every `{`, so two theme blocks in one bundled file
  // are judged independently — a collision in `[data-theme="a"]` says nothing
  // about `[data-theme="b"]`.
  const scopeOf = new Array(lines.length).fill(0);
  const declaredIn = new Map(); // scopeId -> Set<token>
  {
    let depth = 0;
    const stack = [0];
    let next = 1;
    for (let i = 0; i < scan.length; i++) {
      const line = scan[i];
      scopeOf[i] = stack[stack.length - 1];
      const m = DECL.exec(line);
      if (m) {
        const id = stack[stack.length - 1];
        if (!declaredIn.has(id)) declaredIn.set(id, new Set());
        declaredIn.get(id).add(m[2]);
      }
      for (const ch of line) {
        if (ch === '{') { stack.push(next++); depth++; }
        else if (ch === '}') { if (stack.length > 1) stack.pop(); depth--; }
      }
    }
  }

  // ── Pass 2: rewrite, or explain why not ─────────────────────────────────
  const changes = [];
  const found = new Set();
  for (let i = 0; i < lines.length; i++) {
    const m = DECL.exec(scan[i]);
    if (!m) continue;
    const token = m[2];
    const dep = map[token];
    if (!dep || !dep.replacedBy) continue;

    found.add(token);
    const replacement = dep.replacedBy;
    const already = declaredIn.get(scopeOf[i]);

    if (already && already.has(replacement)) {
      changes.push({
        line: i + 1,
        from: token,
        to: replacement,
        kind: 'conflict',
        reason:
          `${replacement} is already declared in this block, so renaming ${token} would ` +
          `produce two declarations of the same property and silently pick the last one. ` +
          `Left untouched — decide which value you want and delete the other.`,
      });
      continue;
    }

    // Rename only the property. Indentation, spacing before the colon, the
    // value, the semicolon and any trailing comment all survive byte-exact.
    lines[i] = lines[i].replace(DECL, (_full, indent, _name, gap) => `${indent}${replacement}${gap}:`);
    changes.push({
      line: i + 1,
      from: token,
      to: replacement,
      kind: 'rewrite',
      reason:
        `${token} is deprecated since contract ${dep.since || '?'} and is removed in ` +
        `${dep.removeIn || 'a future major'}. ${dep.note || ''}`.trim(),
    });
  }

  const rewrites = changes.filter((c) => c.kind === 'rewrite');
  return {
    css: rewrites.length ? lines.join('\n') : opts.css,
    changes,
    unchanged: rewrites.length === 0,
    deprecatedFound: [...found].sort(),
  };
}

module.exports = { fixTheme, deprecations, loadContract };
