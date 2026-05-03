// Post-bundle: prepend `"use client";` to dist/components/<Name>/index.{mjs,js}
// for every component whose source .tsx declares the directive.
//
// esbuild (used by tsup) silently strips `"use client"` directives from
// bundled output even when present in the entry source. Next.js needs the
// directive at the top of the published module to treat it as a Client
// Component, so we restore it here. The runtime cost is zero — Next reads
// the literal "use client" string and uses it as a marker.
//
// Run from package.json scripts AFTER tsup, BEFORE tsc.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "src", "components");
const distRoot = path.join(repoRoot, "dist", "components");

const PUBLISHABLE = [
  "Accordion", "Alert", "Avatar", "Badge", "Breadcrumb", "Button", "Card",
  "Checkbox", "DataTable", "Divider", "Dropdown", "FormField", "Input",
  "Label", "List", "MenuItem", "Modal", "Pagination", "Popover", "Progress",
  "Radio", "SearchBar", "Select", "Skeleton", "Slider", "Spinner", "StatChip",
  "Switch", "Tabs", "Tag", "Textarea", "ThemePicker", "Toast", "Tooltip",
];

const DIRECTIVE_LINE = '"use client";\n';

async function tsxNeedsClient(componentDir, name) {
  const candidates = [
    path.join(componentDir, `${name}.tsx`),
    path.join(componentDir, `${name}.ts`),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const text = await readFile(file, "utf8");
    const head = text.split("\n").slice(0, 5).join("\n");
    if (/^\s*["']use client["']\s*;?/m.test(head)) return true;
  }
  return false;
}

async function prepend(file) {
  const existing = await readFile(file, "utf8");
  if (/^\s*["']use client["']/.test(existing)) return false;
  await writeFile(file, DIRECTIVE_LINE + existing, "utf8");
  return true;
}

let prepended = 0;
let skipped = 0;

for (const name of PUBLISHABLE) {
  const componentDir = path.join(srcRoot, name);
  const distDir = path.join(distRoot, name);
  if (!existsSync(distDir)) continue;
  if (!(await tsxNeedsClient(componentDir, name))) continue;

  for (const ext of ["mjs", "js"]) {
    const out = path.join(distDir, `index.${ext}`);
    if (existsSync(out)) {
      const did = await prepend(out);
      if (did) prepended++;
      else skipped++;
    }
  }
}

console.log(`[add-use-client] prepended ${prepended} file(s), skipped ${skipped}`);
