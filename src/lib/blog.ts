// Server-only by construction: importing `node:fs` makes this module
// impossible to bundle into a client component, so no `server-only` guard dep
// is needed. Imported only by the blog Server Components.
//
// Deliberately mirrors `src/lib/recipes.ts` — same flat-frontmatter parser,
// same Marked setup, same build-time-only posture. Two markdown surfaces with
// one shape is easier to keep honest than two half-different ones, and it means
// the blog adds ZERO new dependencies (`marked` was already here).
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

// Posts live outside `scss/` because — unlike recipes — they are docs-site
// content only. They must never reach the npm package's `files` manifest.
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

// `_`-prefixed files are drafts/templates, not posts.
function isPostFile(file: string): boolean {
  return file.endsWith(".md") && !file.startsWith("_") && file !== "README.md";
}

export type PostFrontmatter = {
  title: string;
  category: string | null;
  tags: string[];
  audience: string[];
  excerpt: string;
  author: string;
  publishDate: string | null;
  updatedDate: string | null;
  readingTime: string | null;
};

export type PostMeta = PostFrontmatter & { slug: string };
export type Post = PostMeta & { html: string };

// Same flat `key: value` reader the recipes use. The post schema is flat, so a
// full YAML parser would be overkill; list-valued fields are comma-separated.
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
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

function toList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toFrontmatter(data: Record<string, string>, slug: string): PostFrontmatter {
  return {
    title: data.title || slug,
    category: data.category || null,
    tags: toList(data.tags),
    audience: toList(data.audience),
    excerpt: data.excerpt || "",
    author: data.author || "Jerry Hansen",
    publishDate: data.publishDate || null,
    updatedDate: data.updatedDate || null,
    readingTime: data.readingTime || null,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

// Reuses the recipe codeblock shell so posts and recipes share one code style
// (and one set of globals.css rules) instead of drifting apart.
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

/** Slugs for every renderable post — drives `generateStaticParams`. */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter(isPostFile)
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/**
 * Frontmatter-only listing for the blog index, newest first.
 * Posts without a publishDate sort last rather than crashing the sort.
 */
export function getPostIndex(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8");
      const { data } = parseFrontmatter(raw);
      return { slug, ...toFrontmatter(data, slug) };
    })
    .sort((a, b) => (b.publishDate || "").localeCompare(a.publishDate || ""));
}

/** Full post (frontmatter + rendered HTML) for a single page. */
export function getPost(slug: string): Post | null {
  if (!isPostFile(`${slug}.md`)) return null;
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const html = marked.parse(body) as string;
  return { slug, ...toFrontmatter(data, slug), html };
}

/** Every distinct category across posts, for the index filter chips. */
export function getCategories(): string[] {
  return [...new Set(getPostIndex().map((p) => p.category).filter(Boolean) as string[])].sort();
}
