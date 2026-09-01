#!/usr/bin/env node
// ============================================================================
// validate-recipes.mjs
// ============================================================================
// Guards `scss/recipes/*.md` — the v1.0 recipes book.
//
// Why this exists (US-01.1.3, EPIC-01):
// A recipe is not documentation ABOUT cia, it is the deliverable. It is read by
// three consumers that all break differently when it rots:
//
//   1. Humans   — `/docs/recipes/[slug]` renders it (src/lib/recipes.ts).
//   2. AI agents— `mcp/server.cjs` serves it via list_recipes / get_recipe /
//                 assemble_prompt.
//   3. Copy-paste— someone pastes the `scss` block into a real component.
//
// Nothing checked any of it. The dangerous failure is silent: a mixin gets
// renamed in scss/, every existing guard (validate-api, api-coverage,
// validate-package) stays green because they only test the API against
// ITSELF — and the recipe now teaches a call that does not exist. A recipe
// that teaches a dead mixin is worse than no recipe, because the reader
// trusts it.
//
// So the headline check here is not "does the markdown have the right
// headings" — it is: THE SCSS IN EVERY FENCED BLOCK ACTUALLY COMPILES, and
// EVERY `cia.<name>` SYMBOL IT REFERENCES STILL EXISTS IN THE /api BARREL.
// The structural checks are cheap insurance on top of that.
//
// Checks per recipe:
//   1. frontmatter — every field src/lib/recipes.ts reads is present, non-empty
//      and valid (name matches the slug, category/complexity in the enum).
//   2. sections    — the 6 required H2s exist, in the order README.md documents.
//   3. scss        — every ```scss block compiles with `sass`, loadPaths ['scss'].
//   4. api symbols — every `cia.x` / `m.x` resolves through the /api barrel,
//                    asserted with meta.mixin-exists / meta.function-exists.
//   5. a11y        — the A11y checklist is non-empty and its links are
//                    well-formed absolute URLs (never fetched).
//   6. frameworks  — React + Vue + Svelte + vanilla subsections (US-01.2.6).
//   7. forbidden   — the README "Forbidden in recipes" list, minus the rules
//                    that would false-fail (see FORBIDDEN notes below).
//
// Two notes on how the SCSS is compiled:
//
//   * `@use 'css-is-awesome/api'` cannot resolve in-repo — that specifier needs
//     node_modules. It is rewritten to `@use 'api'`, which is the SAME FILE
//     (package.json exports "./api" → "./scss/api.scss"), so the barrel under
//     test is the real one. Proving the PUBLISHED specifier resolves is
//     validate-package.mjs's job, deliberately not duplicated here.
//   * Many blocks are fragments with no `@use` of their own (a Variants delta,
//     a Pitfalls one-liner). Rather than skip them — they are the blocks most
//     likely to rot, because nobody re-reads a Pitfalls snippet — the harness
//     prepends `@use 'api' as <ns>;` for exactly the namespaces the fragment
//     references, and compiles it standalone. A fragment referencing no cia
//     namespace at all is compiled as-is (it still has to be valid SCSS).
//
// The known trap: `scss/recipes/` holds BOTH kinds of recipe. `<slug>.md` are
// pattern recipes (this script's subject); `_<slug>.scss` (e.g. _bare-tags.scss)
// are real importable SCSS and are NOT recipe documents. Same skip rule as
// src/lib/recipes.ts and mcp/server.cjs: `.md` only, no `_` prefix, no README.
//
// Usage:
//   node scripts/validate-recipes.mjs            # exit 0 = pass, 1 = fail
//   node scripts/validate-recipes.mjs --verbose  # also list every symbol/block
//   node scripts/validate-recipes.mjs --dir=<p>  # check a fixture dir instead
//
// `--dir` exists so the guard itself can be exercised: point it at a folder of
// deliberately-broken copies and confirm each check actually goes red. A guard
// nobody has watched fail is being trusted on faith. SCSS still compiles
// against this repo's scss/ regardless of --dir.
// ============================================================================

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCSS = path.join(ROOT, "scss");

const argv = process.argv.slice(2);
const verbose = argv.includes("--verbose");
const dirArg = argv.find((a) => a.startsWith("--dir="));
const RECIPES_DIR = dirArg ? path.resolve(dirArg.slice("--dir=".length)) : path.join(SCSS, "recipes");

// ─── The schema (scss/recipes/README.md) ────────────────────────────────────

// Exactly the fields src/lib/recipes.ts reads. If that file grows a field,
// this list grows with it — that is the contract, not the README table.
const REQUIRED_FIELDS = ["name", "description", "category", "complexity", "cia-version"];
const CATEGORIES = new Set(["overlay", "input", "data", "navigation", "feedback", "layout", "auth"]);
const COMPLEXITIES = new Set(["simple", "medium", "complex"]);

const REQUIRED_SECTIONS = [
  "Use this when",
  "Structure (raw HTML)",
  "Styling (cia mixins)",
  "Interactivity",
  "A11y checklist",
  "Framework examples",
];
const OPTIONAL_SECTIONS = new Set(["Variants", "Pitfalls", "Related recipes"]);

// US-01.2.6 — every recipe ships all four. Matched loosely against the H3 text
// so "Vanilla (Web Component)" counts as vanilla.
const FRAMEWORKS = [
  { label: "React", re: /\breact\b/i },
  { label: "Vue", re: /\bvue\b/i },
  { label: "Svelte", re: /\bsvelte\b/i },
  { label: "Vanilla", re: /\bvanilla\b|web component/i },
];

// `@use 'css-is-awesome/...'` → an in-repo specifier resolvable from scss/.
const IMPORT_REWRITES = [
  [/(['"])css-is-awesome\/api\1/g, "'api'"],
  [/(['"])css-is-awesome\/scss\/api\1/g, "'api'"],
  [/(['"])css-is-awesome\/scss\/([^'"]+)\1/g, "'$2'"],
  [/(['"])css-is-awesome\1/g, "'main'"],
];

// ─── Markdown scanning ──────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  // Same shape src/lib/recipes.ts and mcp/server.cjs parse: flat key: value.
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return null;
  const data = {};
  const lines = m[1].split(/\r?\n/);
  lines.forEach((line, i) => {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) return;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = { value, line: i + 2 }; // +2: the opening --- is line 1
  });
  return { data, consumedLines: m[0].split(/\r?\n/).length - 1 };
}

// Walk the file line by line, pulling out fenced code blocks and blanking them
// out of a parallel "prose" array. Headings must be read from the prose copy —
// a ```md example containing `## Foo` is not a section of this document.
// Fences can be indented (print-to-pdf nests one inside a Pitfalls bullet), so
// the opener's indentation is stripped from the captured code.
function scanMarkdown(rawLines, startIdx) {
  const prose = rawLines.slice();
  for (let i = 0; i < startIdx; i++) prose[i] = "";

  const blocks = [];
  let i = startIdx;
  while (i < rawLines.length) {
    const open = /^(\s*)(`{3,})\s*([A-Za-z0-9_+-]*)\s*$/.exec(rawLines[i]);
    if (!open) {
      i++;
      continue;
    }
    const [, indent, fence, lang] = open;
    const closeRe = new RegExp("^\\s*`{" + fence.length + ",}\\s*$");
    const startLine = i + 1; // 1-based, points at the opening fence
    prose[i] = "";
    i++;

    const code = [];
    let closed = false;
    while (i < rawLines.length) {
      if (closeRe.test(rawLines[i])) {
        prose[i] = "";
        i++;
        closed = true;
        break;
      }
      code.push(rawLines[i].startsWith(indent) ? rawLines[i].slice(indent.length) : rawLines[i]);
      prose[i] = "";
      i++;
    }
    blocks.push({ lang: lang.toLowerCase(), code: code.join("\n"), line: startLine, closed });
  }
  return { prose, blocks };
}

function headings(prose) {
  const out = [];
  prose.forEach((line, idx) => {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) out.push({ level: m[1].length, text: m[2], line: idx + 1 });
  });
  return out;
}

// ─── SCSS extraction ────────────────────────────────────────────────────────

function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1"); // the [^:] guard spares https:// in strings
}

/** Namespaces (`cia`, `m`) a fragment references but does not itself @use. */
function missingNamespaces(code) {
  const used = new Set();
  for (const m of code.matchAll(/(?:^|[^\w$.-])(cia|m)\.[\w$-]/g)) used.add(m[1]);
  const missing = [];
  for (const ns of used) {
    if (!new RegExp(`@use\\s+['"][^'"]+['"]\\s+as\\s+${ns}\\b`).test(code)) missing.push(ns);
  }
  return missing;
}

function toCompilable(code) {
  let src = code;
  for (const [re, to] of IMPORT_REWRITES) src = src.replace(re, to);
  const prelude = missingNamespaces(src).map((ns) => `@use 'api' as ${ns};`);
  return { src: prelude.length ? `${prelude.join("\n")}\n${src}` : src, prelude };
}

/** Every cia/m symbol a block references, split by how it is called. */
function referencedSymbols(code) {
  const clean = stripComments(code);
  const mixins = new Set();
  const fns = new Set();
  const rest = clean.replace(/@include\s+(cia|m)\.([\w-]+)/g, (_s, _ns, name) => {
    mixins.add(name);
    return " ";
  });
  for (const m of rest.matchAll(/(?:^|[^\w$.-])(cia|m)\.([\w-]+)\s*\(/g)) fns.add(m[2]);
  return { mixins, fns };
}

// One compile answers every symbol question for the whole run. meta.*-exists
// against the `cia` namespace is the authoritative test: it asks the barrel
// itself, so a mixin that moved modules but is still forwarded stays green,
// and a rename goes red.
function probeApiSymbols(mixinNames, fnNames) {
  const decls = [];
  const keys = [];
  [...mixinNames].sort().forEach((n, i) => {
    keys.push({ kind: "mixin", name: n, prop: `--mx${i}` });
    decls.push(`  --mx${i}: #{meta.mixin-exists("${n}", "cia")};`);
  });
  [...fnNames].sort().forEach((n, i) => {
    keys.push({ kind: "function", name: n, prop: `--fn${i}` });
    decls.push(`  --fn${i}: #{meta.function-exists("${n}", "cia")};`);
  });
  const result = new Map();
  if (!decls.length) return result;

  const src = `@use 'sass:meta';\n@use 'api' as cia;\n.probe {\n${decls.join("\n")}\n}\n`;
  const css = sass.compileString(src, { loadPaths: [SCSS] }).css;
  for (const k of keys) {
    const m = new RegExp(`${k.prop}:\\s*(true|false)`).exec(css);
    result.set(`${k.kind}:${k.name}`, m ? m[1] === "true" : false);
  }
  return result;
}

// ─── Parse every recipe ─────────────────────────────────────────────────────

// Identical skip rule to src/lib/recipes.ts + mcp/server.cjs. `.scss` files in
// this folder (_bare-tags.scss) are importable SCSS recipes, NOT documents.
function isRecipeFile(file) {
  return file.endsWith(".md") && !file.startsWith("_") && file !== "README.md";
}

if (!existsSync(RECIPES_DIR)) {
  console.error(`validate-recipes FAILED — ${path.relative(ROOT, RECIPES_DIR)} does not exist.`);
  process.exit(1);
}

const files = readdirSync(RECIPES_DIR).sort();
const recipeFiles = files.filter(isRecipeFile);
const skipped = files.filter((f) => !isRecipeFile(f));

console.log(`validate-recipes — ${path.relative(ROOT, RECIPES_DIR).split(path.sep).join("/")}/*.md\n`);

if (!recipeFiles.length) {
  console.error("  ✗ no recipes found — the recipes book is the v1.0 headline deliverable.");
  process.exit(1);
}

const docs = recipeFiles.map((file) => {
  const abs = path.join(RECIPES_DIR, file);
  const raw = readFileSync(abs, "utf8");
  const rawLines = raw.split(/\r?\n/);
  const fm = parseFrontmatter(raw);
  const { prose, blocks } = scanMarkdown(rawLines, fm ? fm.consumedLines : 0);
  const heads = headings(prose);

  const scssBlocks = blocks.filter((b) => b.lang === "scss" || b.lang === "css");
  const mixins = new Set();
  const fns = new Set();
  for (const b of scssBlocks) {
    const s = referencedSymbols(b.code);
    s.mixins.forEach((n) => mixins.add(n));
    s.fns.forEach((n) => fns.add(n));
  }

  return { file, slug: file.replace(/\.md$/, ""), raw, prose, blocks, scssBlocks, heads, fm, mixins, fns };
});

// One probe compile for the whole run.
const allMixins = new Set();
const allFns = new Set();
for (const d of docs) {
  d.mixins.forEach((n) => allMixins.add(n));
  d.fns.forEach((n) => allFns.add(n));
}

let symbolTable;
try {
  symbolTable = probeApiSymbols(allMixins, allFns);
} catch (err) {
  console.error(`  ✗ could not probe the /api barrel: ${String(err.message).split("\n")[0]}`);
  console.error("    Every symbol check below would be a false failure. Fix the barrel first.");
  process.exit(1);
}

// ─── Check + report ─────────────────────────────────────────────────────────

let failures = 0;
let warnings = 0;

function report(doc) {
  const out = [];
  const fail = (msg) => {
    out.push(`  ✗ ${msg}`);
    failures++;
  };
  const pass = (msg) => out.push(`  ✓ ${msg}`);
  const warn = (msg) => {
    out.push(`  ! ${msg}`);
    warnings++;
  };
  const at = (line) => `${doc.file}:${line}`;

  // ── 1. Frontmatter ────────────────────────────────────────────────────────
  if (!doc.fm) {
    fail(`frontmatter — no leading \`---\` block; the site and MCP both render this recipe nameless (${at(1)})`);
  } else {
    const problems = [];
    for (const field of REQUIRED_FIELDS) {
      const entry = doc.fm.data[field];
      if (!entry) problems.push(`missing \`${field}\``);
      else if (!entry.value) problems.push(`\`${field}\` is empty (${at(entry.line)})`);
    }
    const name = doc.fm.data.name?.value;
    if (name && name !== doc.slug) {
      problems.push(`\`name: ${name}\` does not match the filename slug \`${doc.slug}\` (${at(doc.fm.data.name.line)})`);
    }
    const category = doc.fm.data.category?.value;
    if (category && !CATEGORIES.has(category)) {
      problems.push(`\`category: ${category}\` is not one of ${[...CATEGORIES].join(" | ")} (${at(doc.fm.data.category.line)})`);
    }
    const complexity = doc.fm.data.complexity?.value;
    if (complexity && !COMPLEXITIES.has(complexity)) {
      problems.push(`\`complexity: ${complexity}\` is not one of ${[...COMPLEXITIES].join(" | ")} (${at(doc.fm.data.complexity.line)})`);
    }
    if (problems.length) for (const p of problems) fail(`frontmatter — ${p}`);
    else pass(`frontmatter — ${REQUIRED_FIELDS.length}/${REQUIRED_FIELDS.length} fields present and valid`);
  }

  // ── 2. Required sections, in order ────────────────────────────────────────
  const h2 = doc.heads.filter((h) => h.level === 2);
  const found = REQUIRED_SECTIONS.map((title) => ({
    title,
    idx: h2.findIndex((h) => h.text === title),
  }));
  const missing = found.filter((f) => f.idx === -1);
  if (missing.length) {
    for (const m of missing) fail(`sections — missing required H2 \`## ${m.title}\``);
  } else {
    const outOfOrder = [];
    for (let i = 1; i < found.length; i++) {
      if (found[i].idx < found[i - 1].idx) {
        outOfOrder.push(`\`${found[i].title}\` (${at(h2[found[i].idx].line)}) appears before \`${found[i - 1].title}\``);
      }
    }
    if (outOfOrder.length) for (const o of outOfOrder) fail(`sections — out of documented order: ${o}`);
    else pass(`sections — ${REQUIRED_SECTIONS.length} required H2s present, in documented order`);
  }
  for (const h of h2) {
    if (!REQUIRED_SECTIONS.includes(h.text) && !OPTIONAL_SECTIONS.has(h.text)) {
      warn(`sections — \`## ${h.text}\` is not in the schema (${at(h.line)}); allowed extras: ${[...OPTIONAL_SECTIONS].join(", ")}`);
    }
  }

  // ── 3. Every scss block compiles ──────────────────────────────────────────
  if (!doc.scssBlocks.length) {
    fail("scss — no fenced ```scss block; a recipe with no styling teaches nothing");
  } else {
    let ok = 0;
    const fragments = [];
    for (const b of doc.scssBlocks) {
      if (!b.closed) {
        fail(`scss — unterminated fence opened at ${at(b.line)}`);
        continue;
      }
      const { src, prelude } = toCompilable(b.code);
      if (prelude.length) fragments.push(`${b.line}:${prelude.length}`);
      try {
        sass.compileString(src, { loadPaths: [SCSS] });
        ok++;
      } catch (err) {
        const msg = String(err.message).split("\n")[0];
        fail(`scss — block at ${at(b.line)} does not compile: ${msg}`);
      }
    }
    if (ok === doc.scssBlocks.length) {
      const frag = fragments.length ? `, ${fragments.length} as fragments with a synthesised @use` : "";
      pass(`scss — ${ok}/${doc.scssBlocks.length} block(s) compile against scss/${frag}`);
    }
  }

  // ── 4. Every referenced symbol still exists in /api ───────────────────────
  const dead = [];
  for (const n of [...doc.mixins].sort()) {
    if (!symbolTable.get(`mixin:${n}`)) {
      const alt = symbolTable.get(`function:${n}`) ? " (exists as a FUNCTION — wrong call form)" : "";
      dead.push(`mixin \`cia.${n}\`${alt}`);
    }
  }
  for (const n of [...doc.fns].sort()) {
    if (!symbolTable.get(`function:${n}`)) {
      const alt = symbolTable.get(`mixin:${n}`) ? " (exists as a MIXIN — needs @include)" : "";
      dead.push(`function \`cia.${n}()\`${alt}`);
    }
  }
  const total = doc.mixins.size + doc.fns.size;
  if (dead.length) {
    for (const d of dead) fail(`api symbols — ${d} does not exist in the /api barrel`);
  } else if (total === 0) {
    warn("api symbols — the styling blocks call no cia mixin or function at all");
  } else {
    pass(`api symbols — ${total} referenced (${doc.mixins.size} mixin, ${doc.fns.size} function) all resolve through /api`);
    if (verbose) {
      out.push(`      mixins:    ${[...doc.mixins].sort().join(", ") || "—"}`);
      out.push(`      functions: ${[...doc.fns].sort().join(", ") || "—"}`);
    }
  }

  // ── 5. A11y checklist ─────────────────────────────────────────────────────
  const a11yIdx = doc.heads.findIndex((h) => h.level === 2 && h.text === "A11y checklist");
  if (a11yIdx !== -1) {
    const start = doc.heads[a11yIdx].line;
    const next = doc.heads.slice(a11yIdx + 1).find((h) => h.level === 2);
    const end = next ? next.line - 1 : doc.prose.length;
    const body = doc.prose.slice(start, end);
    const items = body.filter((l) => /^\s*[-*]\s+\S/.test(l));

    if (!items.length) {
      fail(`a11y — checklist section is empty (${at(start)}); it is the section reviewers rely on`);
    } else {
      const links = [];
      const badLinks = [];
      body.forEach((line, i) => {
        // Deliberately permissive: `[^)]*` also captures a URL with a space in
        // it. A whitespace-free pattern would simply not match a broken link,
        // and the check would pass by looking away — which is how a dead WCAG
        // reference would ship.
        for (const m of line.matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)) {
          const url = m[2].replace(/\s+["'][^"']*["']\s*$/, "").trim(); // drop an optional title
          const lineNo = start + i + 1;
          if (/^\.{0,2}\//.test(url) || url.startsWith("#")) continue; // relative cross-links
          if (!url || /\s/.test(url)) {
            badLinks.push(`\`${m[2]}\` is not a usable link target (${at(lineNo)})`);
            continue;
          }
          let parsed;
          try {
            parsed = new URL(url);
          } catch {
            badLinks.push(`\`${url}\` is not a parseable URL (${at(lineNo)})`);
            continue;
          }
          if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname) {
            badLinks.push(`\`${url}\` is not an http(s) URL (${at(lineNo)})`);
            continue;
          }
          if (parsed.protocol === "http:") warn(`a11y — \`${url}\` uses http, prefer https (${at(lineNo)})`);
          links.push(url);
        }
      });

      if (badLinks.length) for (const b of badLinks) fail(`a11y — ${b}`);
      else if (!links.length) {
        fail(`a11y — ${items.length} item(s) but no WCAG SC / ARIA pattern link; the schema requires each item to cite one`);
      } else {
        pass(`a11y — ${items.length} checklist item(s), ${links.length} well-formed reference link(s)`);
      }
    }
  }

  // ── 6. Framework examples (US-01.2.6) ─────────────────────────────────────
  const fwIdx = doc.heads.findIndex((h) => h.level === 2 && h.text === "Framework examples");
  if (fwIdx !== -1) {
    const after = doc.heads.slice(fwIdx + 1);
    const stop = after.findIndex((h) => h.level === 2);
    const subs = (stop === -1 ? after : after.slice(0, stop)).filter((h) => h.level === 3);
    const missingFw = FRAMEWORKS.filter((f) => !subs.some((s) => f.re.test(s.text)));
    if (missingFw.length) {
      fail(`frameworks — missing ${missingFw.map((f) => f.label).join(", ")} example(s); the schema requires all 4 (${at(doc.heads[fwIdx].line)})`);
    } else {
      const empty = subs.filter((s) => {
        const next = doc.heads.find((h) => h.line > s.line);
        const end = next ? next.line - 1 : doc.prose.length;
        return !doc.blocks.some((b) => b.line > s.line && b.line <= end && b.code.trim());
      });
      if (empty.length) {
        fail(`frameworks — ${empty.map((s) => `\`${s.text}\` (${at(s.line)})`).join(", ")} has no code block`);
      } else {
        pass(`frameworks — ${subs.length} subsection(s): ${subs.map((s) => s.text).join(", ")}`);
      }
    }
  }

  // ── 7. Forbidden patterns (scss/recipes/README.md) ────────────────────────
  //
  // Enforced as failures. These have zero legitimate use in a recipe:
  //   - `.cia-*` selectors        (that prefix is library-owned)
  //   - BEM `__` / `--` in a class name (project rule: cia is not BEM)
  //   - hard-coded hex colours    (must come from cia.color())
  //   - the emitting bundle `@use 'css-is-awesome'` in an UNLABELLED block —
  //     README allows it in a global stylesheet, and asks that such a block
  //     carry a `// app/globals.scss`-style filename comment, so the comment
  //     is what distinguishes the two.
  //
  // Reported as warnings, not failures:
  //   - inline `style=""`. README bans it outright, but dialog.md uses
  //     `style="display: contents"` on the `<form method="dialog">` wrapper —
  //     a structural necessity, not a styling shortcut. Failing on it would
  //     mean failing a reviewed, shipped recipe, so this stays advisory until
  //     the README rule is narrowed.
  const codeish = doc.blocks.filter((b) => ["scss", "css", "html", "tsx", "jsx", "vue", "svelte"].includes(b.lang));
  const violations = [];
  for (const b of codeish) {
    const clean = stripComments(b.code);
    if (/\.cia-[a-z]/i.test(clean)) violations.push(`\`.cia-*\` selector in the ${b.lang} block at ${at(b.line)} — that prefix is library-owned`);
    if (/\.[A-Za-z][\w-]*__[A-Za-z]/.test(clean) || /\.[A-Za-z][\w-]*--[A-Za-z]/.test(clean)) {
      violations.push(`BEM-style class name in the ${b.lang} block at ${at(b.line)} — cia is mixin-first, not BEM`);
    }
    for (const m of clean.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      violations.push(`hard-coded hex \`${m[0]}\` in the ${b.lang} block at ${at(b.line)} — use cia.color()`);
    }
    if (b.lang === "scss" || b.lang === "css") {
      if (/@use\s+(['"])css-is-awesome\1/.test(clean) && !/globals?\.s?css|global stylesheet|root stylesheet/i.test(b.code)) {
        violations.push(`emitting bundle \`@use 'css-is-awesome'\` in an unlabelled block at ${at(b.line)} — use 'css-is-awesome/api', or label the block as a global stylesheet`);
      }
    }
    if (/\bstyle\s*=\s*["{]/.test(clean)) {
      warn(`forbidden — inline \`style=\` in the ${b.lang} block at ${at(b.line)} (README bans it; advisory only, see script header)`);
    }
  }
  if (violations.length) for (const v of violations) fail(`forbidden — ${v}`);
  else pass("forbidden — no library-owned prefixes, BEM names, hex literals or stray emitting imports");

  console.log(doc.file);
  for (const line of out) console.log(line);
  console.log("");
}

for (const doc of docs) report(doc);

// ─── Summary ────────────────────────────────────────────────────────────────

if (skipped.length) {
  console.log(`skipped (not recipe documents): ${skipped.join(", ")}`);
  console.log(`  \`_*.scss\` here are importable SCSS recipes, \`_*.md\` are templates — neither is rendered.\n`);
}

console.log(`${docs.length} recipe(s) checked — ${failures} failure(s), ${warnings} warning(s).`);

if (failures) {
  console.error(`\nvalidate-recipes FAILED — ${failures} problem(s). A recipe that teaches a dead call is worse than no recipe.`);
  process.exit(1);
}
console.log("validate-recipes passed.");
