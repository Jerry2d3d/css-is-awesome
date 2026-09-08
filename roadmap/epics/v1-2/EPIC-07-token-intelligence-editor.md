# EPIC v1.2-07 — Token intelligence in the theme editor

> Added 2026-09-07 from the external review. The novel idea the reviewer
> singled out: the editor should show **where a token propagates** ("Primary →
> used by buttons, active tabs, links, focus ring") and warn on **contrast**
> while you edit — turning a color picker into a design-system assistant.

**Status:** Planned (v1.2)
**Effort estimate:** ~3-5 working days
**Stories:** 5

## Mission

Two pieces of live intelligence in the existing `ThemeEditorDock`
(`src/components/ThemeEditorDock/`, ~1,040 LOC, already ships grouped tokens,
live preview, `theme.css` download, share links):

1. **Token relationship map** — editing a token shows the components that read
   it; clicking a consumer highlights it in the preview.
2. **Live WCAG contrast** — while you edit an ink/surface pair, the dock shows
   the ratio and warns below AA, with a nearer-passing suggestion.

## Why now

We already own the two things that make this cheap and unique: the **token
contract** (`scripts/theme-contract.json`) and the **contrast math**
(`scripts/theme-a11y.js`, already in `files`). Most theme editors can't show
propagation because they edit arbitrary CSS; we edit a validated system, so
the map is derivable. This is the feature that turns the editor from "nice"
into a reason to pick cia.

## Out of scope

- Turning the dock into a general CSS editor. The raw-CSS/advanced view stays
  secondary; this epic is about *understanding the system*, not freeform edits.
- AI-generated token changes — that's [v1.3 EPIC-05](../v1-3/EPIC-05-ai-token-diff.md)
  and depends on this map existing first.

## Features

### F1 — The relationship map (data)

- **US-V12.07.1.1** (M) — Build-time script scans `scss/components/*.scss`,
  `scss/_mixins.scss`, `scss/_layout.scss` for `var(--token)` references and
  emits a `token → consumers` JSON (which mixins/components read each token).
  Acceptance: `--primary` lists button/tabs/link/focus-ring consumers; the
  map is regenerated in the build, not hand-maintained.
- **US-V12.07.1.2** (S) — CI guard: the map is derived, so a token with **zero**
  consumers is either dead or a naming bug — surface it (ties into the
  analyzer's `off-contract-token` thinking).

### F2 — The relationship map (UI)

- **US-V12.07.2.1** (M) — Each editor row gains a "used by" disclosure reading
  from the map. Acceptance: editing Primary shows its consumer list; the list
  is keyboard-reachable and doesn't shift layout when opened.
- **US-V12.07.2.2** (M, OPTIONAL) — Click a consumer → highlight that component
  in the live preview. Harder (needs preview-node addressing); ship the list
  first, the highlight as a follow-on.

### F3 — Live contrast

- **US-V12.07.3.1** (M) — Reuse `theme-a11y.js`'s ratio computation client-side
  for the key ink-on-surface pairs; show the live ratio on color rows and a
  warning below AA (with the exact "needs 4.5:1" copy and a nearest-passing
  suggestion). Acceptance: dropping `--ink` toward `--surface` trips the
  warning at the WCAG boundary; the suggestion, applied, passes.

## What changes

- New build script + a generated data file consumed by the dock.
- `ThemeEditorDock` rows gain a "used by" affordance and (color rows) a live
  contrast readout; `theme-a11y.js` contrast logic is factored so both Node
  (CI) and the browser (dock) call the same math.

## What we may lose

- **Map precision.** The `var(--token)` scan is static; tokens reached
  indirectly (through a function, `calc()`, or a token that feeds another
  token) may be under- or over-counted. Mitigation: state the map is
  "direct consumers," and let the zero-consumer CI guard catch the misses.
- **A little bundle weight in the editor** (the map JSON + contrast helper).
  It's docs-site JS, not package JS — the npm package stays zero-JS
  ([[feedback_no_js_in_package]]) — but keep the map lean (ids, not prose).

## Risks

- Factoring `theme-a11y.js` for dual Node/browser use without dragging Node
  built-ins into the client bundle; keep the pure math in a shared, import-safe
  module.
- The preview-highlight (F2 optional) is the story most likely to slip; it's
  explicitly optional so the epic ships without it.

## Definition of done

Editing a token shows its direct consumers from a build-derived map; color
rows show a live WCAG ratio and warn below AA with a passing suggestion; the
contrast math is shared with CI; the npm package remains zero-JS.

## Related

- `src/components/ThemeEditorDock/` (catalog/rows/dock), `scripts/theme-a11y.js`,
  `scripts/theme-contract.json`.
- Prerequisite for [v1.3 EPIC-05 — AI-assisted token diff](../v1-3/EPIC-05-ai-token-diff.md).
- Sibling of [v1.2 EPIC-06 — analyzer health report](./EPIC-06-analyzer-health-report.md)
  (same contract, editor side vs CI side).
