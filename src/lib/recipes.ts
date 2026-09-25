// Server-only by construction: importing `node:fs` makes this module
// impossible to bundle into a client component, so no `server-only` guard dep
// is needed. Imported only by the recipes Server Components.
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { recipePlaygroundPayload } from "./playground/recipe-link";

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
const ACRONYMS = new Set(["pdf", "css", "html", "html5", "aria", "url", "api", "ui"]);
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
      // tabindex + role/label: <pre> is horizontally scrollable, so a
      // keyboard-only user needs a focusable, named region to pan it
      // (axe `scrollable-region-focusable`) — same fix as the Example
      // component's Code block (src/components/Example/Example.tsx).
      return `<div class="recipe-codeblock" data-lang="${escapeAttr(lang ?? "")}">${langLabel}<pre tabindex="0" role="region" aria-label="Code sample"><code${langClass}>${escapeHtml(text)}\n</code></pre></div>`;
    },
    // GFM task-list checkboxes are disabled (non-interactive) and purely
    // decorative — the adjacent text already conveys the item, so hide
    // them from the accessibility tree instead of leaving an unlabeled
    // form control behind (axe `label`, critical).
    checkbox({ checked }) {
      return `<input ${checked ? "checked " : ""}disabled aria-hidden="true" type="checkbox">`;
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

// Recipes cross-link each other with relative markdown paths —
// `[print-to-pdf](./print-to-pdf.md)`. That is CORRECT on GitHub (the .md
// files live there) and in the npm-shipped markdown, but the website
// renders each recipe at /docs/recipes/<slug>/, so the browser would
// resolve `./print-to-pdf.md` to /docs/recipes/<slug>/print-to-pdf.md —
// a 404 (browsers don't serve .md). Rewrite those links to their rendered
// routes at build time; the source stays dual-target correct.
//   ./<slug>.md[#hash]  or  <slug>.md[#hash]  →  /docs/recipes/<slug>/[#hash]
//   ./README.md                              →  /docs/recipes/   (the index)
// `../…` paths, external URLs and bare #anchors are left untouched.
function rewriteRecipeMdLinks(html: string): string {
  return html.replace(
    /href="(?:\.\/)?([A-Za-z0-9_-]+)\.md(#[^"]*)?"/g,
    (_match, slug: string, hash: string | undefined) => {
      if (slug === "README") return `href="/docs/recipes/"`;
      return `href="/docs/recipes/${slug}/${hash ?? ""}"`;
    },
  );
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
  const html = rewriteRecipeMdLinks(marked.parse(body) as string);
  return { slug, ...toFrontmatter(data, slug), html };
}

/**
 * The recipe authoring guide, rendered from `scss/recipes/README.md`.
 *
 * RENDERED, NOT RETYPED. The guide already exists as the folder's own README,
 * which is what an author reading the repository finds, what ships inside the
 * npm package, and what the MCP server can hand an agent. Writing a second
 * copy for the website would create two guides that agree until the first
 * time one of them is edited — and this project has enough experience of
 * hand-maintained duplicates drifting to know how that ends.
 *
 * `isRecipeFile()` deliberately excludes README.md from the recipe list, so
 * this is the one place that reads it.
 *
 * The leading `# …` heading is stripped: the page renders its own <h1>, and
 * two of them is both wrong for the document outline and wrong for a11y.
 */
export function getAuthoringGuide(): { title: string; html: string } | null {
  const file = path.join(RECIPES_DIR, "README.md");
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { body } = parseFrontmatter(raw);

  const lines = body.split(/\r?\n/);
  const headingAt = lines.findIndex((l) => l.startsWith("# "));
  const title =
    headingAt >= 0 ? lines[headingAt].slice(2).trim() : "Recipe authoring guide";
  if (headingAt >= 0) lines.splice(headingAt, 1);

  return {
    title,
    html: rewriteRecipeMdLinks(marked.parse(lines.join("\n")) as string),
  };
}

/**
 * `#code=` payload for the "Try in playground" link: the recipe's Structure
 * HTML + Styling SCSS, gzip+base64url-encoded at build time. Null when the
 * recipe has no extractable starter (the page then renders no button).
 */
export function getRecipePlaygroundPayload(slug: string): string | null {
  if (!isRecipeFile(`${slug}.md`)) return null;
  const file = path.join(RECIPES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  return recipePlaygroundPayload(body);
}
