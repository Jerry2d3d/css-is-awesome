import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prose apostrophes / quotes in JSX text are valid and readable.
      // The escape rule creates noise without catching real bugs.
      "react/no-unescaped-entities": "off",
      // The theme-swap mechanism (replacing <link href="theme.css"> at runtime)
      // requires a manual stylesheet <link> in layout.tsx. Intentional, not a bug.
      "@next/next/no-css-tags": "off",
    },
  },
  {
    ignores: ["scss/**", "dist/**", "out/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
