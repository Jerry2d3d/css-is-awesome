// eslint-config-next 16 ships native flat config; the FlatCompat shim that
// carried the eslintrc-style "next/core-web-vitals" extends no longer parses
// against it (and `next lint` itself was removed in Next 16 — the lint script
// now calls the ESLint CLI directly).
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Prose apostrophes / quotes in JSX text are valid and readable.
      // The escape rule creates noise without catching real bugs.
      "react/no-unescaped-entities": "off",
      // The theme-swap mechanism (replacing <link href="theme.css"> at runtime)
      // requires a manual stylesheet <link> in layout.tsx. Intentional, not a bug.
      "@next/next/no-css-tags": "off",
      // react-hooks v6 (via eslint-config-next 16) introduced these. They flag
      // long-standing patterns in ThemeEditorDock/Dropdown/Popover that predate
      // the rules and behave correctly. Warn, don't fail: adopt per-component
      // when those files are next touched, not in a toolchain bump.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // scss/dist/out are build IO. bin/, mcp/, scripts/ are Node tooling
    // (CommonJS .cjs by design — the package ships them as CLIs); `next lint`
    // never covered them and the ESLint CLI shouldn't either.
    ignores: [
      "scss/**",
      "dist/**",
      "out/**",
      ".next/**",
      "node_modules/**",
      "bin/**",
      "mcp/**",
      "scripts/**",
    ],
  },
];

export default eslintConfig;
