# EPIC v1.2-05 — Migration On-Ramp: MUI + Chakra

**Status:** Planned (v1.2)
**Effort estimate:** ~1 week
**Stories:** 6

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
- [ ] CLI subcommand registered
- [ ] Accepts `.js`, `.ts`, `.mjs`, `.cjs` (uses `jiti` for runtime TS)
- [ ] Validates the loaded module exports either default `theme` object or named `theme`/`createTheme` result
- [ ] Errors helpfully if shape doesn't match MUI theme

**Effort:** M (4-8 hrs)
**Depends on:** v1.0 EPIC-03

#### US-V12.05.1.2 — Parse MUI theme → extract relevant fields

**Acceptance criteria:**
- [ ] Extracts: `palette.primary.main` + `.light` + `.dark` + `.contrastText`
- [ ] Extracts: `palette.secondary.*`, `.error.*`, `.warning.*`, `.info.*`, `.success.*`, `.text.*`, `.background.*`
- [ ] Extracts: `spacing` (function or array), `shape.borderRadius`
- [ ] Extracts: `typography.fontFamily`, `typography.h1/h2/etc.fontSize`
- [ ] Extracts: `shadows[1..24]`, `breakpoints.values`
- [ ] Handles both `palette.mode: 'light'` and `palette.mode: 'dark'`

**Effort:** M (4-8 hrs)

#### US-V12.05.1.3 — Map MUI tokens to cia contract

**Acceptance criteria:**
- [ ] Color mapping: `palette.primary.main` → `--action-primary-default`; derive hover via `palette.primary.dark`
- [ ] Status colors: `.error.main` → cia error-default; same for warning/info/success
- [ ] Background: `palette.background.default` → `--background-default`
- [ ] Text: `palette.text.primary` → `--text-primary`
- [ ] Spacing: MUI `spacing(1) = 8px` mapped to cia space scale
- [ ] Border radius: `shape.borderRadius` → cia radius-md
- [ ] Confidence report (HIGH/MEDIUM/LOW/UNMAPPED) printed
- [ ] Shadows: MUI's 24-elevation system mapped to cia's smaller shadow set (closest match)

**Effort:** L (1-2 days)

---

### F5.2 — Chakra theme import

#### US-V12.05.2.1 — `npx cia migrate chakra <path>` recognized

**Acceptance criteria:**
- [ ] CLI subcommand registered
- [ ] Accepts the same file types as MUI command
- [ ] Errors helpfully if shape doesn't match Chakra theme

**Effort:** M (4-8 hrs)

#### US-V12.05.2.2 — Parse Chakra theme + map to cia

**Acceptance criteria:**
- [ ] Extracts: `colors.brand.*` (or whatever brand scale named), `colors.gray.*`, `colors.<status>.*`
- [ ] Extracts: `fonts.heading`, `fonts.body`, `fontSizes.*`, `fontWeights.*`, `lineHeights.*`
- [ ] Extracts: `space.*`, `radii.*`, `shadows.*`, `breakpoints.*`, `zIndices.*`
- [ ] Maps brand color (e.g. `brand.500`) → `--action-primary-default`
- [ ] Maps status colors per Chakra convention
- [ ] Outputs via same writer as Tailwind/Bootstrap/MUI (consistent shape)
- [ ] Confidence report printed

**Effort:** L (1-2 days)

#### US-V12.05.2.3 — Docs + integration test

**Acceptance criteria:**
- [ ] `/docs/migrate/mui` and `/docs/migrate/chakra` pages
- [ ] End-to-end test: real MUI theme + real Chakra theme → migrate → validate-themes passes
- [ ] CHANGELOG entry for v1.2 release

**Effort:** M (4-8 hrs)

## Definition of done

- [ ] All 6 stories accepted
- [ ] `npx cia migrate mui ./theme.ts` works
- [ ] `npx cia migrate chakra ./theme.ts` works
- [ ] Both pass `validate-themes`
- [ ] Confidence reports printed
- [ ] Docs pages live
- [ ] Tested against ≥1 real-world MUI theme + ≥1 real-world Chakra theme

## Risks

- **MUI theme structure variance.** Custom themes can extend MUI's shape in arbitrary ways. Mitigation: parse only the well-defined fields; ignore custom keys (note in confidence report).
- **Chakra v2 vs v3.** v3 changes theme shape significantly. Mitigation: support v2 first (still dominant in 2026); add v3 if community asks.
- **Shadow mapping inherently lossy.** MUI's 24-elevation system has no exact cia analog. Mitigation: document the mapping decision; consumers can override post-migration.

## Related

- [v1.0 EPIC-03-migration-on-ramp.md](../v1-0/EPIC-03-migration-on-ramp.md) — Tailwind + Bootstrap migration (same pattern)
