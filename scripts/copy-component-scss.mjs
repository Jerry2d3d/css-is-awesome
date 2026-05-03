// Copy each shipped component's *.module.scss into dist/components/<Name>/
// preserving the file name. tsup leaves SCSS imports alone (external regex
// in tsup.config.ts), so the runtime import `./Foo.module.scss` resolves
// from the consumer's bundler against these copied files.
//
// Run after `npx tsup` as part of build:components.

import { readdir, mkdir, copyFile } from "node:fs/promises";
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

let copied = 0;
let skipped = 0;

for (const name of PUBLISHABLE) {
  const srcDir = path.join(srcRoot, name);
  const distDir = path.join(distRoot, name);

  if (!existsSync(srcDir)) {
    console.warn(`[copy-component-scss] missing source dir: ${srcDir}`);
    skipped++;
    continue;
  }
  if (!existsSync(distDir)) {
    console.warn(`[copy-component-scss] missing dist dir (build first?): ${distDir}`);
    skipped++;
    continue;
  }

  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".module.scss")) {
      await mkdir(distDir, { recursive: true });
      await copyFile(
        path.join(srcDir, entry.name),
        path.join(distDir, entry.name)
      );
      copied++;
    }
  }
}

console.log(`[copy-component-scss] copied ${copied} file(s), skipped ${skipped}`);
