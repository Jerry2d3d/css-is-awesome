# EPIC 03 — Migration On-Ramp

**Status:** ✅ SHIPPED — all 6 stories done (audited 2026-07-16, main @ 97f6ae3)
**Effort estimate:** ~3-5 working days
**Stories:** 6

## Audited status — 2026-07-16 (main @ 97f6ae3)

Both converters shipped and are wired into the `cia` bin. The `cia migrate tailwind|bootstrap` router lives at `bin/cia.cjs` (114 LOC); the two converters are `bin/migrate-tailwind.cjs` (832 LOC — parse + map + confidence report + `@include cia.theme()` writer) and `bin/migrate-bootstrap.cjs` (427 LOC). Docs pages exist at `/docs/migration-tailwind` and `/docs/migration-bootstrap`. Merged via PRs #6/#7/#8 (+ the scaffold merge).

> Note: the header block comment at the top of `bin/migrate-tailwind.cjs` still says "PR 1 — parse + dump JSON to stdout"; that comment is stale — the mapping (US-03.1.3) and writer (US-03.1.4) code was added below it in later commits and is present in the file.

| Story | Status | Evidence |
|-------|--------|----------|
| US-03.1.1 CLI scaffolding `cia migrate tailwind <path>` | ✅ DONE | `bin/cia.cjs` router + `bin` field `"cia": "bin/cia.cjs"`; auto-detects `tailwind.config.*` |
| US-03.1.2 Parse Tailwind config + extract theme | ✅ DONE | `bin/migrate-tailwind.cjs` config load + extraction |
| US-03.1.3 Map Tailwind tokens → cia contract | ✅ DONE | Mapping + HIGH/MEDIUM/LOW/UNMAPPED confidence report in `bin/migrate-tailwind.cjs` (PR #6, commit 18764ac) |
| US-03.1.4 Output cia `theme.scss` | ✅ DONE | `@include cia.theme()` writer (PR #7, commit ed68c1f) |
| US-03.2.1 CLI `cia migrate bootstrap <path>` | ✅ DONE | `bin/migrate-bootstrap.cjs` + router entry (PR #8) |
| US-03.2.2 Map Bootstrap variables → cia tokens | ✅ DONE | Parse + map + write in `bin/migrate-bootstrap.cjs` (PR #8, commit 50d4042) |

## Mission

Ship a `npx cia migrate` CLI that converts a Tailwind config file or a Bootstrap variables file into a cia theme. This is the strongest single adoption hack: most teams considering cia already have a Tailwind config or Bootstrap variables they've tuned for months.

## Why now

The single biggest reason teams don't try a new design system is the migration cost. cia today says "here are 8 themes, here's the editor." That's still asking the team to abandon their existing brand work. `npx cia migrate tailwind ./tailwind.config.js` says "your brand work comes with you."

If this lands cleanly, every cia launch post can include "if you're already on Tailwind or Bootstrap, here's the one-liner." That's the kind of headline that drives downloads.

## Out of scope

- Material UI theme import (post-v1.0)
- Chakra UI theme import (post-v1.0)
- Figma Tokens / Style Dictionary import (post-v1.0 — covered by existing DTCG bridge separately)
- Component class migration (out of scope forever — recipes handle that side)

## Features

### F3.1 — Tailwind config → cia theme converter

**Goal:** Read a Tailwind config and produce a cia theme.scss that maps as many tokens as possible, with notes on what didn't map.

#### US-03.1.1 — CLI scaffolding: `npx cia migrate tailwind <path>`

**As** a Tailwind user trying cia
**I want** to run one command pointing at my tailwind.config and get a cia theme back
**So that** I don't have to hand-translate 80 color values

**Acceptance criteria:**
- [ ] CLI entry at `bin/cia.cjs` (or extend existing MCP bin if cleaner)
- [ ] `npx cia migrate tailwind <path>` recognized
- [ ] Path accepts `.js`, `.ts`, `.mjs`, `.cjs` (use `jiti` for runtime TS support)
- [ ] Errors with helpful message if path invalid, file missing, or config malformed
- [ ] Without `<path>`, walks up looking for `tailwind.config.*` in cwd

**Effort:** S (≤4 hrs)
**Depends on:** none

#### US-03.1.2 — Parse Tailwind config and extract theme

**As** the migrate CLI
**I want** to load the resolved Tailwind config (including extends + plugins) and pull out theme.colors, theme.spacing, theme.fontSize, theme.borderRadius, theme.fontFamily, theme.boxShadow
**So that** downstream mapping has a complete picture

**Acceptance criteria:**
- [ ] Use `resolveConfig` from `tailwindcss/resolveConfig` (peer dep, optional)
- [ ] Extract: colors, spacing, fontSize, fontFamily, fontWeight, lineHeight, borderRadius, boxShadow, screens
- [ ] Flatten nested color objects (e.g. `blue.500` → `blue-500`)
- [ ] Preserve Tailwind v3 + v4 config shapes (v4 uses CSS @theme)

**Effort:** M (4-8 hrs)
**Depends on:** US-03.1.1

#### US-03.1.3 — Map Tailwind tokens to cia contract tokens

**As** the migrate CLI
**I want** to map Tailwind's tokens to cia's 123-token contract with best-effort heuristics
**So that** the output theme is functional out of the box

**Acceptance criteria:**
- [ ] Color mapping: Tailwind's primary palette (e.g. `blue.500`) → `--action-primary-default`; derive hover/active via cia `m.states()`
- [ ] Spacing scale: Tailwind's `1`, `2`, `4` → cia's space scale 1-9 (closest match)
- [ ] Font sizes: map to cia type scale by rem value
- [ ] Border radii: map by px value
- [ ] Print a confidence report: HIGH (exact match), MEDIUM (close fuzzy match), LOW (best guess), UNMAPPED (no analog)
- [ ] UNMAPPED tokens go into a comment block at the bottom of the output for manual review

**Effort:** L (1-2 days)
**Depends on:** US-03.1.2

#### US-03.1.4 — Output a cia theme.scss file

**As** the migrate CLI user
**I want** the result written to disk as a ready-to-use theme.scss
**So that** I can immediately `@use` it from my SCSS entry

**Acceptance criteria:**
- [ ] Default output path: `./cia-themes/<name>.scss`
- [ ] CLI flag `--out <path>` overrides
- [ ] CLI flag `--name <name>` sets theme name (default = "migrated")
- [ ] File header includes timestamp, source path, confidence summary
- [ ] Output wrapped in `@include cia.theme('<name>') { ... }` per locked architecture
- [ ] Includes `@include m.states(action-primary)` derivation
- [ ] Post-write: run `node scripts/theme-validator.js` on the output, print results

**Effort:** M (4-8 hrs)
**Depends on:** US-03.1.3

---

### F3.2 — Bootstrap variables → cia theme converter

**Goal:** Read a Bootstrap `_variables.scss` (or `_custom-variables.scss`) and produce a cia theme.

#### US-03.2.1 — CLI: `npx cia migrate bootstrap <path>`

**As** a Bootstrap user migrating to cia
**I want** to point the CLI at my Bootstrap variables file and get a cia theme back
**So that** my customized brand colors transfer over

**Acceptance criteria:**
- [ ] `npx cia migrate bootstrap <path>` recognized
- [ ] Accepts a single SCSS file path
- [ ] Parses Sass variable declarations using `postcss-scss` or `sass-parser`
- [ ] Extracts: $primary, $secondary, $success, $info, $warning, $danger, $light, $dark, $body-bg, $body-color, $border-radius, $border-radius-sm/lg, $font-family-base, $font-family-monospace, $font-size-base, $line-height-base, $spacer
- [ ] Handles `!default` annotations correctly

**Effort:** M (4-8 hrs)
**Depends on:** US-03.1.1

#### US-03.2.2 — Map Bootstrap variables to cia tokens

**As** the migrate CLI
**I want** to map Bootstrap's variables to cia's contract with sensible defaults for anything Bootstrap doesn't define
**So that** the output theme is complete (passes validate-themes)

**Acceptance criteria:**
- [ ] $primary → `--action-primary-default` (derive hover/active via `m.states`)
- [ ] $body-bg → `--background-default` (with `light-dark()` if dark-mode variables present)
- [ ] $body-color → `--text-primary`
- [ ] $border-radius → `--radius-md`; sm/lg map proportionally
- [ ] $font-family-base → `--font-sans`; $font-family-monospace → `--font-mono`
- [ ] $spacer (1rem) → `--space-4` (cia's mid scale)
- [ ] Status colors ($success / $warning / etc.) → cia status tokens
- [ ] Missing Bootstrap variables → cia defaults (don't crash, just note in confidence report)
- [ ] Output via same writer as F3.1 (US-03.1.4)

**Effort:** M (4-8 hrs)
**Depends on:** US-03.2.1, US-03.1.4

## Definition of done

- [x] All 6 stories accepted
- [x] `npx cia migrate tailwind ./tailwind.config.js` produces a valid theme.scss
- [x] `npx cia migrate bootstrap ./_variables.scss` produces a valid theme.scss
- [x] Both pass `npm run validate-themes` (FAIL-by-default — if Tailwind/Bootstrap colors fail WCAG, output documents it)
- [x] Confidence report printed to stdout summarizes HIGH/MEDIUM/LOW/UNMAPPED counts
- [x] CLI documented in README.md + docs pages (`/docs/migration-tailwind`, `/docs/migration-bootstrap`)
- [x] At least 1 real Tailwind config (e.g. shadcn's default) and 1 Bootstrap variables file tested end-to-end
- [x] CLI script lives in `mcp/` or `bin/` per `files` manifest — does NOT violate "zero JS in npm package" (CLI binaries are explicitly allowed via `bin` field, like the MCP server)

## Risks

- **Tailwind v4 config shape is different.** v4 moved to CSS @theme. Mitigation: detect format, branch — or punt v4 to v1.1 if scope creep.
- **Color palette mismatch.** Tailwind ships a 50-shade palette per color; cia ships single tokens with derived states. Mitigation: pick the "500" shade by default, document the choice, let user override via `--shade <n>` flag.
- **Sass parser stability.** `postcss-scss` doesn't always handle nested Sass syntax. Mitigation: scope parsing to variable declarations only, fail loudly on unparseable input.
- **CLI in cia package contradicts "zero JS" rule.** It does NOT — the rule is no JS in `files` manifest that affects consumer pages. `bin/` is allowed (MCP server already lives there). Memory `feedback_no_js_in_package.md` confirms.

## Related

- [EPIC-02-theme-editor-polish.md](./EPIC-02-theme-editor-polish.md) — migrated themes can be opened in the editor for further tuning
- [feedback_no_js_in_package.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/feedback_no_js_in_package.md) — confirms CLI in `bin/` doesn't violate the rule
