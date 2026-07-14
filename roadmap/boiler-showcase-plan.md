# Boiler-as-Showcase & Theme-Proof Plan

> **Status: PROPOSED — pending Jerry's feedback (2026-07-13).** Do not start building until the open decisions below are confirmed.
>
> Cross-product plan: turns the **Boiler** project into the living showcase + component library of the **css-is-awesome (cia)** family. Boiler consumes cia (one-way dependency, already wired); this plan makes Boiler *demonstrate* cia by running on a cia theme and dogfooding its own components to build every page.

## Goal

Boiler becomes the **component library site** in the cia family — a real, themeable app that proves the design system works:

- Runs on cia's **`boilerplate` theme** (one-file theme swap) so we can literally *see the theme system working*.
- Every page is built **from Boiler's own components** (dogfooding — the components build the site).
- Same **layout + design language** as cia, so the family resemblance is obvious.
- A live **theme switch** on the page shows how fast the whole site restyles.

## Design decision (recommendation)

**Same layout / structure / design language as cia — but a DISTINCT skin via the `boilerplate` theme. NOT a pixel-identical clone.**

Rationale: the point of the theme system is that the *same* structure can look *different*. A twin of cia teaches the visitor nothing about theming; a **cousin** — same nav shape, page rhythm, component vocabulary, but its own theme — *proves the theme swap works*. The bottom theme-switch demo makes it land: flip themes, watch the same site restyle instantly.

## Product framing (matches locked two-product architecture)

- **css-is-awesome** = the design system (tokens, mixins, themes, MCP). Keeps its own signature style. Gets a footer + copy.
- **Boiler** = the component library built *on* cia — "part of the css-is-awesome family." Uses the `boilerplate` theme, dogfoods its own components, gets its own footer + copy.
- One-way dependency (Boiler → cia). Separate repos, independent semver. Never fold Boiler into the cia npm package.

## Navigation (Boiler front page)

`Home · React · Angular · Blog · About` + light/dark toggle (preserve the current `ThemeToggle` behavior exactly).

- **Home** — pitches the component library; embeds the theme editor; bottom live theme-switch demo.
- **React** — the component gallery (the only framework live today). Build on the existing `/components` playground + `/showcase`.
- **Angular** — visible but **"coming soon"** (Angular components are future work).
- **Blog** — entries about components, what's updating, what's next.
- **About** — the component library's story + the cia-family positioning.

## Phased plan

**Phase 0 — Shared layout shell.** Page skeleton matching cia's structure (header / nav / main / footer grid), built from Boiler components. Nav bar + preserved light/dark toggle. Angular nav item shown as "coming soon."

**Phase 1 — Theme proof.** Boiler runs on cia's `boilerplate` theme (one-file import); light/dark via `light-dark()` preserved as-is; add the bottom **theme-switch demo** that restyles the whole site live. *This is the first thing to build — it delivers the "see the theme working" goal immediately.*

**Phase 2 — Front page + theme editor.** Home pitches the library and embeds the theme editor. Assemble from Boiler's **existing migrated** theme-editor components (`ColorInput`, `FontPicker`, `ThemeControls`, `ComponentPreview`, `ThemeEditorTopBar`) to mirror cia's `/themes` editor UX — dogfooding, not greenfield.

**Phase 3 — Nav pages.** React gallery (on the existing playground/showcase), Angular "coming soon" placeholder, Blog (component updates), About (family story).

**Phase 4 — Footers.** One for Boiler, one for cia (+ copy for each). cia keeps its own signature style.

**Phase 5 — MCP recipes.** Surface "how to build this component" recipes through the MCP server (`list_recipes` / `get_recipe` already exist; author component recipes into cia's recipe set). *Dependency now satisfied: `@modelcontextprotocol/sdk` + `zod` are installed in Boiler, so the MCP server launches from Boiler.*

## Open decisions (confirm before building)

1. **Design:** same layout, distinct `boilerplate` theme (recommended) — not identical clone.
2. **Theme editor:** assemble from Boiler's existing migrated theme-editor components (recommended) vs. port cia's docs-site version wholesale.
3. **Angular nav:** show now as "coming soon" (recommended) vs. hide until it exists.
4. **First slice:** start with **Phase 0 + 1** (shell + theme proof) so the theme is visibly working before pages are built.

## Notes / dependencies

- Boiler is a full React/Next.js app — **JavaScript is expected and correct here.** cia's "zero JS" rule applies ONLY to what the cia *npm package* ships (its runtime CSS/SCSS), not to Boiler and not to tooling like the MCP server.
- MCP server usable from Boiler as of 2026-07-13 (SDK peer dep installed).
- Execution owner: BoilerPlate (builds the components/pages); cia owns the styling convention + themes + MCP recipes.
