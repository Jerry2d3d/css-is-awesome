import { defineConfig } from "tsup";

// Per-component entry map. Output structure mirrors source folder names so
// `import styles from "./Button.module.scss"` resolves correctly when the
// .scss files are copied alongside (see scripts/copy-component-scss.mjs).
const componentNames = [
  "Accordion",
  "Alert",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Button",
  "Card",
  "Checkbox",
  "DataTable",
  "Divider",
  "Dropdown",
  "FormField",
  "Input",
  "Label",
  "List",
  "MenuItem",
  "Modal",
  "Pagination",
  "Popover",
  "Progress",
  "Radio",
  "SearchBar",
  "Select",
  "Skeleton",
  "Slider",
  "Spinner",
  "StatChip",
  "Switch",
  "Tabs",
  "Tag",
  "Textarea",
  "ThemePicker",
  "Toast",
  "Tooltip",
];

const componentEntries = Object.fromEntries(
  componentNames.map((name) => [
    `components/${name}/index`,
    `src/components/${name}/index.ts`,
  ])
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "theme-init": "src/theme-init.ts",
    ...componentEntries,
  },
  outDir: "dist",
  format: ["esm", "cjs"],
  // dts is generated separately via `tsc -p tsconfig.lib.json` because tsup's
  // dts pipeline strips "use client" directives from the emitted .mjs files
  // after esbuild produces them. Running dts separately keeps the directives
  // intact in the runtime output and emits .d.ts files that mirror the source
  // tree under dist/, which the package.json `exports` map resolves directly.
  dts: false,
  tsconfig: "tsconfig.lib.json",
  clean: false,
  // splitting: false (default for cjs; we keep it off for esm too) keeps each
  // entry self-contained so the "use client" directive injected via `banner`
  // stays at the top of every component's index.mjs/index.js — splitting moves
  // code into shared chunks where the directive gets stripped.
  splitting: false,
  treeshake: true,
  sourcemap: false,
  // React + ReactDOM are peer deps; never bundle them.
  // SCSS module imports are resolved by the consumer's bundler — leave imports alone.
  // next/* (e.g. next/image used by Avatar) is a peer of any consuming Next app —
  // bundling it pulls in @swc/helpers and other CJS interop blobs (~110KB+).
  external: ["react", "react-dom", "next", /^next\//, /\.scss$/],
  // "use client" directives are added per-entry by adding the directive to
  // each component's index.ts (see scripts/sync-use-client.mjs which runs
  // pre-build). esbuild preserves source-level directive prologues across
  // bundling. We don't use tsup's `banner` option because it is silently
  // dropped by tsup's dts pipeline when set to a directive string.
});
