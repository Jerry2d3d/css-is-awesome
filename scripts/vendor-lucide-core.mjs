// Vendor Lucide as the default `core` icon pack.
//
// Usage:
//   npm install --no-save lucide-static
//   node scripts/vendor-lucide-core.mjs
//
// Reads scripts/icon-contract.json (the canonical glyph list per pack),
// resolves each contract glyph to its Lucide source name (some glyphs
// don't map 1:1 — e.g. `close` → `x`, `warning` → `triangle-alert`),
// then copies/normalizes the SVG into public/icons/core/<name>.svg.
//
// Normalization removes Lucide-specific bits the css-is-awesome SVG
// pipeline doesn't need:
//   - the `<!-- @license -->` comment (attribution lives in
//     LICENSE-third-party at the repo root)
//   - the `class="lucide lucide-foo"` attribute (we tint via CSS mask,
//     not class hooks)
//   - leading width/height attributes on <svg> (the mixin sizes the
//     host element; the SVG just needs viewBox)
//
// Idempotent: re-running overwrites with the same canonical content.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const lucideIconsDir = path.join(
  repoRoot,
  "node_modules",
  "lucide-static",
  "icons"
);
const corePackDir = path.join(repoRoot, "public", "icons", "core");

// Contract (canonical) name -> Lucide source name. Where a contract name
// is identical to a Lucide name we still list it so the script is the
// single source of truth.
const LUCIDE_MAP = {
  // Already shipped (8)
  "arrow-right": "arrow-right",
  check: "check",
  "chevron-down": "chevron-down",
  close: "x",
  download: "download",
  edit: "pencil",
  menu: "menu",
  search: "search",

  // Navigation (8)
  "arrow-left": "arrow-left",
  "arrow-up": "arrow-up",
  "arrow-down": "arrow-down",
  "chevron-up": "chevron-up",
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  "external-link": "external-link",
  home: "house",

  // Actions (12)
  upload: "upload",
  copy: "copy",
  share: "share",
  trash: "trash-2",
  save: "save",
  refresh: "refresh-cw",
  settings: "settings",
  filter: "filter",
  sort: "arrow-up-down",
  plus: "plus",
  minus: "minus",
  "more-horizontal": "ellipsis",

  // Status (6)
  info: "info",
  warning: "triangle-alert",
  error: "circle-x",
  success: "circle-check",
  help: "circle-help",
  loading: "loader-circle",

  // Communication (5)
  mail: "mail",
  bell: "bell",
  calendar: "calendar",
  clock: "clock",
  message: "message-circle",

  // User / security (6)
  user: "user",
  users: "users",
  lock: "lock",
  unlock: "lock-open",
  eye: "eye",
  "eye-off": "eye-off",

  // Media (4)
  play: "play",
  pause: "pause",
  star: "star",
  heart: "heart",
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function normalize(svgText) {
  let s = svgText;
  // Drop the leading <!-- @license ... --> comment.
  s = s.replace(/<!--[\s\S]*?-->\s*/g, "");
  // Drop class="lucide lucide-foo" — we don't tint via CSS class hooks.
  s = s.replace(/\s+class="lucide[^"]*"/g, "");
  // Drop width / height attrs on <svg> — the mixin sizes the host element.
  s = s.replace(
    /(<svg\b[^>]*?)\s+width="\d+"/,
    (_, head) => head
  );
  s = s.replace(
    /(<svg\b[^>]*?)\s+height="\d+"/,
    (_, head) => head
  );
  // Collapse whitespace-only blank lines that the comment removal leaves.
  s = s.replace(/^\s*\n/, "");
  // Ensure single trailing newline.
  s = s.trimEnd() + "\n";
  // Re-add the standard XML declaration so files match the existing
  // hand-shipped ones (arrow-right.svg, check.svg, etc.).
  if (!s.startsWith("<?xml")) {
    s = `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;
  }
  return s;
}

async function main() {
  if (!(await exists(lucideIconsDir))) {
    console.error(
      "error: lucide-static is not installed. Run:\n  npm install --no-save lucide-static"
    );
    process.exit(2);
  }
  await mkdir(corePackDir, { recursive: true });

  const entries = Object.entries(LUCIDE_MAP);
  let written = 0;
  const missing = [];

  for (const [canonical, lucideName] of entries) {
    const src = path.join(lucideIconsDir, `${lucideName}.svg`);
    if (!(await exists(src))) {
      missing.push({ canonical, lucideName });
      continue;
    }
    const raw = await readFile(src, "utf8");
    const out = normalize(raw);
    await writeFile(path.join(corePackDir, `${canonical}.svg`), out, "utf8");
    written++;
  }

  if (missing.length > 0) {
    console.error(
      `error: ${missing.length} contract glyphs could not be resolved in lucide-static:`
    );
    for (const m of missing) {
      console.error(`  ${m.canonical} -> lucide '${m.lucideName}' (NOT FOUND)`);
    }
    process.exit(1);
  }

  console.log(
    `vendor-lucide-core: wrote ${written} glyph(s) to ${path.relative(
      repoRoot,
      corePackDir
    )}/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
