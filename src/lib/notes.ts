// Working notes — the short, dated half of the devlog.
//
// Server-only by construction, same as src/lib/blog.ts: importing `node:fs`
// makes this impossible to bundle into a client component.
//
// WHY THIS IS NOT A FOURTH BLOG TRACK
// -----------------------------------
// Blog posts are narrative and meant to last; notes are dated and disposable.
// Folding notes into the blog index would make that index harder to scan and,
// worse, would put quiet pressure on every note to justify itself as a post —
// which is exactly the pressure that stops short notes from being written at
// all. Separate surface, deliberately lower stakes.
//
// It DOES reuse the blog's markdown machinery rather than introducing a second
// renderer, so code blocks, task lists and accessibility fixes stay identical
// across all three markdown surfaces (recipes, blog, notes).
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

const NOTES_DIR = path.join(process.cwd(), "src", "content", "notes");

/** `_`-prefixed files are drafts/templates, not notes. */
function isNoteFile(file: string): boolean {
  return file.endsWith(".md") && !file.startsWith("_") && file !== "README.md";
}

export type NoteMeta = {
  slug: string;
  title: string;
  /** YYYY-MM-DD. */
  date: string | null;
  tags: string[];
  /** First line of the body, for the index. */
  lede: string;
  wordCount: number;
};

export type Note = NoteMeta & { html: string };

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

/**
 * First prose line of the note, stripped of markdown, for the index listing.
 * Headings, code fences and list markers are skipped so the preview is a
 * sentence rather than a fragment of syntax.
 */
function ledeOf(body: string): string {
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("```") || line.startsWith("-")) {
      continue;
    }
    return line
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
  }
  return "";
}

const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escAttr = (s: string) => esc(s).replace(/"/g, "&quot;");
      const langClass = lang ? ` class="language-${escAttr(lang)}"` : "";
      const langLabel = lang
        ? `<span class="recipe-codeblock-lang" aria-hidden="true">${esc(lang)}</span>`
        : "";
      // tabindex + role/label: <pre> scrolls horizontally, so a keyboard-only
      // user needs a focusable, named region to pan it (axe
      // `scrollable-region-focusable`). Same shape as recipes.ts and blog.ts.
      return `<div class="recipe-codeblock" data-lang="${escAttr(lang ?? "")}">${langLabel}<pre tabindex="0" role="region" aria-label="Code sample"><code${langClass}>${esc(text)}\n</code></pre></div>`;
    },
    checkbox({ checked }) {
      return `<input ${checked ? "checked " : ""}disabled aria-hidden="true" type="checkbox">`;
    },
  },
});

/** Slugs for every renderable note — drives `generateStaticParams`. */
export function getNoteSlugs(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter(isNoteFile)
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/** Frontmatter-only listing, newest first. Undated notes sort last. */
export function getNoteIndex(): NoteMeta[] {
  return getNoteSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(NOTES_DIR, `${slug}.md`), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        slug,
        title: data.title || slug,
        date: data.date || null,
        tags: toList(data.tags),
        lede: ledeOf(body),
        wordCount: body.trim().split(/\s+/).filter(Boolean).length,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

/** Full note for a single page. */
export function getNote(slug: string): Note | null {
  if (!isNoteFile(`${slug}.md`)) return null;
  const file = path.join(NOTES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    title: data.title || slug,
    date: data.date || null,
    tags: toList(data.tags),
    lede: ledeOf(body),
    wordCount: body.trim().split(/\s+/).filter(Boolean).length,
    html: marked.parse(body) as string,
  };
}

/** Notes grouped by `YYYY-MM`, newest month first — the index's shape. */
export function getNotesByMonth(): { month: string; notes: NoteMeta[] }[] {
  const groups = new Map<string, NoteMeta[]>();
  for (const note of getNoteIndex()) {
    const month = (note.date ?? "undated").slice(0, 7);
    const bucket = groups.get(month);
    if (bucket) bucket.push(note);
    else groups.set(month, [note]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, notes]) => ({ month, notes }));
}

/** "2026-09" → "September 2026". Undated notes keep their label. */
export function monthLabel(month: string): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return "Undated";
  const [year, mm] = month.split("-");
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${names[Number(mm) - 1]} ${year}`;
}
