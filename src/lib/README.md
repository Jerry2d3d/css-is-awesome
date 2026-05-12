# src/lib

Shared utilities for the Next.js docs site. **Not** shipped in the npm
package — only `scss/`, `dist/`, `public/*`, `figma-tokens/`, and the
root docs files are published. Anything here is docs-site infrastructure.

## Files

| File             | Boundary    | Purpose                                                                                              | Exports                                                          | Consumed by                                                                                                                  |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `asset.ts`       | universal   | Prefix a `/path` with `NEXT_PUBLIC_BASE_PATH` so the same href works under `/css-is-awesome` on GH Pages and at `/` locally. Pure string, no React. | `asset(path)`                                                    | `app/layout.tsx`, `app/docs/install/page.tsx`, `app/themes/gallery/page.tsx`, `components/LaunchGate`                        |
| `themeState.ts`  | **client**  | One source of truth for the `data-theme` attribute on `<html>`. `setTheme()` writes the attribute + a year-long `cia-theme` cookie (read pre-hydration by the inline script in `layout.tsx` to avoid FOUC). `useThemeAttribute()` returns the current theme, MutationObserver-synced so every control re-renders when any other one changes it. | `setTheme(id)`, `useThemeAttribute()`                            | `LightDarkToggle`, `ThemePicker`, `ThemeSelect`, `ThemeTile`, `ThemeEditorDock`, `docs/tokens/TokenLive`                     |
| `theme-parse.ts` | universal\* | Pure-string CSS parser used by the theme editor's import flow. Extracts `:root { ... }` and `[data-theme="..."] { ... }` blocks into `{ name, selector, tokens, values }`. Paren-aware so `rgba(...)` survives. | `isConsolidated`, `extractDataThemeBlocks`, `extractRootBlock`, `type ParsedBlock` | `components/ThemeEditorDock/ThemeEditorDock.tsx`                                                                             |

\* `theme-parse.ts` itself has no DOM/`use client`, but its only consumer
(`ThemeEditorDock`) is a client component.

## Why `theme-parse.ts` duplicates `scripts/`

`theme-parse.ts` is intentionally a TypeScript parallel of the parser bits
in `scripts/theme-parse.js` / `scripts/theme-validator.js`. `tsconfig` has
`allowJs: false` and excludes `scripts/`, so the Node validator can't be
imported from the Next.js bundle. The parser is small enough that a TS
re-implementation is cheaper than introducing a compile/bundle hop.

**If you change either parser, change both.** Same block-shape contract,
same paren-aware value collection, same `:root` + `[data-theme="..."]`
handling.
