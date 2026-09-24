# EPIC v1.2-07 — Token intelligence in the theme editor

> Added 2026-09-07 from the external review. The novel idea the reviewer
> singled out: the editor should show **where a token propagates** ("Primary →
> used by buttons, active tabs, links, focus ring") and warn on **contrast**
> while you edit — turning a color picker into a design-system assistant.

**Status:** Complete (2026-09-09), except F2.2 which is explicitly deferred
per its own "ship the list first, the highlight as a follow-on" call.
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

- **US-V12.07.1.1** (M) — ✅ DONE 2026-09-09. New
  `scripts/build-token-consumer-map.mjs` scans `scss/components/*.scss`,
  `scss/_mixins.scss`, `scss/_layout.scss` and emits
  `src/lib/generated/token-consumers.json` (committed, like `public/theme.css`
  — regenerated via `npm run build:token-consumers`, chained into
  `build:css:all`). Turned out most component code doesn't write literal
  `var(--token)` at all — it calls a wrapper function (`m.color(ink)` →
  `var(--ink, …)`, `m.radius(lg)` → `var(--radius-lg, …)`). The script derives
  a function→token-prefix table by reading `_mixins.scss`'s own `@function`
  bodies (generic, self-updating), then resolves both patterns. A call with a
  dynamic argument (`m.color($bg)`, `#{$status}-subtle`) is skipped, not
  guessed — same stance `bin/analyze.cjs` already takes.
- **US-V12.07.1.2** (S) — ✅ DONE 2026-09-09, **descoped from the original
  ask**. New `scripts/check-token-consumer-map.mjs` runs in CI: it hard-fails
  on drift (committed map vs. freshly regenerated — same class of bug just
  fixed in `build-theme-bundle.mjs` this session) and prints a zero-consumer
  report, but **the zero-consumer report never fails the build**, not even
  behind a flag. Measured on cia's own source: 85 of ~123 required contract
  tokens — including `--ink`, `--paper`, `--ai`, `--code-bg` — show zero
  consumers, because the mixins that read them do so through their own
  parameter (`focus-ring($color: border-focus) { color($color) }`), which the
  static scanner correctly declines to guess through. A pass/fail gate at that
  false-positive rate would be permanently red on objectively fine tokens —
  worse than no gate. The original "surface it" framing survives as an
  informational list for a human to skim, not a check.

### F2 — The relationship map (UI)

- **US-V12.07.2.1** (M) — ✅ DONE 2026-09-09. `RowLabel` (shared by every row
  type in `ThemeEditorDock/rows.tsx`) gains a "used by N ▸" disclosure reading
  the generated map. Verified live: `--text-primary` shows "used by 10 ▸",
  expands to the consumer list, `aria-expanded` on a real `<button>`. Appended
  below the row content rather than inside its 2-column grid, so it doesn't
  disturb existing layout.
- **US-V12.07.2.2** (M, OPTIONAL) — Not built. Click a consumer → highlight
  that component in the live preview. Deferred per the epic's own call —
  ship the list first, the highlight as a follow-on.

### F3 — Live contrast

- **US-V12.07.3.1** (M) — ✅ DONE 2026-09-09. Color rows show a live ratio
  against the relevant `AUDIT_PAIRS` partner, with a `needs 4.5:1` warning and
  a one-click "use #hex" nearest-passing suggestion when failing. `AUDIT_PAIRS`
  is now a genuinely shared file (`scripts/audit-pairs.json`, imported by both
  `scripts/theme-a11y.js` for CI and `src/lib/contrast.ts` for the browser).
  The relative-luminance/contrast-ratio **math** is a deliberate TS port, not
  a live import — `tsconfig.json` sets `allowJs: false`, so importing a CJS
  `.js` module into `.ts` needs a fragile ambient `declare module` shim; the
  math is WCAG's fixed spec, not something that drifts, so porting it once
  and verifying it byte-matches `theme-a11y.js` on the same test cases (done)
  was the lower-risk call than adding that shim. Verified live: setting
  `--text-primary` to Paper's own colour shows `1.00:1 — needs 4.5:1 — use
  #716f6b`; clicking it sets the value and the readout flips to `4.53:1 —
  passes 4.5:1`.

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
contrast **pairs** are shared with CI (the math is a verified TS port, see F3
above — `allowJs: false` made a live cross-runtime import impractical); the
npm package remains zero-JS. **Met 2026-09-09**, F2.2 excluded per its own
deferral.

## Related

- `src/components/ThemeEditorDock/` (catalog/rows/dock), `scripts/theme-a11y.js`,
  `scripts/theme-contract.json`.
- Prerequisite for [v1.3 EPIC-05 — AI-assisted token diff](../v1-3/EPIC-05-ai-token-diff.md).
- Sibling of [v1.2 EPIC-06 — analyzer health report](./EPIC-06-analyzer-health-report.md)
  (same contract, editor side vs CI side).
