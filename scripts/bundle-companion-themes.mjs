// One-shot script to append every companion theme block from
// public/themes/<name>/theme.css into the consolidated public/theme.css
// bundle so a single <link href="/theme.css"> loads every theme.
//
// Run from the repo root: `node scripts/bundle-companion-themes.mjs`.
//
// What it does:
//   1. For each companion in COMPANIONS, reads its theme.css
//   2. Strips the banner comment, any `@import` lines, and the leading
//      `:root,` if present (companions use it for the "drop alone" case;
//      in the bundle we only want the [data-theme] selector since the
//      bundle's :root fallback is owned by sketchbook-light).
//   3. Appends the resulting [data-theme="<name>"] { ... } block to
//      public/theme.css under a banner separator.
//
// Idempotent: if a [data-theme="<name>"] block is already present in the
// bundle, the script skips that theme.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const bundlePath = path.join(repoRoot, "public", "theme.css");

// Each entry is either a string (folder === name) or a tuple
// [name, folder] when one folder contains multiple [data-theme]
// blocks (e.g. boilerplate ships both light + dark in one file).
const COMPANIONS = [
  "prism-light",
  "prism-dark",
  "sketchbook-dark",
  "press-dark",
  "graphite-light",
  "glass-dark",
  "cupertino-dark",
  "terminal-light",
  ["boilerplate-light", "boilerplate"],
  ["boilerplate-dark",  "boilerplate"],
];

const bundle = await readFile(bundlePath, "utf8");

let appended = "";
let skipped = [];
let added = [];

for (const entry of COMPANIONS) {
  const [name, folder] = Array.isArray(entry) ? entry : [entry, entry];
  const selector = `[data-theme="${name}"]`;
  if (bundle.includes(selector + " {") || bundle.includes(selector + "\n{")) {
    skipped.push(name);
    continue;
  }

  const filePath = path.join(repoRoot, "public", "themes", folder, "theme.css");
  const raw = await readFile(filePath, "utf8");

  // Find the [data-theme="<name>"] SELECTOR — i.e. followed by an opening
  // brace (with optional whitespace). A bare indexOf would match the same
  // text inside the file's banner comment first, then walk forward to the
  // next `{`, which is a sibling block's opening — copying the wrong CSS.
  // Anchor the search on `selector\s*{` to skip comments and prose.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped + "\\s*\\{");
  const m = re.exec(raw);
  if (!m) {
    console.warn(`  ! ${name}: selector not found in ${filePath}, skipping`);
    continue;
  }
  const idx = m.index;

  // Walk back to start of selector line (which may include `:root,\n`).
  // We only want the [data-theme] line forward — drop any leading :root.
  let blockStart = idx;

  // Find the matching closing brace.
  let depth = 0;
  let blockEnd = -1;
  for (let i = blockStart; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        blockEnd = i + 1;
        break;
      }
    }
  }
  if (blockEnd === -1) {
    console.warn(`  ! ${name}: unmatched braces, skipping`);
    continue;
  }

  const block = raw.slice(blockStart, blockEnd);
  appended += `\n/* ============================================================\n   THEME — ${name}\n   ============================================================ */\n${block}\n`;
  added.push(name);
}

if (appended.length === 0) {
  console.log("[bundle-companion-themes] nothing to append (all skipped).");
} else {
  const banner = `\n\n/* ============================================================\n   COMPANION + PRISM THEMES\n   -----------------------------------------------------------\n   Appended by scripts/bundle-companion-themes.mjs so a single\n   <link href="/theme.css"> loads every theme. Each block is\n   sourced verbatim from public/themes/<name>/theme.css.\n   ============================================================ */\n`;
  await writeFile(bundlePath, bundle + banner + appended, "utf8");
}

console.log(
  `[bundle-companion-themes] added ${added.length}: [${added.join(", ")}], skipped ${skipped.length}: [${skipped.join(", ")}]`
);
