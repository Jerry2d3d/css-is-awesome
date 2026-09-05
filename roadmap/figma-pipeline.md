# Figma pipeline — Figma → DEV → Output

> Added to the roadmap 2026-09-05 (Jerry's call). The goal: the design
> tool, the codebase, and the shipped output share ONE token vocabulary,
> legible to designers, developers, and AI agents alike. Plan only —
> nothing here is built yet except the foundations noted as shipped.

## What exists today (the foundations)

- `figma-tokens/tokens.json` ships in the npm package.
- `scripts/dtcg-to-scss.mjs` converts DTCG token JSON to SCSS.
- The theme contract (127 required + 36 optional tokens) with a validator
  that gates CI — the round-trip's safety net.
- The in-browser theme editor already emits contract-conformant
  `theme.css` downloads.
- The `cia` CLI with a subcommand router (`migrate`, `add`, `analyze`) —
  the natural home for the new verbs.
- DTCG migration is scheduled as v1.3 EPIC-03; a Figma plugin as v1.3
  EPIC-01. This plan supersedes/absorbs both.

## Hard constraint to design around

Figma's Variables **REST** API is Enterprise-plan-only. The bridge
therefore runs through a **Figma plugin** (plugins can read/write
variables on every plan) plus file-based import/export — not through the
REST API. This is why F2 (the plugin) is load-bearing, not cosmetic.

## Phase F1 — the token bridge (files first, no plugin needed)

- **`cia figma export`**: generate a Figma-Variables-compatible JSON from
  the theme sources. The mapping that makes this powerful: **each cia
  theme becomes a Figma variable MODE** — the designer flips
  Sketchbook/Terminal/Glass inside Figma exactly the way the site flips
  `data-theme`. Light/dark ride the same mode mechanism as the paired
  themes.
- **`cia theme from-figma <tokens.json>`**: the reverse — map exported
  Figma variables onto the 127-token contract using the migrate-tool's
  confidence model (HIGH / MEDIUM / UNMAPPED, exactly like
  `cia migrate tailwind`), emit `theme.scss`, and run the theme validator
  on the result so a bad export can't become a bad theme.

## Phase F2 — the cia Figma plugin + published Library

- A small plugin: "Sync with css-is-awesome" — import/export variables to
  the cia token JSON without leaving Figma.
- A **published Figma community Library**: color/text/effect styles bound
  to the variables, plus components for the six interactives and the
  recipe patterns (dialog, combobox, mobile-nav's drawer, bottom-nav's
  dock, the dashboard shell). **Naming is the contract**: every Figma
  component carries the name of its mixin/recipe (`btn/primary` ↔
  `cia.btn(primary)`, `recipe/bottom-nav` ↔ the recipe slug), so the
  mapping is legible without a lookup table.

## Phase F3 — the loop (Figma → DEV → Output)

Designer edits variables in Figma → export → `cia theme from-figma` →
validator gates → theme lands → every consumer re-skins. Reverse:
theme-editor download → `cia figma export` → designer's file updates.
Documented as `/docs/figma` with the full round trip. The contract's
token NAMES are the interchange format; neither side ever hand-translates
"Spacing/Medium = 16" into "--space-4" again.

## Phase F4 — the AI layer

Ship a machine-readable mapping file in the package
(`figma-tokens/mapping.json`): Figma component name ↔ mixin ↔ recipe ↔
doc URL. Serve it over MCP (`get_figma_mapping`). Then an agent handed a
Figma frame can translate node names directly into cia mixin calls and
recipe patterns — the same shared vocabulary humans use. This is the
"easier for AI" piece: one namespace across design, code, docs, and MCP.

## Order and gates

F1 first (pure code, testable today, no Figma account dependencies in
CI), F2 second (plugin unblocks non-Enterprise round-trips), F3 is
documentation + glue once F1/F2 exist, F4 rides the MCP server's
file-backed pattern and can start as soon as F2's naming contract is
fixed. Each phase gates on the theme validator — no phase may produce a
theme the contract rejects.
