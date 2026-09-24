# EPIC v1.2-05 — Migration On-Ramp: MUI + Chakra

**Status:** ✅ Complete (v1.2) — shipped 2026-09-10/11, verified live.
This was v1.2's last open epic — v1.2 is now 8 of 8 complete.
**Effort estimate:** ~1 week
**Stories:** 6

> **Implementation note:** built by extending the existing shared engine in
> `bin/migrate-tailwind.cjs` (already reused once for `migrate-bootstrap.cjs`)
> rather than forking new logic — `mapColors`/`mapFlatScale`/
> `mapBorderRadius`/`writeThemeScss`/`closestByRem` are reused largely
> unmodified for both MUI and especially Chakra (Chakra's `colors`/`space`/
> `radii`/`fontSizes` shapes are structurally identical to what those
> functions already walk for Tailwind). Two scope calls worth recording:
> (1) MUI's `.dark`/`.light` palette shades are deliberately **not** mapped
> to hover/active — `writeThemeScss` already auto-derives those via
> `m.states()` once a `-default` token is set, and mapping both would
> create two competing hover mechanisms in one theme; (2) neither MUI's
> 24-elevation shadow array nor Chakra's `shadows`/`breakpoints`/`zIndices`
> are individually mapped — no natural 1:1 cia analog exists (cia has 5
> named shadow steps and fixed system-scale breakpoints/z-layers, not
> per-project ones), so each surfaces as one honest informational note
> instead of an arbitrary per-field guess. Verified live against real
> fixture themes for both tools — see the audit note in
> `roadmap/epics/README.md` for the exact confidence-report numbers.

## Mission

Extend `npx cia migrate` (shipped in v1.0 EPIC-03 for Tailwind + Bootstrap) to support MUI theme objects and Chakra UI theme objects. Same pattern: parse → map → output cia theme.scss with confidence report.

## Why now

MUI and Chakra together account for a huge share of React-app design systems. Teams migrating off them want their brand colors + spacing scale to come with. v1.2 is the right time to expand the migration story.

## Out of scope

- MUI component-prop translation (out of scope — cia doesn't have a matching React component library; that's for `@cia/react` codegen)
- Chakra component-prop translation (same reason)
- MUI v4 (legacy — only MUI v5+)

## Features

### F5.1 — MUI theme import

#### US-V12.05.1.1 — `npx cia migrate mui <path>` recognized

**Acceptance criteria:**
- [x] CLI subcommand registered (`bin/migrate-mui.cjs`, wired into `bin/cia.cjs`)
- [x] Accepts `.js`, `.ts`, `.mjs`, `.cjs` (reuses `jiti`-based `loadConfig`, exported from `migrate-tailwind.cjs` for this)
- [x] Validates the loaded module exports either a default `theme` object or named `theme`/`createTheme` result (`findMuiTheme()` checks `mod.theme`, `mod.default`, and `mod` itself for a `.palette` key)
- [x] Errors helpfully if shape doesn't match MUI theme

**Effort:** ✅ DONE 2026-09-10/11.
**Depends on:** v1.0 EPIC-03

#### US-V12.05.1.2 — Parse MUI theme → extract relevant fields

**Acceptance criteria:**
- [~] Extracts `palette.primary.main` — `.light`/`.dark`/`.contrastText` deliberately NOT extracted, see F5.1.3's note below
- [x] Extracts: `palette.secondary.*`, `.error.*`, `.warning.*`, `.info.*`, `.success.*`, `.text.*`, `.background.*`
- [x] Extracts: `spacing` (number, function, OR array — all 3 forms, sampling factors 1-9), `shape.borderRadius`
- [~] Extracts `typography.fontFamily`; per-heading `typography.h1/h2/etc.fontSize` NOT extracted — see F5.1.3's disclosed scope note
- [~] `shadows`/`breakpoints.values` are detected and surfaced as one informational UNMAPPED note each, not individually parsed field-by-field — see F5.1.3
- [x] Handles `palette.mode` (read and reported; cia's own theme shape is already mode-agnostic per token — see EPIC-05's implementation note above)

**Effort:** ✅ DONE 2026-09-10/11.

#### US-V12.05.1.3 — Map MUI tokens to cia contract

**Acceptance criteria:**
- [~] Color mapping: `palette.primary.main` → `--action-primary-default` — done. Hover is **NOT** derived from `palette.primary.dark`; `writeThemeScss` already auto-derives hover/active via `m.states()` once `-default` is set (same mechanism Tailwind/Bootstrap already use) — mapping MUI's own `.dark`/`.light` shades on top would create two competing hover mechanisms in one theme. Deliberate deviation from the original acceptance criterion, recorded here rather than silently done differently.
- [x] Status colors: `.error.main` → cia error-default; same for warning/info/success
- [x] Background: `palette.background.default` → `--background-default` (and `palette.background.paper` → `--surface-default`, MEDIUM confidence)
- [x] Text: `palette.text.primary` → `--text-primary` (and `.secondary` → `--text-secondary`)
- [x] Spacing: MUI `spacing(1) = 8px` mapped to cia space scale (verified live: `spacing(1)` → `space-1` HIGH confidence)
- [x] Border radius: `shape.borderRadius` → closest cia radius slot by rem proximity (not hardcoded to `radius-md`)
- [x] Confidence report (HIGH/MEDIUM/LOW/UNMAPPED) printed
- [~] Shadows: **NOT** mapped field-by-field. MUI's 24-elevation system has no natural 1:1 analog against cia's 5 named shadow steps — forcing a mapping would be arbitrary, not more correct (same call Bootstrap's own already-shipped migrator makes — it doesn't map shadows either). Surfaced as one informational UNMAPPED note instead. Disclosed deviation from the original acceptance criterion.

**Effort:** ✅ DONE 2026-09-10/11. Verified live against a real fixture
theme: 17 HIGH + 1 MEDIUM + 5 UNMAPPED (competing spacing slots, shadows,
breakpoints), compiled cleanly with `sass`, `m.states()` correctly
auto-derived hover/active for all 5 color groups.

---

### F5.2 — Chakra theme import

#### US-V12.05.2.1 — `npx cia migrate chakra <path>` recognized

**Acceptance criteria:**
- [x] CLI subcommand registered (`bin/migrate-chakra.cjs`, wired into `bin/cia.cjs`)
- [x] Accepts the same file types as MUI command (shares `loadConfig`)
- [x] Errors helpfully if shape doesn't match Chakra theme

**Effort:** ✅ DONE 2026-09-10/11.

#### US-V12.05.2.2 — Parse Chakra theme + map to cia

**Acceptance criteria:**
- [x] Extracts `colors.*` — reuses `mapColors()` unmodified (Chakra's `{shade: hex}` palette shape matches Tailwind's exactly); `brand`/`primary`/`accent`/`theme`-named scales and `red`/`green`/`orange`/`blue` status colors both resolve via the existing heuristics with no changes
- [~] Extracts `fonts.heading`/`fonts.body`; `fontSizes.*` extracted via reused `mapFlatScale()`. `fontWeights.*`/`lineHeights.*` **NOT** extracted — same disclosed-scope-cut reasoning as MUI's per-heading sizes (a long tail with no single confident mapping story); not silently dropped, recorded here
- [~] Extracts `space.*` (via reused `mapFlatScale()`) and `radii.*` (via reused `mapBorderRadius()`). `shadows.*`/`breakpoints.*`/`zIndices.*` are detected and surfaced as one informational UNMAPPED note each, not individually parsed — same reasoning as MUI's shadows
- [x] Maps brand color (e.g. `brand.500`) → `--action-primary-default`
- [x] Maps status colors per Chakra convention
- [x] Outputs via same writer as Tailwind/Bootstrap/MUI (consistent shape — literally the same `writeThemeScss()` function)
- [x] Confidence report printed

**Effort:** ✅ DONE 2026-09-10/11. Verified live against a real fixture
theme: 14 HIGH + 4 MEDIUM + 3 UNMAPPED, compiled cleanly with `sass`,
including a correctly-detected competing-spacing-slot case (`space.1`
losing to `space.2` for the same cia slot, exactly the same collision
logic Tailwind's migrator already has).

#### US-V12.05.2.3 — Docs + integration test

**Acceptance criteria:**
- [x] Docs pages live at `/docs/migration-mui` and `/docs/migration-chakra`
  (the real existing route convention — `migration-<tool>`, not the
  `/docs/migrate/<tool>` this story originally guessed; matches
  `/docs/migration-tailwind` and `/docs/migration-bootstrap`). Both
  registered in `src/app/docs/nav.config.ts`'s Migration section (the two
  existing tools were already there; adding the new two without touching
  that file would have shipped them unreachable from the sidebar).
- [~] End-to-end test: real MUI theme + real Chakra theme → migrate → compiles
  cleanly with `sass`, mapping verified correct by hand. **Not** "passes
  `validate-themes`" as originally written — that criterion doesn't hold for
  *any* fresh migration, including the already-shipped Tailwind/Bootstrap
  ones (confirmed by running the same compile+validate pipeline against a
  minimal real Tailwind fixture: it fails identically, for the same reason
  — a fresh migration only has the tokens the source config defined; the
  rest of cia's 127 required tokens need manual completion, which is the
  tool's own stated purpose, not a bug). No separate permanent unit-test
  file was added, matching that neither shipped Tailwind nor Bootstrap
  migrator has one either — CLI run + validator is the established
  verification shape for this feature.
- [x] CHANGELOG entry for v1.2 release — not hand-written; `CHANGELOG.md`
  is semantic-release-generated from conventional commit messages (see
  `project_session_resume_20260716` memory: never hand-type a version
  entry), so this happens automatically from this work's commits.

**Effort:** ✅ DONE 2026-09-10/11.

## Definition of done

- [x] All 6 stories accepted (2 with disclosed scope deviations recorded
  above, not silently reinterpreted)
- [x] `npx cia migrate mui ./theme.ts` works (verified against a real fixture)
- [x] `npx cia migrate chakra ./theme.ts` works (verified against a real fixture)
- [~] Both compile cleanly and map correctly — see the corrected DoD note
  in F5.2.3 above for why "passes `validate-themes`" isn't the real bar
  for a fresh migration from any of the 4 tools
- [x] Confidence reports printed
- [x] Docs pages live, registered in the nav sidebar
- [x] Tested against a representative MUI theme (palette, spacing, shape,
  typography) and a representative Chakra theme (colors, space, radii,
  fonts, fontSizes) — not exhaustive real-world theme files, but real,
  correctly-shaped fixtures exercising every mapped field

## Risks

- **MUI theme structure variance.** Custom themes can extend MUI's shape in arbitrary ways. Mitigation: parse only the well-defined fields; ignore custom keys (note in confidence report).
- **Chakra v2 vs v3.** v3 changes theme shape significantly. Mitigation: support v2 first (still dominant in 2026); add v3 if community asks.
- **Shadow mapping inherently lossy.** MUI's 24-elevation system has no exact cia analog. Mitigation: document the mapping decision; consumers can override post-migration.

## Related

- [v1.0 EPIC-03-migration-on-ramp.md](../v1-0/EPIC-03-migration-on-ramp.md) — Tailwind + Bootstrap migration (same pattern)
