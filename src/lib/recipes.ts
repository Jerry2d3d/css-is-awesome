// Server-only by construction: importing `node:fs` makes this module
// impossible to bundle into a client component, so no `server-only` guard dep
// is needed. Imported only by the recipes Server Components.
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

// ─── Where the recipes live ──────────────────────────────────────────────────
// Recipes are authored as Markdown in `scss/recipes/*.md` so they ship inside
// the npm package AND feed the MCP server. This module reads them at BUILD TIME
// inside a Server Component, so the markdown parser never reaches the browser —
// zero client JS, consistent with cia's no-JS-in-the-package rule.
const RECIPES_DIR = path.join(process.cwd(), "scss", "recipes");

// Files that live in the folder but are not themselves recipes.
//  - `_`-prefixed   → partials / templates (e.g. _recipe-template.md)
//  - README.md      → folder index, not a recipe
// Mirrors the MCP server's convention so both surfaces agree on what counts.
function isRecipeFile(file: string): boolean {
  return file.endsWith(".md") && !file.startsWith("_") && file !== "README.md";
}

export type RecipeFrontmatter = {
  name: string;
  description: string;
  category: string | null;
  complexity: string | null;
  ciaVersion: string | null;
};

export type RecipeMeta = RecipeFrontmatter & { slug: string };
export type Recipe = RecipeMeta & { html: string };

// Small acronyms that should stay upper-cased in a prettified title, and
// joining words that stay lower-cased unless they lead. Shared by the recipe
// index cards and the recipe page heading so both read identically.
const ACRONYMS = new Set(["pdf", "css", "html", "aria", "url", "api", "ui"]);
const SMALL_WORDS = new Set(["to", "of", "and", "a", "an", "the", "for", "from"]);

/** "print-to-pdf" → "Print to PDF", "combobox" → "Combobox". */
export function prettifyRecipeName(name: string): string {
  return name
    .split("-")
    .map((word, i) => {
      if (ACRONYMS.has(word)) return word.toUpperCase();
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// A dedicated Marked instance (GFM on by default in v15: tables, fenced code,
// task lists). We override the code renderer so every fenced block is wrapped
// in `.recipe-codeblock` — the hook the client island uses to attach a Copy
// button, and the selector globals.css styles. The language class is preserved
// for anyone who later wants to bolt on a highlighter.
const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const langClass = lang ? ` class="language-${escapeAttr(lang)}"` : "";
      const langLabel = lang
        ? `<span class="recipe-codeblock-lang" aria-hidden="true">${escapeHtml(lang)}</span>`
        : "";
      return `<div class="recipe-codeblock" data-lang="${escapeAttr(lang ?? "")}">${langLabel}<pre><code${langClass}>${escapeHtml(text)}\n</code></pre></div>`;
    },
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

// Split a leading `--- … ---` YAML-ish block from the body. We only need flat
// `key: value` pairs (the recipe schema is flat), so a full YAML parser would
// be overkill — this matches the same shape the MCP server reads.
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    // Strip matching surrounding quotes, e.g. cia-version: ">=1.0.0".
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

function toFrontmatter(data: Record<string, string>, slug: string): RecipeFrontmatter {
  return {
    name: data.name || slug,
    description: data.description || "",
    category: data.category || null,
    complexity: data.complexity || null,
    ciaVersion: data["cia-version"] || null,
  };
}

/** Slugs for every renderable recipe — drives `generateStaticParams`. */
export function getRecipeSlugs(): string[] {
  if (!fs.existsSync(RECIPES_DIR)) return [];
  return fs
    .readdirSync(RECIPES_DIR)
    .filter(isRecipeFile)
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/** Frontmatter-only listing for the recipes index (no markdown parse). */
export function getRecipeIndex(): RecipeMeta[] {
  return getRecipeSlugs().map((slug) => {
    const raw = fs.readFileSync(path.join(RECIPES_DIR, `${slug}.md`), "utf8");
    const { data } = parseFrontmatter(raw);
    return { slug, ...toFrontmatter(data, slug) };
  });
}

/** Full recipe (frontmatter + rendered HTML) for a single page. */
export function getRecipe(slug: string): Recipe | null {
  if (!isRecipeFile(`${slug}.md`)) return null;
  const file = path.join(RECIPES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const html = marked.parse(body) as string;
  return { slug, ...toFrontmatter(data, slug), html };
}
