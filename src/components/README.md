# src/components

React components for the **Next.js docs site only**. This folder is **not shipped** in the npm package — `package.json` `files` whitelists `scss`, `dist`, `public/themes`, `public/icons`, `figma-tokens`, and the root `*.md` docs. Nothing under `src/` is published.

Long-term, this folder is the **seed for [Gremlin UI](../../ROADMAP.md#gremlin-ui-sister-npm-package)** — a future, separate React component library (name TBD: "Gremlin UI" / "Components are Awesome" / "Gremlin Components") that will depend on css-is-awesome for theming. See [`roadmap/product-architecture.md`](../../roadmap/product-architecture.md). Migration triggers when css-is-awesome hits `1.0` and the ~17 boilerplate-wanted components are stable. Until then, the boilerplate copies what it needs shadcn-style.

## File convention

Every component is a folder. The three required files:

| File                   | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `<Name>.tsx`           | Component implementation. Default-exports the component.               |
| `<Name>.module.scss`   | Scoped styles. **Only** `@use`s `scss/components/*` mixins + tokens.   |
| `index.ts`             | Barrel: `export { default } from './<Name>'; export * from './<Name>';` |

Sub-files appear when needed, no extra ceremony:

- `Example/CopyButton.tsx` — extracted client island so the parent stays server-renderable across the RSC boundary.
- `ThemeEditorDock/catalog.ts` + `rows.tsx` — split data and row renderers out of the dock shell.

If a component needs a second file, just add it next to the main one and re-export from `index.ts` when consumers need it.

## Categories at a glance

The 49 components fall into five buckets:

- **Atoms** — `Button`, `Badge`, `Tag`, `Icon`-less primitives like `Avatar`, `Label`, `Divider`, `Spinner`, `Seal`.
- **Form controls** — `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `FormField`, `SearchBar`.
- **Structural / layout** — `SiteHeader`, `DocsSidebar`, `Card`, `Modal`, `Popover`, `Tooltip`, `Dropdown`, `Accordion`, `Tabs`, `Breadcrumb`, `Pagination`, `Toast`, `Alert`, `Progress`, `Skeleton`, `List`, `MenuItem`, `TimelineItem`, `DataTable`.
- **Compound** — components with sub-slots attached as static properties, e.g. `<Example>` with `Example.Preview` and `Example.Code` (see `Example/Example.tsx`).
- **Data-driven** — `Post`, `Principle`, `StatChip` — accept structured props and render a fixed shape.
- **Docs-specific** — `ThemeEditorDock`, `ThemePicker`, `ThemeSelect`, `ThemeTile`, `LightDarkToggle`, `LaunchGate`, `Logo`, `LogoMark`, `DraftStamp`. These exist to dogfood the theme system and won't migrate to Gremlin UI as-is.

## The hard rule: tokens only

**No hardcoded values.** No `#3A5FCD`, no `1rem`, no `8px`, no media-query pixel numbers. Every color, space, radius, shadow, breakpoint, type-step comes from a token via a mixin (`m.color(primary)`, `m.space(4)`, `m.radius(md)`, `m.bp(md)`).

Why: theme portability. When these components migrate to Gremlin UI, every shipped css-is-awesome theme must reskin them for free. A single hex literal breaks that contract. Audit before commit:

```bash
grep -REn "#[0-9a-fA-F]{3,6}|[0-9]+px|[0-9.]+rem" src/components/*/*.module.scss
```

Only `currentColor`, `0`, `100%`, `1px` for hairlines, and `var(--cia-*)` references are acceptable raw values.

## Add a new component

1. `mkdir src/components/<Name>` and create `<Name>.tsx`, `<Name>.module.scss`, `index.ts`.
2. In the SCSS, `@use 'components/<area>' as m;` (or `mixins` as `m`) and route every value through a mixin. No literals.
3. Default-export the component from `<Name>.tsx`. Compound? Attach sub-components as static props (`Example.Preview = Preview`).
4. Re-export through `index.ts` (`export { default } from './<Name>'; export * from './<Name>';`).
5. Import in a docs page via `@/components/<Name>`. Verify across light + dark + at least one branded theme (e.g. `prism-dark`, `terminal-light`).
6. Run `npm run lint && npm run lint:scss && npm run validate-themes`. No new hex literals, no contract regressions.
