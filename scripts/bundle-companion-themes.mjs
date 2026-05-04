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

const COMPANIONS = [
  "prism-light",
  "prism-dark",
  "sketchbook-dark",
  "press-dark",
  "graphite-light",
  "glass-dark",
  "cupertino-dark",
];

const bundle = await readFile(bundlePath, "utf8");

let appended = "";
let skipped = [];
let added = [];

for (const name of COMPANIONS) {
  const selector = `[data-theme="${name}"]`;
  if (bundle.includes(selector + " {") || bundle.includes(selector + "\n{")) {
    skipped.push(name);
    continue;
  }

  const filePath = path.join(repoRoot, "public", "themes", name, "theme.css");
  const raw = await readFile(filePath, "utf8");

  // Find the [data-theme="<name>"] selector — that's where the block starts.
  const idx = raw.indexOf(selector);
  if (idx === -1) {
    console.warn(`  ! ${name}: selector not found in ${filePath}, skipping`);
    continue;
  }

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
