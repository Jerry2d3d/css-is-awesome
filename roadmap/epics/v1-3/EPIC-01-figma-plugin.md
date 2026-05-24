# EPIC v1.3-01 — Figma Plugin

**Status:** Planned (v1.3)
**Effort estimate:** ~2 weeks
**Stories:** 12

## Mission

Ship a Figma plugin that syncs tokens between Figma variables and cia tokens, in both directions. Built on the existing `scripts/dtcg-to-scss.mjs` bridge. Publish to Figma Community so designers can install with one click.

## Why now

cia treats themes as data (DTCG-compatible). The Figma Variables API (GA since 2023) speaks DTCG. The bridge is 70% built — just needs the Figma plugin wrapper. Designers shipping to cia-using teams need this; it's the single highest-leverage designer-adoption move.

## Out of scope

- Component library sync (Figma component → React component) — out of scope; cia doesn't maintain a component library
- Variable mode mapping (Figma's modes vs cia's light-dark()) — v0.1 supports light + dark only
- Cross-file variable references in Figma — basic support only in v0.1
- Sketch / Adobe XD plugins (different ecosystem)

## Features

### F1.1 — Plugin scaffolding

#### US-V13.01.1.1 — Stand up Figma plugin repo

**Acceptance criteria:**
- [ ] Repo `cia-figma-plugin` (or `packages/figma-plugin/` in monorepo per v1.1 EPIC-03 decision)
- [ ] Uses official Figma plugin template + TypeScript
- [ ] Plugin manifest defines: name, id, permissions (variables, currentpage)
- [ ] Dev workflow: `npm run dev` runs Figma plugin in watch mode

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-V13.01.1.2 — Plugin UI shell

**Acceptance criteria:**
- [ ] Plugin opens in a 300×400 panel
- [ ] Two tabs: "Import from cia" and "Export to cia"
- [ ] Uses Figma's plugin UI design system primitives
- [ ] Loading + error states defined

**Effort:** M (4-8 hrs)
**Depends on:** US-V13.01.1.1

---

### F1.2 — Import from cia (cia tokens → Figma variables)

#### US-V13.01.2.1 — Fetch cia theme from npm or URL

**As** a designer in Figma
**I want** to paste a cia theme URL (or pick from the 9 shipped themes) and pull all 123 tokens into Figma variables
**So that** my designs use the same colors/spacing/type the dev team's code uses

**Acceptance criteria:**
- [ ] UI offers: pick from 9 shipped themes (fetches from cia jsDelivr), OR paste theme.css URL, OR upload theme.css
- [ ] Parses theme using the existing `theme-parse.ts` logic (ported to browser-safe)
- [ ] Lists tokens to import; user can deselect any
- [ ] "Import" button creates Figma variables grouped by category (Color, Spacing, Type, Radius, etc.)

**Effort:** L (1-2 days)
**Depends on:** US-V13.01.1.2

#### US-V13.01.2.2 — Map cia tokens to Figma variable types

**Acceptance criteria:**
- [ ] Color tokens → Figma COLOR variables (with light + dark modes)
- [ ] Spacing/radius tokens → Figma FLOAT variables
- [ ] Font tokens → Figma STRING variables
- [ ] Variables named after their cia token name (no prefix stripping — keep cia naming)
- [ ] Existing variables with same name updated (not duplicated)

**Effort:** M (4-8 hrs)

#### US-V13.01.2.3 — Handle light/dark mode

**Acceptance criteria:**
- [ ] cia `light-dark()` values split into Figma's light + dark mode slots
- [ ] Figma collection "cia tokens" gets two modes: Light, Dark
- [ ] User can choose to import only one mode if needed

**Effort:** M (4-8 hrs)

---

### F1.3 — Export to cia (Figma variables → cia theme)

#### US-V13.01.3.1 — Read current file's variables

**As** a designer who customized a cia theme in Figma
**I want** to push my changes back to a downloadable theme.css
**So that** the dev team can drop it into their app

**Acceptance criteria:**
- [ ] Plugin reads all variables in current file
- [ ] Detects which collection is "cia tokens" (by name or by user pick)
- [ ] Lists changed/added tokens; user can deselect any
- [ ] "Generate theme.css" button produces a downloadable file

**Effort:** L (1-2 days)

#### US-V13.01.3.2 — Generate valid cia theme.css

**Acceptance criteria:**
- [ ] Output matches `public/themes/<name>/theme.css` shape
- [ ] Both light + dark modes inside via `light-dark()`
- [ ] Includes the cia 123-token contract; warns about missing tokens before download
- [ ] User picks theme name; sanitized per same rules as the theme editor

**Effort:** M (4-8 hrs)

#### US-V13.01.3.3 — Validate output before download

**Acceptance criteria:**
- [ ] Runs the in-browser contrast validator (ported from v1.0 EPIC-02 US-02.3.1)
- [ ] Shows FAIL badges before download
- [ ] User can choose "download anyway" with explicit warning

**Effort:** M (4-8 hrs)
**Depends on:** v1.0 US-02.3.1 (browser validator)

---

### F1.4 — Publish to Figma Community

#### US-V13.01.4.1 — Polish + publish

**Acceptance criteria:**
- [ ] Plugin icon + cover image
- [ ] Description, screenshots, install instructions
- [ ] First publish goes through Figma's review (~3-7 days)
- [ ] Published listing linked from cia website + README

**Effort:** M (4-8 hrs)

#### US-V13.01.4.2 — Docs page on cia site

**Acceptance criteria:**
- [ ] Page at `src/app/docs/figma-plugin/page.tsx`
- [ ] Walkthrough with screenshots: install, import a theme, edit, export
- [ ] FAQ covers common issues (variable mode mismatch, missing tokens, etc.)

**Effort:** M (4-8 hrs)

#### US-V13.01.4.3 — Telemetry (opt-in, anonymous)

**Acceptance criteria:**
- [ ] Plugin asks on first run: "Help improve cia by sharing anonymous usage stats?"
- [ ] If yes: log install count + import/export counts (no theme content sent)
- [ ] If no: nothing sent
- [ ] Privacy policy linked

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 12 stories accepted
- [ ] Plugin published to Figma Community
- [ ] Both import + export workflows verified end-to-end with the boilerplate theme
- [ ] Docs page lives + linked
- [ ] At least 1 external designer (community tester) verified usability
- [ ] Linked from cia website nav as a top-level "Figma" item

## Risks

- **Figma plugin review delays.** Initial publish is ~5 days in queue. Mitigation: submit early in the v1.3 cycle.
- **Figma variables API changes.** Figma occasionally tweaks the API. Mitigation: pin plugin manifest version; CI test against latest Figma API.
- **DTCG drift.** DTCG spec is still maturing (v2025.10 at lock time). Mitigation: align plugin's DTCG layer with whatever cia core uses; bump together.
- **Mode coverage.** Figma supports unlimited modes; cia ships exactly 2 (light + dark). Beyond v0.1, consumers may want N-mode support. Mitigation: v0.1 docs explain the 2-mode constraint; v1.4 can extend.

## Related

- [v1.0 EPIC-03-migration-on-ramp.md](../v1-0/EPIC-03-migration-on-ramp.md) — same migrate pattern, different surface
- [v1.0 EPIC-02-theme-editor-polish.md](../v1-0/EPIC-02-theme-editor-polish.md) — in-browser validator that the plugin reuses
- [v1.3 EPIC-03-dtcg-migration.md](./EPIC-03-dtcg-migration.md) — DTCG bridge this plugin is built on
