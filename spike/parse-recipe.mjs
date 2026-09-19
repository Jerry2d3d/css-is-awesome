#!/usr/bin/env node
// ============================================================================
// spike/parse-recipe.mjs  —  EPIC-04 US-V11.04.1.1 (spike, does not ship)
// ============================================================================
// Parse a cia recipe markdown into the structured form the epic describes:
//   { name, meta, structureHtml, stylingScss: [{selector, mixin, params}],
//     frameworks: { react, vue, svelte, vanilla } }
//
// DEVIATION FROM THE EPIC (finding #1): the acceptance criteria say "Uses
// `remark` + `unified` for markdown AST". This spike uses `marked`, which the
// repo already depends on (^15.0.12) and which src/lib/recipes.ts already uses
// to render these same files. Adding remark + unified would mean two markdown
// parsers with two different ideas of what a recipe is — the site would render
// one AST and the codegen would generate from another. `marked`'s lexer gives
// a flat token list, which is all this needs.
// ============================================================================
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

const marked = new Marked({ gfm: true });

/** Split the `--- … ---` frontmatter. Same flat key: value shape the site reads. */
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[kv[1]] = v;
  }
  return { meta, body: raw.slice(m[0].length) };
}

/**
 * Walk the token stream, tracking the current H2 / H3 so every fenced code
 * block can be attributed to the section it sits in.
 */
function sectionedBlocks(body) {
  const tokens = marked.lexer(body);
  const blocks = [];
  let h2 = null;
  let h3 = null;
  for (const t of tokens) {
    if (t.type === 'heading' && t.depth === 2) { h2 = t.text.trim(); h3 = null; }
    else if (t.type === 'heading' && t.depth === 3) { h3 = t.text.trim(); }
    else if (t.type === 'code') {
      blocks.push({ h2, h3, lang: (t.lang || '').toLowerCase().trim(), code: t.text });
    }
  }
  return blocks;
}

/**
 * Pull `{ selector, mixin, params }` out of the Styling section's SCSS.
 * Deliberately simple: this is a spike, and the point is to see whether the
 * shape is even usable downstream, not to build a Sass parser.
 */
function parseStyling(scss) {
  const out = [];
  const lines = scss.split(/\r?\n/);
  const stack = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    const open = /^(.+?)\s*\{$/.exec(line);
    if (open) { stack.push(open[1].trim()); continue; }
    if (line === '}') { stack.pop(); continue; }
    const inc = /^@include\s+(?:cia|m)\.([\w-]+)\s*(?:\(([^)]*)\))?\s*;?$/.exec(line);
    if (inc && stack.length) {
      out.push({ selector: stack.join(' '), mixin: inc[1], params: (inc[2] || '').trim() });
    }
  }
  return out;
}

const FRAMEWORK_MATCHERS = [
  ['react', /\breact\b/i],
  ['vue', /\bvue\b/i],
  ['svelte', /\bsvelte\b/i],
  ['vanilla', /\bvanilla\b|web component/i],
];

export function parseRecipe(file) {
  const raw = readFileSync(file, 'utf8');
  const slug = path.basename(file, '.md');
  const { meta, body } = parseFrontmatter(raw);

  // Schema validation — the epic requires throwing on a non-conforming recipe.
  for (const field of ['name', 'description', 'category', 'complexity']) {
    if (!meta[field]) throw new Error(`${slug}: frontmatter is missing \`${field}\``);
  }
  if (meta.name !== slug) throw new Error(`${slug}: frontmatter name "${meta.name}" != filename`);

  const blocks = sectionedBlocks(body);

  const structure = blocks.find((b) => b.h2 === 'Structure (raw HTML)' && b.lang === 'html');
  if (!structure) throw new Error(`${slug}: no HTML block under "Structure (raw HTML)"`);

  const stylingBlock = blocks.find((b) => b.h2 === 'Styling (cia mixins)' && b.lang === 'scss');
  if (!stylingBlock) throw new Error(`${slug}: no SCSS block under "Styling (cia mixins)"`);

  const frameworks = {};
  for (const [key, re] of FRAMEWORK_MATCHERS) {
    // The framework's own H3 inside "Framework examples", first code block.
    const b = blocks.find((x) => x.h2 === 'Framework examples' && x.h3 && re.test(x.h3));
    frameworks[key] = b ? { lang: b.lang, code: b.code, heading: b.h3 } : null;
  }
  if (!frameworks.react) throw new Error(`${slug}: no React example under "Framework examples"`);

  return {
    name: slug,
    meta,
    structureHtml: structure.code,
    stylingScss: parseStyling(stylingBlock.code),
    stylingRaw: stylingBlock.code,
    frameworks,
  };
}

// CLI: node spike/parse-recipe.mjs <recipe.md>  → prints the parsed shape
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/') || process.argv[1]?.endsWith('parse-recipe.mjs')) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node spike/parse-recipe.mjs <recipe.md>'); process.exit(2); }
  const r = parseRecipe(file);
  console.log(JSON.stringify({
    name: r.name,
    meta: r.meta,
    stylingScss: r.stylingScss,
    frameworks: Object.fromEntries(Object.entries(r.frameworks).map(([k, v]) => [k, v ? { heading: v.heading, lang: v.lang, lines: v.code.split('\n').length } : null])),
    structureHtmlLines: r.structureHtml.split('\n').length,
  }, null, 2));
}
