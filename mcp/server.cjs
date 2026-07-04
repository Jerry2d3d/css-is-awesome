#!/usr/bin/env node
/**
 * css-is-awesome MCP Server
 *
 * Exposes the css-is-awesome design system (themes, mixins, functions, tokens,
 * animations, components, recipes, docs) as MCP tools so any agent (Claude
 * Code, Cursor, Aider, Gemini, Copilot, etc.) can discover the API surface
 * and assemble prompts that consume the library correctly.
 *
 * Resource families:
 *   Themes:        list_themes,     get_theme,     search_themes
 *   Mixins:        list_mixins,     get_mixin,     search_mixins
 *   Functions:     list_functions,  get_function,  search_functions
 *   Tokens:        list_tokens,     get_token,     search_tokens
 *   Animations:    list_animations, get_animation
 *   Components:    list_components, get_component
 *   Recipes:       list_recipes,    get_recipe
 *   Docs:          read_llm_txt, read_changelog, read_migration,
 *                  read_theming, read_agents, read_contract,
 *                  read_three_tiers
 *   Prompt:        assemble_prompt(intent[, args])
 *
 * Discovery model: filesystem scan, no database. Parses SCSS files with
 * focused regex (no full SCSS AST). Tokens come from the authoritative
 * `scripts/theme-contract.json`.
 *
 * Transport: stdio. Usage in a client's .mcp.json:
 *   {
 *     "mcpServers": {
 *       "css-is-awesome": {
 *         "command": "node",
 *         "args": ["K:/Repo/css-is-awesome/mcp/server.cjs"]
 *       }
 *     }
 *   }
 *
 * Aligned with the canonical sibling MCP shape: ui-ux-builder, ideas-master,
 * video-maker. Response envelope is `{ total, items }` for list/search;
 * get_* tools return the full record.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCSS_DIR = path.join(PROJECT_ROOT, 'scss');
const THEMES_DIR = path.join(SCSS_DIR, 'themes');
const COMPONENTS_DIR = path.join(SCSS_DIR, 'components');
const RECIPES_DIR = path.join(SCSS_DIR, 'recipes');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'scripts');
const THEME_CONTRACT_PATH = path.join(SCRIPTS_DIR, 'theme-contract.json');

const SERVER_NAME = 'css-is-awesome';
const SERVER_VERSION = '0.8.2';

// Files that contribute mixins/functions to the public surface.
// Order matters only for tie-breaking; we tag every parsed entry with its
// source path so callers can disambiguate same-name overloads if they appear.
const MIXIN_SOURCES = [
  { file: 'scss/_mixins.scss',      category: 'core'       },
  { file: 'scss/_layout.scss',      category: 'layout'     },
  { file: 'scss/_animations.scss',  category: 'animation'  },
  { file: 'scss/_icons.scss',       category: 'icons'      },
  { file: 'scss/_generator.scss',   category: 'generator'  },
];

// Component directory is enumerated dynamically — every _foo.scss becomes a
// component "foo" whose mixins are listed under it.

// ─── MCP SDK resolution (lazy + friendly errors) ─────────────────────────────

function resolveMcp() {
  try { return require('@modelcontextprotocol/sdk/server/mcp.js'); }
  catch {
    throw new Error(
      'css-is-awesome MCP server: @modelcontextprotocol/sdk is not installed. ' +
      'Install with: npm install @modelcontextprotocol/sdk zod'
    );
  }
}

function resolveStdio() {
  try { return require('@modelcontextprotocol/sdk/server/stdio.js'); }
  catch {
    throw new Error('css-is-awesome MCP server: @modelcontextprotocol/sdk (stdio) missing — reinstall.');
  }
}

// ─── File helpers ────────────────────────────────────────────────────────────

function readFileSafe(absPath) {
  try { return fs.readFileSync(absPath, 'utf8'); }
  catch { return null; }
}

function readFileNormalized(absPath) {
  const raw = readFileSafe(absPath);
  if (raw == null) return null;
  // Strip BOM, normalize CRLF — everything downstream gets clean LF text.
  const noBom = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  return noBom.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function readJsonSafe(absPath) {
  try { return JSON.parse(fs.readFileSync(absPath, 'utf8')); }
  catch { return null; }
}

function relFromRoot(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replace(/\\/g, '/');
}

function listScssFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.scss'))
    .sort()
    .map((f) => path.join(dir, f));
}

// Recipes come in two kinds:
//   - markdown pattern recipes (<slug>.md) — the v1.0 recipes book: YAML
//     frontmatter + prose + framework examples. A pattern to follow, NOT a
//     SCSS import. Skips _templates and README.md.
//   - opt-in SCSS recipes (_<slug>.scss, e.g. bare-tags) — wire mixins to
//     bare HTML tags (Pico-mode); consumed via @use.
function listRecipeFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (f.endsWith('.md')) {
      if (f.startsWith('_') || f.toLowerCase() === 'readme.md') continue;
      out.push({ abs: path.join(dir, f), kind: 'md', name: f.slice(0, -3) });
    } else if (f.endsWith('.scss')) {
      out.push({ abs: path.join(dir, f), kind: 'scss', name: path.basename(f, '.scss').replace(/^_/, '') });
    }
  }
  return out;
}

// Minimal flat-YAML frontmatter parser (key: value pairs between --- fences).
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return meta;
}

// Normalize either recipe kind into a single shape for the MCP tools.
function recipeInfo(file) {
  const text = readFileNormalized(file.abs) || '';
  if (file.kind === 'md') {
    const fm = parseFrontmatter(text) || {};
    const name = fm.name || file.name;
    return {
      name,
      kind: 'md',
      path: relFromRoot(file.abs),
      description: fm.description || firstSentence(text),
      category: fm.category || null,
      complexity: fm.complexity || null,
      usage: `Pattern recipe — read it (get_recipe) and follow it in your stack; humans read it at /docs/recipes/${name}. Not a SCSS import.`,
      body: text,
    };
  }
  const headerLines = [];
  for (const l of text.split('\n')) {
    if (l.startsWith('//')) headerLines.push(l.replace(/^\/\/\s?/, ''));
    else if (l.trim() === '') headerLines.push('');
    else break;
  }
  return {
    name: file.name,
    kind: 'scss',
    path: relFromRoot(file.abs),
    description: firstSentence(headerLines.join('\n')),
    category: null,
    complexity: null,
    usage: `@use 'css-is-awesome/scss/recipes/${file.name}';`,
    body: text,
  };
}

function ensureInProject(fp) {
  const abs = path.resolve(fp);
  if (!abs.startsWith(path.resolve(PROJECT_ROOT))) {
    throw new Error('Path traversal blocked: must stay inside project root');
  }
  return abs;
}

function snippet(body, query) {
  if (!body || !query) return '';
  const hay = body.toLowerCase();
  const idx = hay.indexOf(query.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 80);
  const end = Math.min(body.length, idx + query.length + 160);
  return (start > 0 ? '…' : '') + body.slice(start, end).replace(/\s+/g, ' ').trim() + (end < body.length ? '…' : '');
}

// ─── SCSS parsers (regex-based, intentionally narrow) ────────────────────────

/**
 * Find every `@mixin` and `@function` declaration in a single SCSS file.
 * Returns rich records: name, signature, body (until the matching closing
 * brace), preceding doc comments, line number, and file path.
 *
 * Parser is deliberately simple — it counts braces. Inside-string braces or
 * SCSS interpolation that contains `{` could confuse it. The library's
 * mixin/function bodies are well-behaved so this is safe in practice; if a
 * mixin's body ever genuinely breaks the brace counter, callers can fall
 * back to `read_file_raw`-style consumption via the source path in the record.
 */
function parseScssDeclarations(absPath) {
  const text = readFileNormalized(absPath);
  if (text == null) return [];

  const lines = text.split('\n');
  const out = [];
  // Head regex matches the `@mixin/@function name` part; param list and body
  // are handled below so multi-line signatures (very common in cia mixins
  // like `@mixin font($type: reg, $size: null, ...)`) are captured intact.
  const headRegex = /^(@(?:mixin|function))\s+([A-Za-z_][\w-]*)\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(headRegex);
    if (!m) continue;

    const kind = m[1] === '@mixin' ? 'mixin' : 'function';
    const name = m[2];

    // Build the param list by walking forward until we either hit `)` at
    // matched depth (for paren-bearing decls) or `{` (for paren-less decls
    // like `@mixin tablet { ... }`). Strips inline `//` comments.
    let paramsRaw = '';
    let cursor = i;
    let parenDepth = 0;
    let sawOpenParen = false;
    let restOfHead = m[3];
    let consumedHeadLine = false;

    // Pre-scan the trailing chars on the decl line. If it contains `(`,
    // we're in param-collection mode; otherwise the params are simply empty.
    if (restOfHead.includes('(')) {
      // Walk character-by-character across this line and subsequent lines
      // until parenDepth returns to 0 after we've seen the opening paren.
      let collected = '';
      let workLine = restOfHead;
      while (true) {
        for (let ci = 0; ci < workLine.length; ci++) {
          const ch = workLine[ci];
          if (ch === '(') {
            if (sawOpenParen) collected += ch;
            parenDepth++;
            sawOpenParen = true;
            continue;
          }
          if (ch === ')') {
            parenDepth--;
            if (parenDepth === 0) {
              paramsRaw = collected.trim().replace(/\s+/g, ' ');
              cursor = i + (consumedHeadLine ? 1 : 0);
              // we'll find the brace below
              break;
            }
            collected += ch;
            continue;
          }
          if (sawOpenParen) collected += ch;
        }
        if (parenDepth === 0 && sawOpenParen) break;
        // Continue onto next line
        cursor++;
        consumedHeadLine = true;
        if (cursor >= lines.length) break;
        workLine = lines[cursor];
        collected += ' ';
      }
    }

    const signature = `${kind === 'mixin' ? '@mixin' : '@function'} ${name}(${paramsRaw})`;

    // Walk back to find a doc comment block (consecutive `//` lines above).
    const docLines = [];
    let j = i - 1;
    while (j >= 0) {
      const prev = lines[j];
      const trimmed = prev.trim();
      if (trimmed.startsWith('//')) {
        docLines.unshift(trimmed.replace(/^\/\/\s?/, ''));
        j--;
        continue;
      }
      // Skip blank lines between a separator banner and the decl; banners
      // like `// ====` we keep, but bail if we hit a non-comment line.
      if (trimmed === '') { j--; continue; }
      break;
    }
    // Drop banner-only "====" lines from the front/back of the doc block.
    while (docLines.length && /^=+$/.test(docLines[0])) docLines.shift();
    while (docLines.length && /^=+$/.test(docLines[docLines.length - 1])) docLines.pop();

    // Capture body until matching closing brace. Start brace count at 1
    // assuming the opening `{` is on the same line — if it isn't, the
    // outer loop will see the next line(s) start with `{` and we adjust.
    let depth = 0;
    let started = false;
    let bodyStart = i;
    const bodyLines = [];

    for (let k = i; k < lines.length; k++) {
      const l = lines[k];
      for (const ch of l) {
        if (ch === '{') { depth++; started = true; }
        else if (ch === '}') { depth--; }
      }
      bodyLines.push(l);
      if (started && depth === 0) {
        // Done — `bodyLines` now contains decl line through closing brace.
        out.push({
          kind,
          name,
          params: paramsRaw,
          signature,
          doc: docLines.join('\n').trim(),
          body: bodyLines.join('\n'),
          startLine: bodyStart + 1,
          endLine: k + 1,
          path: relFromRoot(absPath),
        });
        break;
      }
      // Special case: single-line mixin like `@mixin tablet { @include media(md) { @content; } }`
      // — handled by the brace counter naturally.
    }
  }
  return out;
}

/**
 * Pull theme metadata out of a theme file. Themes use `@include m.theme('name') { ... }`
 * (or sometimes the older `:root[data-theme="name"]`). Returns the declared
 * name, the inferred token assignments, and the raw body for callers that
 * want the source.
 */
function parseThemeFile(absPath) {
  const text = readFileNormalized(absPath);
  if (text == null) return null;
  const baseName = path.basename(absPath, '.scss');

  // Find theme name from `@include <ns>.theme('name')` (any namespace: m, cia, …)
  // or `[data-theme="name"]`.
  const includeMatch = text.match(/@include\s+[\w-]+\.theme\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  const dataMatch = text.match(/\[data-theme=['"]([^'"]+)['"]\]/);
  const name = (includeMatch && includeMatch[1]) || (dataMatch && dataMatch[1]) || baseName;

  // Header doc block — top-of-file `// ===` banner + body.
  const headerLines = [];
  const lines = text.split('\n');
  for (const l of lines) {
    if (l.startsWith('//')) headerLines.push(l.replace(/^\/\/\s?/, ''));
    else if (l.trim() === '') headerLines.push('');
    else break;
  }
  const header = headerLines.join('\n').trim();

  // Collect token assignments: `--token-name: value;` (one per line).
  // The value may span multiple lines for shadow stacks; we just grab the
  // first-line head and let the caller fetch the raw body if they need more.
  const tokens = {};
  const tokenRegex = /^\s*(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm;
  let m;
  while ((m = tokenRegex.exec(text)) !== null) {
    tokens[m[1]] = m[2].trim().replace(/\s+/g, ' ');
  }

  const supportsLightDark = /light-dark\s*\(/.test(text);

  return {
    name,
    file: baseName,
    path: relFromRoot(absPath),
    description: header,
    supportsLightDark,
    tokenCount: Object.keys(tokens).length,
    tokens,
    body: text,
  };
}

/**
 * Theme contract → categorized token list. Categorization is by prefix +
 * a couple of well-known scalar tokens so the LLM can ask "what surface
 * tokens are there?" and get a sensible answer without scanning all 123.
 */
function loadTokenContract() {
  const contract = readJsonSafe(THEME_CONTRACT_PATH);
  if (!contract || !Array.isArray(contract.required)) {
    return { required: [], optional: [], byName: {}, byCategory: {} };
  }
  const optional = Array.isArray(contract.optional) ? contract.optional : [];

  const byName = {};
  const byCategory = {};

  const categorize = (name) => {
    // surface / paper
    if (/^--(paper|background|surface)-/.test(name)) return 'surface';
    if (/^--(ink|graphite|muted|text)-?/.test(name)) return 'ink';
    if (/^--(guide|hair|line|border)-?/.test(name)) return 'lines';
    if (/^--action-/.test(name)) return 'action';
    if (/^--(brand|ai|shu|ochre)-?/.test(name)) return 'brand';
    if (/^--code-/.test(name)) return 'code';
    if (/^--font/.test(name)) return 'type';
    if (/^--(line-height|letter-spacing)/.test(name)) return 'type';
    if (/^--radius/.test(name) || /^--r-/.test(name)) return 'radius';
    if (/^--shadow/.test(name)) return 'shadow';
    if (/^--blur/.test(name) || /^--glow/.test(name)) return 'fx';
    if (/^--(duration|ease)/.test(name)) return 'motion';
    if (/^--space/.test(name) || /^--gap/.test(name) || /^--padding/.test(name)) return 'space';
    if (/^--z-/.test(name)) return 'z-index';
    if (/^--(info|success|warning|error|feedback)/.test(name)) return 'semantic';
    if (/^--interactive/.test(name)) return 'interactive';
    if (/^--touch-target/.test(name)) return 'a11y';
    if (/^--logo/.test(name)) return 'brand';
    return 'misc';
  };

  for (const t of contract.required) {
    const category = categorize(t);
    byName[t] = { name: t, category, required: true };
    (byCategory[category] = byCategory[category] || []).push(t);
  }
  for (const t of optional) {
    const category = categorize(t);
    byName[t] = { name: t, category, required: false };
    (byCategory[category] = byCategory[category] || []).push(t);
  }

  return { required: contract.required, optional, byName, byCategory };
}

/**
 * Pull the animation vocabulary out of `_animations.scss`. Returns the
 * { slug → keyframe-name } map, the list of speed keys, and the parsed
 * `@mixin animate(...)` / `@mixin animate-on(...)` records so callers can
 * see the full signature without a second round-trip.
 */
function loadAnimations() {
  const animFile = path.join(SCSS_DIR, '_animations.scss');
  const text = readFileNormalized(animFile);
  if (text == null) {
    return { vocabulary: {}, speeds: [], mixins: [], effects: [] };
  }

  // Vocabulary block: `$_anims: ( slug: keyframe, ... );`
  const vocab = {};
  const vocabBlock = text.match(/\$_anims:\s*\(([\s\S]*?)\)\s*;/);
  if (vocabBlock) {
    const pairRe = /([a-z][\w-]*)\s*:\s*([a-z][\w-]*)/g;
    let m;
    while ((m = pairRe.exec(vocabBlock[1])) !== null) {
      vocab[m[1]] = m[2];
    }
  }

  const speeds = [];
  const speedsBlock = text.match(/\$_speeds:\s*\(([\s\S]*?)\)\s*;/);
  if (speedsBlock) {
    const re = /([a-z][\w-]*)\s*:/g;
    let m;
    while ((m = re.exec(speedsBlock[1])) !== null) speeds.push(m[1]);
  }

  const mixins = parseScssDeclarations(animFile).filter((d) => d.kind === 'mixin');

  // animate-on effect names — they live in `@if $effect == 'lift'` style
  // branches. Grab them for documentation.
  const effects = [];
  const effectRegex = /\$effect\s*==\s*([a-z][\w-]*)/g;
  let em;
  while ((em = effectRegex.exec(text)) !== null) {
    if (!effects.includes(em[1])) effects.push(em[1]);
  }

  return { vocabulary: vocab, speeds, mixins, effects };
}

// ─── Aggregators (built once on first call, cheap to rebuild) ────────────────

let cachedDeclarations = null;
let cachedComponents = null;
let cachedThemes = null;
let cachedTokens = null;
let cachedAnimations = null;

function getAllDeclarations() {
  if (cachedDeclarations) return cachedDeclarations;
  const out = [];

  // Core/library files
  for (const { file, category } of MIXIN_SOURCES) {
    const abs = path.join(PROJECT_ROOT, file);
    for (const d of parseScssDeclarations(abs)) {
      out.push({ ...d, category, component: null });
    }
  }

  // Components (one component per _foo.scss in scss/components/)
  for (const abs of listScssFiles(COMPONENTS_DIR)) {
    const componentName = path.basename(abs, '.scss').replace(/^_/, '');
    if (componentName === 'index') continue;
    for (const d of parseScssDeclarations(abs)) {
      out.push({ ...d, category: 'component', component: componentName });
    }
  }

  // Recipes
  for (const abs of listScssFiles(RECIPES_DIR)) {
    const recipeName = path.basename(abs, '.scss').replace(/^_/, '');
    for (const d of parseScssDeclarations(abs)) {
      out.push({ ...d, category: 'recipe', component: null, recipe: recipeName });
    }
  }

  cachedDeclarations = out;
  return out;
}

function getComponents() {
  if (cachedComponents) return cachedComponents;
  const out = [];
  for (const abs of listScssFiles(COMPONENTS_DIR)) {
    const componentName = path.basename(abs, '.scss').replace(/^_/, '');
    if (componentName === 'index') continue;
    const text = readFileNormalized(abs) || '';
    // First doc comment block as the description
    const headerLines = [];
    for (const l of text.split('\n')) {
      if (l.startsWith('//')) headerLines.push(l.replace(/^\/\/\s?/, ''));
      else if (l.trim() === '') headerLines.push('');
      else break;
    }
    const mixins = parseScssDeclarations(abs)
      .filter((d) => d.kind === 'mixin' && !d.name.startsWith('_'))
      .map((d) => d.name);
    out.push({
      name: componentName,
      path: relFromRoot(abs),
      description: headerLines.join('\n').trim(),
      mixinNames: mixins,
      mixinCount: mixins.length,
    });
  }
  cachedComponents = out;
  return out;
}

function getThemes() {
  if (cachedThemes) return cachedThemes;
  const out = [];
  for (const abs of listScssFiles(THEMES_DIR)) {
    const parsed = parseThemeFile(abs);
    if (parsed) out.push(parsed);
  }
  cachedThemes = out;
  return out;
}

function getTokens() {
  if (cachedTokens) return cachedTokens;
  cachedTokens = loadTokenContract();
  return cachedTokens;
}

function getAnimations() {
  if (cachedAnimations) return cachedAnimations;
  cachedAnimations = loadAnimations();
  return cachedAnimations;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function declSummary(d) {
  return {
    name: d.name,
    kind: d.kind,
    category: d.category,
    component: d.component || null,
    signature: d.signature,
    summary: firstSentence(d.doc),
    path: d.path,
    line: d.startLine,
  };
}

function firstSentence(doc) {
  if (!doc) return '';
  // Drop banner/section headers ('============' or '------------'), keep the
  // first real prose line. Also drops lines that are all dashes/equals
  // even if mixed-case (e.g. "----- Section -----" keeps its content).
  const lines = doc.split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^[=\-]{3,}$/.test(l));
  const text = (lines[0] || '').replace(/\s+/g, ' ');
  return text.length > 240 ? text.slice(0, 237) + '…' : text;
}

const handlers = {
  // ─── Themes ────────────────────────────────────────────────────────────

  list_themes() {
    const items = getThemes().map((t) => ({
      name: t.name,
      file: t.file,
      description: firstSentence(t.description),
      supportsLightDark: t.supportsLightDark,
      tokenCount: t.tokenCount,
      path: t.path,
    }));
    return { total: items.length, items };
  },

  get_theme({ name } = {}) {
    if (!name) throw new Error('get_theme: name is required');
    const needle = String(name).trim();
    const themes = getThemes();
    const found = themes.find((t) => t.name === needle || t.file === needle);
    if (!found) throw new Error(`Unknown theme: ${needle}. Try list_themes.`);
    return {
      name: found.name,
      file: found.file,
      path: found.path,
      description: found.description,
      supportsLightDark: found.supportsLightDark,
      tokenCount: found.tokenCount,
      tokens: found.tokens,
      raw_scss: found.body,
    };
  },

  search_themes({ query, limit = 50 } = {}) {
    if (!query || typeof query !== 'string') throw new Error('search_themes: query is required');
    const q = query.toLowerCase();
    const matches = [];
    for (const t of getThemes()) {
      const hay = `${t.name}\n${t.file}\n${t.description}\n${Object.keys(t.tokens).join(' ')}\n${Object.values(t.tokens).join(' ')}`.toLowerCase();
      if (hay.includes(q)) {
        matches.push({
          name: t.name,
          file: t.file,
          path: t.path,
          description: firstSentence(t.description),
          snippet: snippet(t.body, query),
        });
        if (matches.length >= limit) break;
      }
    }
    return { total: matches.length, items: matches };
  },

  // ─── Mixins ────────────────────────────────────────────────────────────

  list_mixins({ category, component, limit = 500, offset = 0 } = {}) {
    const all = getAllDeclarations()
      .filter((d) => d.kind === 'mixin')
      .filter((d) => !d.name.startsWith('_'))
      .filter((d) => !category || d.category === category)
      .filter((d) => !component || d.component === component)
      .map(declSummary);
    return { total: all.length, items: all.slice(offset, offset + limit) };
  },

  get_mixin({ name } = {}) {
    if (!name) throw new Error('get_mixin: name is required');
    const needle = String(name).trim();
    const all = getAllDeclarations().filter((d) => d.kind === 'mixin');
    // Prefer exact match on public name (not starting with `_`).
    let found = all.find((d) => d.name === needle && !d.name.startsWith('_'));
    if (!found) found = all.find((d) => d.name === needle);
    if (!found) throw new Error(`Unknown mixin: ${needle}. Try list_mixins.`);
    return {
      name: found.name,
      kind: 'mixin',
      category: found.category,
      component: found.component || null,
      signature: found.signature,
      params: found.params,
      doc: found.doc,
      body: found.body,
      path: found.path,
      startLine: found.startLine,
      endLine: found.endLine,
    };
  },

  search_mixins({ query, category, limit = 100 } = {}) {
    if (!query || typeof query !== 'string') throw new Error('search_mixins: query is required');
    const q = query.toLowerCase();
    const matches = [];
    for (const d of getAllDeclarations()) {
      if (d.kind !== 'mixin') continue;
      if (d.name.startsWith('_')) continue;
      if (category && d.category !== category) continue;
      const hay = `${d.name}\n${d.signature}\n${d.doc}\n${d.body}`.toLowerCase();
      if (hay.includes(q)) {
        matches.push({ ...declSummary(d), snippet: snippet(`${d.doc}\n${d.body}`, query) });
        if (matches.length >= limit) break;
      }
    }
    return { total: matches.length, items: matches };
  },

  // ─── Functions ─────────────────────────────────────────────────────────

  list_functions({ category, limit = 500, offset = 0 } = {}) {
    const all = getAllDeclarations()
      .filter((d) => d.kind === 'function')
      .filter((d) => !d.name.startsWith('_'))
      .filter((d) => !category || d.category === category)
      .map(declSummary);
    return { total: all.length, items: all.slice(offset, offset + limit) };
  },

  get_function({ name } = {}) {
    if (!name) throw new Error('get_function: name is required');
    const needle = String(name).trim();
    const all = getAllDeclarations().filter((d) => d.kind === 'function');
    let found = all.find((d) => d.name === needle && !d.name.startsWith('_'));
    if (!found) found = all.find((d) => d.name === needle);
    if (!found) throw new Error(`Unknown function: ${needle}. Try list_functions.`);
    return {
      name: found.name,
      kind: 'function',
      category: found.category,
      signature: found.signature,
      params: found.params,
      doc: found.doc,
      body: found.body,
      path: found.path,
      startLine: found.startLine,
      endLine: found.endLine,
    };
  },

  search_functions({ query, limit = 100 } = {}) {
    if (!query || typeof query !== 'string') throw new Error('search_functions: query is required');
    const q = query.toLowerCase();
    const matches = [];
    for (const d of getAllDeclarations()) {
      if (d.kind !== 'function') continue;
      if (d.name.startsWith('_')) continue;
      const hay = `${d.name}\n${d.signature}\n${d.doc}\n${d.body}`.toLowerCase();
      if (hay.includes(q)) {
        matches.push({ ...declSummary(d), snippet: snippet(`${d.doc}\n${d.body}`, query) });
        if (matches.length >= limit) break;
      }
    }
    return { total: matches.length, items: matches };
  },

  // ─── Tokens ────────────────────────────────────────────────────────────

  list_tokens({ category, required, limit = 1000, offset = 0 } = {}) {
    const { byName } = getTokens();
    let items = Object.values(byName);
    if (category) items = items.filter((t) => t.category === category);
    if (typeof required === 'boolean') items = items.filter((t) => t.required === required);
    items = items.sort((a, b) => a.name.localeCompare(b.name));
    return { total: items.length, items: items.slice(offset, offset + limit) };
  },

  get_token({ name } = {}) {
    if (!name) throw new Error('get_token: name is required');
    const needle = String(name).trim();
    const { byName } = getTokens();
    const withDashes = needle.startsWith('--') ? needle : `--${needle}`;
    const entry = byName[withDashes] || byName[needle];
    if (!entry) throw new Error(`Unknown token: ${needle}. Try list_tokens.`);
    // Look up sample values across themes so the caller sees how the
    // token gets resolved in practice.
    const themeValues = {};
    for (const t of getThemes()) {
      if (t.tokens[entry.name] != null) themeValues[t.name] = t.tokens[entry.name];
    }
    // Find mixins/functions whose body references this token. Match both
    // the full `--name` form (when the mixin emits a CSS custom property)
    // AND the bare `name` form (when the mixin calls `color(name)` or
    // `comp(name, ...)`). Use word boundaries so `--ai` doesn't match
    // every line that happens to contain the letters "ai".
    const bareName = entry.name.replace(/^--/, '');
    const fullRe = new RegExp(`(^|[^A-Za-z0-9_-])${entry.name.replace(/[-]/g, '\\-')}([^A-Za-z0-9_-]|$)`);
    const bareRe = new RegExp(`(^|[^A-Za-z0-9_-])${bareName.replace(/[-]/g, '\\-')}([^A-Za-z0-9_-]|$)`);
    const referencedBy = [];
    for (const d of getAllDeclarations()) {
      if (!d.body) continue;
      if (fullRe.test(d.body) || bareRe.test(d.body)) {
        referencedBy.push({ name: d.name, kind: d.kind, path: d.path });
      }
    }
    return {
      name: entry.name,
      category: entry.category,
      required: entry.required,
      themeValues,
      referencedBy: referencedBy.slice(0, 20),
    };
  },

  search_tokens({ query, category, limit = 200 } = {}) {
    if (!query || typeof query !== 'string') throw new Error('search_tokens: query is required');
    const q = query.toLowerCase();
    const { byName } = getTokens();
    const matches = [];
    for (const entry of Object.values(byName)) {
      if (category && entry.category !== category) continue;
      if (entry.name.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q)) {
        matches.push(entry);
        if (matches.length >= limit) break;
      }
    }
    return { total: matches.length, items: matches };
  },

  // ─── Animations ────────────────────────────────────────────────────────

  list_animations() {
    const { vocabulary, speeds, mixins, effects } = getAnimations();
    const items = Object.entries(vocabulary).map(([slug, keyframe]) => ({
      slug,
      keyframe,
      // The mixin call form most consumers reach for.
      usage: `@include cia.animate(${slug});`,
    }));
    return {
      total: items.length,
      items,
      speeds,
      effects,
      mixins: mixins.map((m) => ({
        name: m.name,
        signature: m.signature,
        summary: firstSentence(m.doc),
      })),
    };
  },

  get_animation({ name } = {}) {
    if (!name) throw new Error('get_animation: name is required');
    const needle = String(name).trim();
    const { vocabulary, speeds, mixins } = getAnimations();
    if (vocabulary[needle]) {
      return {
        slug: needle,
        keyframe: vocabulary[needle],
        speeds,
        usage: [
          `@include cia.animate(${needle});`,
          `@include cia.animate(${needle}, $speed: slow);`,
          `@include cia.animate(${needle}, $iteration: infinite);`,
        ],
        mixin: mixins.find((m) => m.name === 'animate') ? {
          name: 'animate',
          signature: mixins.find((m) => m.name === 'animate').signature,
        } : null,
      };
    }
    // Allow callers to ask for the `animate` / `animate-on` mixins directly.
    const asMixin = mixins.find((m) => m.name === needle);
    if (asMixin) {
      return {
        name: asMixin.name,
        kind: 'mixin',
        signature: asMixin.signature,
        doc: asMixin.doc,
        body: asMixin.body,
        path: asMixin.path,
      };
    }
    throw new Error(`Unknown animation: ${needle}. Try list_animations.`);
  },

  // ─── Components ────────────────────────────────────────────────────────

  list_components() {
    const items = getComponents().map((c) => ({
      name: c.name,
      description: firstSentence(c.description),
      mixinCount: c.mixinCount,
      path: c.path,
    }));
    return { total: items.length, items };
  },

  get_component({ name } = {}) {
    if (!name) throw new Error('get_component: name is required');
    const needle = String(name).trim();
    const found = getComponents().find((c) => c.name === needle);
    if (!found) throw new Error(`Unknown component: ${needle}. Try list_components.`);
    const mixins = getAllDeclarations()
      .filter((d) => d.component === needle && d.kind === 'mixin' && !d.name.startsWith('_'))
      .map((d) => ({
        name: d.name,
        signature: d.signature,
        summary: firstSentence(d.doc),
        body: d.body,
      }));
    return {
      name: found.name,
      path: found.path,
      description: found.description,
      mixins,
    };
  },

  // ─── Recipes ───────────────────────────────────────────────────────────

  list_recipes() {
    const items = listRecipeFiles(RECIPES_DIR).map((f) => {
      const info = recipeInfo(f);
      return {
        name: info.name,
        kind: info.kind,
        category: info.category,
        complexity: info.complexity,
        path: info.path,
        description: info.description,
        usage: info.usage,
      };
    });
    return { total: items.length, items };
  },

  get_recipe({ name } = {}) {
    if (!name) throw new Error('get_recipe: name is required');
    const needle = String(name).trim().replace(/\.(md|scss)$/, '').replace(/^_/, '');
    const file = listRecipeFiles(RECIPES_DIR).find((f) => f.name === needle);
    if (!file) throw new Error(`Unknown recipe: ${needle}. Try list_recipes.`);
    const info = recipeInfo(file);
    return {
      name: info.name,
      kind: info.kind,
      category: info.category,
      complexity: info.complexity,
      path: info.path,
      description: info.description,
      usage: info.usage,
      body: info.body,
    };
  },

  // ─── Docs ──────────────────────────────────────────────────────────────

  read_llm_txt()      { return readDocFile('llm.txt'); },
  read_changelog()    { return readDocFile('CHANGELOG.md'); },
  read_migration()    { return readDocFile('MIGRATION.md'); },
  read_theming()      { return readDocFile('THEMING.md'); },
  read_agents()       { return readDocFile('AGENTS.md'); },
  read_contract()     { return readDocFile('CONTRACT.md'); },
  read_three_tiers()  { return readDocFile('THREE-TIERS.md'); },
  read_readme()       { return readDocFile('README.md'); },

  // ─── Prompt assembly ───────────────────────────────────────────────────

  /**
   * Build a ready-to-paste context block for an LLM consuming cia. Intent
   * picks which slice of the surface gets bundled:
   *   - 'mixin:<name>'      → mixin signature + doc + body + token refs
   *   - 'component:<name>'  → component file body + all its mixins
   *   - 'theme:<name>'      → theme tokens + light-dark notes + raw scss
   *   - 'overview'          → llm.txt + theme list + key rules
   *   - 'tokens'            → categorized token contract
   *   - 'animations'        → animation vocabulary + mixin signature
   *   - 'recipe:<name>'     → recipe body + import path
   */
  assemble_prompt({ intent, args } = {}) {
    if (!intent || typeof intent !== 'string') throw new Error('assemble_prompt: intent is required');
    const [kind, target] = intent.includes(':') ? intent.split(':', 2) : [intent, null];

    const lines = [];
    const banner = (s) => { lines.push(`# ${s}`); lines.push(''); };
    const sub = (s) => { lines.push(`## ${s}`); lines.push(''); };

    switch (kind) {
      case 'overview': {
        banner('css-is-awesome — agent context');
        sub('llm.txt (canonical agent intro)');
        lines.push(readDocFile('llm.txt').body);
        lines.push('');
        sub('Themes available');
        for (const t of getThemes()) {
          lines.push(`- **${t.name}** — ${firstSentence(t.description) || '(no description)'}`);
        }
        lines.push('');
        sub('Hard rules');
        lines.push('1. No JavaScript in the cia npm package.');
        lines.push('2. No `@layer` — Tier 3 bare-tags use `:where()` (0,0,0 specificity).');
        lines.push('3. No BEM. Consumers pick their own selector names.');
        lines.push('4. One theme = one file. Both light + dark inside via `light-dark()`.');
        lines.push('5. The `cia-` prefix is library-owned.');
        break;
      }
      case 'mixin': {
        if (!target) throw new Error('assemble_prompt: intent "mixin:" requires a name');
        const m = handlers.get_mixin({ name: target });
        banner(`css-is-awesome mixin: ${m.name}`);
        sub('Signature');
        lines.push('```scss');
        lines.push(m.signature);
        lines.push('```');
        lines.push('');
        if (m.doc) { sub('Documentation'); lines.push(m.doc); lines.push(''); }
        sub('Body');
        lines.push('```scss');
        lines.push(m.body);
        lines.push('```');
        lines.push('');
        sub('Source');
        lines.push(`${m.path}:${m.startLine}-${m.endLine}`);
        break;
      }
      case 'component': {
        if (!target) throw new Error('assemble_prompt: intent "component:" requires a name');
        const c = handlers.get_component({ name: target });
        banner(`css-is-awesome component: ${c.name}`);
        if (c.description) { sub('Description'); lines.push(c.description); lines.push(''); }
        sub(`Public mixins (${c.mixins.length})`);
        for (const m of c.mixins) {
          lines.push(`### ${m.name}`);
          lines.push('');
          lines.push('```scss');
          lines.push(m.signature);
          lines.push('```');
          if (m.summary) { lines.push(''); lines.push(m.summary); }
          lines.push('');
        }
        sub('Usage pattern');
        lines.push('```scss');
        lines.push('@use \'css-is-awesome/api\' as cia;');
        lines.push('');
        lines.push(`.my-${c.name} { @include cia.${c.name}; }`);
        lines.push('```');
        break;
      }
      case 'theme': {
        if (!target) throw new Error('assemble_prompt: intent "theme:" requires a name');
        const t = handlers.get_theme({ name: target });
        banner(`css-is-awesome theme: ${t.name}`);
        if (t.description) { sub('Intent'); lines.push(t.description); lines.push(''); }
        sub('Stats');
        lines.push(`- Tokens declared: ${t.tokenCount}`);
        lines.push(`- light-dark() pairs: ${t.supportsLightDark ? 'yes' : 'no'}`);
        lines.push(`- Source: ${t.path}`);
        lines.push('');
        sub('Usage');
        lines.push('```html');
        lines.push(`<link rel="stylesheet" href="/themes/${t.file}/theme.css">`);
        lines.push(`<html data-theme="${t.name}">`);
        lines.push('```');
        lines.push('');
        sub('Token assignments');
        lines.push('```scss');
        lines.push(t.raw_scss);
        lines.push('```');
        break;
      }
      case 'tokens': {
        const t = getTokens();
        banner('css-is-awesome — token contract');
        lines.push(`Required: ${t.required.length}. Optional: ${t.optional.length}.`);
        lines.push('');
        sub('By category');
        const cats = Object.keys(t.byCategory).sort();
        for (const cat of cats) {
          lines.push(`### ${cat} (${t.byCategory[cat].length})`);
          lines.push('');
          for (const name of t.byCategory[cat].sort()) lines.push(`- ${name}`);
          lines.push('');
        }
        break;
      }
      case 'animations': {
        const a = getAnimations();
        banner('css-is-awesome — animations');
        sub('Vocabulary');
        for (const [slug, keyframe] of Object.entries(a.vocabulary)) {
          lines.push(`- ${slug} → ${keyframe}`);
        }
        lines.push('');
        sub('Speeds');
        lines.push(a.speeds.map((s) => `- ${s}`).join('\n'));
        lines.push('');
        sub('Effects (animate-on)');
        lines.push(a.effects.map((e) => `- ${e}`).join('\n'));
        lines.push('');
        sub('Usage');
        lines.push('```scss');
        lines.push('@include cia.animate(fade-in);');
        lines.push('@include cia.animate(slide-up, $speed: slow);');
        lines.push('@include cia.animate-on(hover, lift);');
        lines.push('```');
        break;
      }
      case 'recipe': {
        if (!target) throw new Error('assemble_prompt: intent "recipe:" requires a name');
        const r = handlers.get_recipe({ name: target });
        banner(`css-is-awesome recipe: ${r.name}`);
        if (r.description) { sub('Description'); lines.push(r.description); lines.push(''); }
        sub('Import');
        lines.push('```scss');
        lines.push(r.usage);
        lines.push('```');
        lines.push('');
        sub('Body');
        lines.push('```scss');
        lines.push(r.body);
        lines.push('```');
        break;
      }
      default:
        throw new Error(`assemble_prompt: unknown intent "${intent}". Try overview | mixin:<name> | component:<name> | theme:<name> | tokens | animations | recipe:<name>.`);
    }

    if (args && typeof args === 'string' && args.trim()) {
      lines.push('');
      sub('User input');
      lines.push(args.trim());
    }

    return {
      intent,
      target: target || null,
      prompt: lines.join('\n'),
    };
  },

  /**
   * Snap a design px value to cia's 4px geometric grid.
   * Returns the step number, the SCSS call to emit (m.grid(n) when the
   * value is exactly on the grid; m.px(value) as the off-grid fallback),
   * and a human-readable note for AI consumers.
   *
   * Contract: AI agents receiving a px value from a design tool (Figma,
   * mockup, screenshot) should call this and emit the returned scssCall
   * in their generated SCSS — never raw rem/px literals when a cia
   * function applies.
   */
  resolve_size({ px, base = 4 } = {}) {
    if (typeof px !== 'number' || !isFinite(px) || px < 0) {
      throw new Error('resolve_size: px must be a non-negative finite number');
    }
    if (typeof base !== 'number' || base <= 0) {
      throw new Error('resolve_size: base must be a positive number (default 4)');
    }
    const step = Math.round(px / base);
    const snappedPx = step * base;
    const exact = snappedPx === px;
    const remValue = step * (base / 16); // assumes 16px root font-size
    const rawRem = px / 16;
    return {
      px,
      base,
      step,
      exact,
      rem: Number(remValue.toFixed(6)),
      scssCall: exact ? `cia.grid(${step})` : `cia.px(${px})`,
      alternative: exact ? null : `cia.grid(${step})  // snaps to ${snappedPx}px (${Number(remValue.toFixed(4))}rem)`,
      notes: exact
        ? `${px}px is exactly on cia's 4px grid at step ${step}. Use cia.grid(${step}) — emits ${Number(remValue.toFixed(4))}rem.`
        : `${px}px is OFF cia's 4px grid (nearest step ${step} = ${snappedPx}px). Two options: (a) cia.px(${px}) emits ${Number(rawRem.toFixed(4))}rem off-grid, or (b) cia.grid(${step}) snaps to ${snappedPx}px which is ${Number(remValue.toFixed(4))}rem. Prefer (b) unless the design intent specifically requires the off-grid value.`,
    };
  },
};

function readDocFile(name) {
  const abs = path.join(PROJECT_ROOT, name);
  ensureInProject(abs);
  if (!fs.existsSync(abs)) {
    return { path: name, exists: false, body: '' };
  }
  return {
    path: name,
    exists: true,
    body: readFileNormalized(abs) || '',
  };
}

// ─── MCP wiring ──────────────────────────────────────────────────────────────

async function startServer() {
  const { McpServer } = resolveMcp();
  const { StdioServerTransport } = resolveStdio();
  const { z } = require('zod');

  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  const ok = (payload) => ({ content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] });

  // Themes
  server.registerTool('list_themes', {
    description: 'List all shipped themes (boilerplate, sketchbook, press, prism, cupertino, glass, graphite, terminal, terminal-light). Each is a single SCSS file with both light + dark modes via light-dark().',
    inputSchema: {},
  }, async () => ok(handlers.list_themes()));

  server.registerTool('get_theme', {
    description: 'Return one theme: declared token assignments, raw SCSS body, light-dark() support flag, and source path.',
    inputSchema: { name: z.string().describe('Theme name (e.g. "boilerplate", "terminal", "press").') },
  }, async (a) => ok(handlers.get_theme(a || {})));

  server.registerTool('search_themes', {
    description: 'Substring search across theme names, descriptions, and token values.',
    inputSchema: {
      query: z.string(),
      limit: z.number().int().min(1).max(50).optional(),
    },
  }, async (a) => ok(handlers.search_themes(a || {})));

  // Mixins
  server.registerTool('list_mixins', {
    description: 'List every public @mixin (60+ in _mixins.scss + 19 in _layout.scss + per-component mixins). Filter by category (core/layout/animation/icons/generator/component) or component name.',
    inputSchema: {
      category: z.string().optional(),
      component: z.string().optional().describe('Restrict to one component (e.g. "buttons", "overlay", "forms").'),
      limit: z.number().int().min(1).max(2000).optional(),
      offset: z.number().int().min(0).optional(),
    },
  }, async (a) => ok(handlers.list_mixins(a || {})));

  server.registerTool('get_mixin', {
    description: 'Return one mixin: signature, parameter list, doc comment, full body, source path + line range.',
    inputSchema: { name: z.string().describe('Mixin name (e.g. "btn", "card", "animate", "wrap").') },
  }, async (a) => ok(handlers.get_mixin(a || {})));

  server.registerTool('search_mixins', {
    description: 'Substring search across mixin names, signatures, docs, and bodies.',
    inputSchema: {
      query: z.string(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
    },
  }, async (a) => ok(handlers.search_mixins(a || {})));

  // Functions
  server.registerTool('list_functions', {
    description: 'List every public @function (color, space, radius, shadow, font-size, z, etc.). Same shape as list_mixins.',
    inputSchema: {
      category: z.string().optional(),
      limit: z.number().int().min(1).max(2000).optional(),
      offset: z.number().int().min(0).optional(),
    },
  }, async (a) => ok(handlers.list_functions(a || {})));

  server.registerTool('get_function', {
    description: 'Return one function: signature, parameters, doc, body, source location.',
    inputSchema: { name: z.string().describe('Function name (e.g. "color", "space", "radius", "shadow").') },
  }, async (a) => ok(handlers.get_function(a || {})));

  server.registerTool('search_functions', {
    description: 'Substring search across function names, signatures, docs, and bodies.',
    inputSchema: {
      query: z.string(),
      limit: z.number().int().min(1).max(200).optional(),
    },
  }, async (a) => ok(handlers.search_functions(a || {})));

  // Tokens
  server.registerTool('list_tokens', {
    description: 'List the 123 required + optional CSS custom-property tokens from the theme contract (scripts/theme-contract.json). Categories: surface, ink, lines, action, brand, code, type, radius, shadow, fx, motion, space, z-index, semantic, interactive, a11y, misc.',
    inputSchema: {
      category: z.string().optional(),
      required: z.boolean().optional().describe('Filter to required-only (true) or optional-only (false).'),
      limit: z.number().int().min(1).max(2000).optional(),
      offset: z.number().int().min(0).optional(),
    },
  }, async (a) => ok(handlers.list_tokens(a || {})));

  server.registerTool('get_token', {
    description: 'Return one token: category, required flag, sample values across all themes, and the list of mixins/functions that reference it.',
    inputSchema: { name: z.string().describe('Token name with or without the leading "--" (e.g. "--action-primary-default" or "action-primary-default").') },
  }, async (a) => ok(handlers.get_token(a || {})));

  server.registerTool('search_tokens', {
    description: 'Substring search across token names and categories.',
    inputSchema: {
      query: z.string(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(500).optional(),
    },
  }, async (a) => ok(handlers.search_tokens(a || {})));

  // Animations
  server.registerTool('list_animations', {
    description: 'List the animation vocabulary (fade-in, slide-up, scale-in, pop, pulse, shimmer, spin, wiggle, …), the speed keys (fast/normal/slow), the animate-on effects (lift/glow/press/fade), and the mixin signatures.',
    inputSchema: {},
  }, async () => ok(handlers.list_animations()));

  server.registerTool('get_animation', {
    description: 'Return one animation slug → keyframe mapping with usage examples, or the animate/animate-on mixin record by name.',
    inputSchema: { name: z.string().describe('Animation slug (e.g. "fade-in") or mixin name ("animate", "animate-on").') },
  }, async (a) => ok(handlers.get_animation(a || {})));

  // Components
  server.registerTool('list_components', {
    description: 'List every component file under scss/components/ (accordion, buttons, copy-button, data, feedback, forms, navigation, overlay, stepper, tabs).',
    inputSchema: {},
  }, async () => ok(handlers.list_components()));

  server.registerTool('get_component', {
    description: 'Return one component: description, all its public mixins (signature + summary + body), and the source path.',
    inputSchema: { name: z.string().describe('Component name (e.g. "buttons", "overlay", "forms").') },
  }, async (a) => ok(handlers.get_component(a || {})));

  // Recipes
  server.registerTool('list_recipes', {
    description: 'List recipes from scss/recipes/. Two kinds: markdown pattern recipes (kind:"md" — dialog, combobox, print-to-pdf: a pattern to follow in any framework, with category + complexity) and opt-in SCSS recipes (kind:"scss" — e.g. bare-tags, consumed via @use).',
    inputSchema: {},
  }, async () => ok(handlers.list_recipes()));

  server.registerTool('get_recipe', {
    description: 'Return one recipe: name, kind ("md" pattern recipe or "scss" import), category/complexity, usage, and full body (markdown for md recipes, SCSS for scss recipes).',
    inputSchema: { name: z.string().describe('Recipe slug (e.g. "print-to-pdf", "combobox", "bare-tags").') },
  }, async (a) => ok(handlers.get_recipe(a || {})));

  // Docs (each as its own tool so callers don't need to guess paths)
  server.registerTool('read_llm_txt', {
    description: 'Return llm.txt — the canonical single-fetch summary for AI agents.',
    inputSchema: {},
  }, async () => ok(handlers.read_llm_txt()));

  server.registerTool('read_changelog', {
    description: 'Return CHANGELOG.md — full release history including breaking-change notes.',
    inputSchema: {},
  }, async () => ok(handlers.read_changelog()));

  server.registerTool('read_migration', {
    description: 'Return MIGRATION.md — v0.7 → v0.8 migration guide (renames, removed features, breaking changes).',
    inputSchema: {},
  }, async () => ok(handlers.read_migration()));

  server.registerTool('read_theming', {
    description: 'Return THEMING.md — theme authoring + override patterns.',
    inputSchema: {},
  }, async () => ok(handlers.read_theming()));

  server.registerTool('read_agents', {
    description: 'Return AGENTS.md — entry point for AI coding agents (rules, tiers, quick decisions).',
    inputSchema: {},
  }, async () => ok(handlers.read_agents()));

  server.registerTool('read_contract', {
    description: 'Return CONTRACT.md — human-readable token contract.',
    inputSchema: {},
  }, async () => ok(handlers.read_contract()));

  server.registerTool('read_three_tiers', {
    description: 'Return THREE-TIERS.md — the three authoring tiers (mixin / utility class / bare tag).',
    inputSchema: {},
  }, async () => ok(handlers.read_three_tiers()));

  server.registerTool('read_readme', {
    description: 'Return README.md — top-level install + usage.',
    inputSchema: {},
  }, async () => ok(handlers.read_readme()));

  // Prompt assembly
  server.registerTool('assemble_prompt', {
    description: 'Build a ready-to-paste context block for an LLM consuming cia. Intent picks the slice: "overview" | "mixin:<name>" | "component:<name>" | "theme:<name>" | "tokens" | "animations" | "recipe:<name>".',
    inputSchema: {
      intent: z.string().describe('Intent string. Examples: "overview", "mixin:btn", "component:overlay", "theme:terminal", "tokens", "animations", "recipe:bare-tags".'),
      args: z.string().optional().describe('Optional user input appended to the assembled block.'),
    },
  }, async (a) => ok(handlers.assemble_prompt(a || {})));

  // Size resolution — map design px values to cia's 4px geometric grid.
  server.registerTool('resolve_size', {
    description: 'Snap a design px value to cia\'s 4px geometric grid. Returns the step number, the SCSS call to emit (cia.grid(n) when exactly on grid; cia.px(value) when off-grid), the equivalent rem, and a human-readable note. AI agents: call this whenever you get a px value from a design tool (Figma, mockup, screenshot) and need to express it in cia code. NEVER write raw rem/px literals when a cia function applies. See /docs/composition for the full decision tree.',
    inputSchema: {
      px: z.number().describe('The px value from the design (e.g. 24 for a 24px button height).'),
      base: z.number().optional().describe('Grid base in px (default 4, matching cia\'s 4px grid).'),
    },
  }, async (a) => ok(handlers.resolve_size(a || {})));

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (require.main === module) {
  startServer().catch((err) => {
    // stderr is fine — stdio MCP transport owns stdout for protocol traffic.
    console.error(`css-is-awesome MCP server failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  handlers,
  startServer,
  SERVER_NAME,
  SERVER_VERSION,
  // Exported for ad-hoc tests / external introspection.
  parseScssDeclarations,
  parseThemeFile,
  loadTokenContract,
  loadAnimations,
};
