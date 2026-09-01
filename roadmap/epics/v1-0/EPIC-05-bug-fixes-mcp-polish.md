# EPIC 05 — Bug Fixes + MCP Polish

**Status:** 🟡 PARTIAL — 5 of 7 stories shipped; MCP test coverage (F5.2) outstanding (audited 2026-07-16, main @ 97f6ae3)
**Effort estimate:** ~3-4 working days
**Stories:** 7

> **Update 2026-09-01 — v1.0 launched with this epic partial.** v1.0.0 was tagged 2026-08-17; the launch (first npm publish `css-is-awesome@1.1.0`, public repo, live docs site) completed 2026-09-01. The MCP server test suite (F5.2, US-05.2.1/05.2.2) is **carried forward post-launch** per the ship-then-see rule. Note on US-05.1.2's CDN criterion: before 2026-09-01 no version of the package existed on npm, so no CDN URL could return 200; as of 2026-09-01 the `@1` jsDelivr URLs (which `/docs/install` pins) and unpkg resolve — verified against `dist/css-is-awesome.min.css` and `public/themes/boilerplate/theme.css`.

## Audited status — 2026-07-16 (main @ 97f6ae3)

All three audit fixes (F5.1) landed, and the MCP README trim + `/docs/mcp` page (F5.3) shipped. The one gap is **MCP server tests (F5.2)** — there is no `mcp/server.test.*` and no `test:mcp` script, so the 30-tool server still has zero automated coverage. (Note: the MCP server has since grown to **30 tools**, not the 27 referenced in this epic's original prose.)

| Story | Status | Evidence |
|-------|--------|----------|
| US-05.1.1 Update `/docs/mixins` to v0.8 naming | ✅ DONE (minor residue) | `src/app/docs/mixins/page.tsx` code samples use `m.media`/`m.contain`/`m.wrap`/`m.font-face`; one stale `font-load` H3 heading/label remains (code below it already uses `m.font-face`) |
| US-05.1.2 Update `/docs/install` to v0.8 CDN + theme attr | ✅ DONE | CDN URLs pinned to `@0.8`; no `data-theme="<name>-light"` residue in `src/app/docs/install/page.tsx` |
| US-05.1.3 Fix `cia.btn($bg:)` state cascade | ✅ DONE | `scss/components/_buttons.scss` derives hover/active from `$bg` via `color-mix(in oklch, …, light-dark(black,white) 12%/20%)` with explicit `$bg-hover`/`$bg-active` overrides |
| US-05.1.4 Ship `/docs/composition` page | ✅ DONE | `src/app/docs/composition/page.tsx` (commit 10aa065) |
| US-05.2.1 Test list/get/search across all families | ⛔ NOT SHIPPED | No `mcp/server.test.*`; no `test:mcp` npm script |
| US-05.2.2 Test assemble_prompt per intent | ⛔ NOT SHIPPED | Depends on 05.2.1; no MCP test suite exists |
| US-05.3.1 Trim MCP README + `/docs/mcp` page | ✅ DONE | `src/app/docs/mcp/page.tsx` exists; README section trimmed (commit b4d87e1) |

## Mission

Clean up the Round 8 audit findings (3 latent bugs that compile clean but break on first consume) and bring the MCP server to production quality (tests + tightened README). Ship the `/docs/composition` page that demonstrates "build what cia doesn't" — Gemini's #1 recommendation for closing the parameter-power gap.

## Why now

These items don't fit cleanly into another epic but block clean v1.0 sign-off. The audit bugs would generate immediate GitHub issues post-launch. The MCP server (shipped in 0.8.2) has no tests yet — risky for a `1.0` stamp. `/docs/composition` is the doc page that proves the mixin system can build anything.

## Out of scope

- MCP server feature expansion (post-v1.0)
- AGENTS.md / llm.txt rewrite (covered in the v1.0 docs reframe — see ROADMAP Phase 6)
- New components beyond what already exists

## Features

### F5.1 — Round 8 audit fixes

**Goal:** Resolve the 3 outstanding latent bugs Panel R8 surfaced.

#### US-05.1.1 — Update /docs/mixins to v0.8 naming

**As** a dev visiting /docs/mixins
**I want** the page to reference current mixin names (m.media, m.contain, m.pad, m.pad-asym, m.font-face, m.color-static, m.wrap)
**So that** I don't try to call mixins that no longer exist

**Acceptance criteria:**
- [ ] Grep `src/app/docs/mixins/page.tsx` for v0.7 names: `bp`, `cq`, `inset`, `squish`, `font-load`, `color-raw`, `container` (as layout), `btn-primary()`
- [ ] Replace each with v0.8 equivalent
- [ ] Verify each rename against `scss/_mixins.scss` actual export
- [ ] All code samples on the page compile against current cia source

**Effort:** S (≤4 hrs)
**Depends on:** none

#### US-05.1.2 — Update /docs/install to v0.8 CDN + theme attr

**As** a dev visiting /docs/install
**I want** the page to ship correct CDN URLs (@0.8 not @0.6.0) and the current theme attribute syntax (`data-theme="sketchbook"` not `data-theme="sketchbook-light"`)
**So that** copy-paste install works

**Acceptance criteria:**
- [ ] Grep page for `@0.6.0`, `@0.6`, `@0.7` and replace with `@0.8` (or `@1` once shipped)
- [ ] Replace `data-theme="<name>-light"` with `data-theme="<name>"` per v0.8 architecture
- [ ] Verify each CDN URL returns 200 from jsDelivr + unpkg
- [ ] Smoke test: paste the install snippet into a blank HTML file, opens with correct theme

**Effort:** S (≤4 hrs)
**Depends on:** none

#### US-05.1.3 — Fix cia.btn($bg:) state cascade

**As** a consumer calling `@include cia.btn(primary, $bg: brand-accent)`
**I want** the hover and active states to derive from `brand-accent`, not the default `action-primary` palette
**So that** my custom button feels coherent across all interactive states

**Acceptance criteria:**
- [ ] Repro: write a test SCSS using `cia.btn(primary, $bg: <custom>)`
- [ ] Verify hover/active currently fall back to wrong palette
- [ ] Fix in `scss/components/_buttons.scss` — propagate $bg through `m.states()` derivation
- [ ] Test passes: hover state is `color-mix(in oklch, $bg, black 10%)` (or equivalent — match existing derivation rule)
- [ ] No regression in default-color buttons across all 8 themes (smoke test)

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-05.1.4 — Ship /docs/composition page

**As** a dev who's heard "cia mixins can build anything"
**I want** a dedicated docs page that proves it by building a non-trivial bespoke component (multi-step pricing card with custom toggle) end-to-end
**So that** I see the parameter-power story land in concrete code

**Acceptance criteria:**
- [ ] Page at `src/app/docs/composition/page.tsx`
- [ ] Builds one bespoke component three ways: Tailwind chaos (utility soup), Bootstrap brittle (override fight), cia clean (`@include` composition)
- [ ] Annotated diffs showing why cia is shorter + clearer
- [ ] Linked from main docs nav and from `/docs/mixins`

**Effort:** L (1-2 days)
**Depends on:** none

---

### F5.2 — MCP server tests

**Goal:** The 30-tool MCP server has no test coverage. Add tests so a 1.0 stamp is defensible.

#### US-05.2.1 — Test list/get/search across all 8 families

**As** a maintainer
**I want** automated tests that exercise every MCP tool against the actual cia source
**So that** a typo or refactor doesn't silently break agent discoverability

**Acceptance criteria:**
- [ ] Test file at `mcp/server.test.cjs` (or `.test.mjs` to align with existing scripts)
- [ ] Spawn `mcp/server.cjs` as a subprocess (or use a programmatic MCP test client)
- [ ] For each family (themes, mixins, functions, tokens, animations, components, recipes, docs):
  - [ ] `list_X` returns non-empty array with expected shape
  - [ ] `get_X(known_id)` returns full payload
  - [ ] `search_X("query")` returns expected hit
- [ ] Wired into `npm test` (or `npm run test:mcp`)
- [ ] CI runs on every PR

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-05.2.2 — Test assemble_prompt builds correct context per intent

**As** a maintainer
**I want** assemble_prompt tested for each intent type (mixin, component, theme, tokens, animations, recipe, overview)
**So that** the headline tool can't regress silently

**Acceptance criteria:**
- [ ] Tests cover: `mixin:btn`, `component:overlay`, `theme:terminal`, `tokens`, `animations`, `recipe:bare-tags`, `overview`
- [ ] Each test asserts: returned prompt includes the expected named slugs
- [ ] After recipes ship (Epic 01), add `recipe:dialog` to the test set

**Effort:** S (≤4 hrs)
**Depends on:** US-05.2.1, US-01.4.1 (recipe MCP exposure)

---

### F5.3 — MCP README + docs trim

**Goal:** The MCP section in README.md is currently ~40 lines. Trim to a concise pitch + JSON snippet.

#### US-05.3.1 — Trim MCP README section

**As** a consumer reading README.md
**I want** the MCP section to be 3-4 sentences of "what" + the JSON config snippet + a link to deeper docs
**So that** I'm not slowed down if I'm not an AI agent dev

**Acceptance criteria:**
- [ ] Section reduced from ~40 lines to ~12-15 lines
- [ ] Keeps: one-line pitch, the .mcp.json snippet, link to MCP docs (move detailed table to a new `/docs/mcp` page if not already there)
- [ ] Drops: the full 27-tool / 8-family table (move to /docs/mcp)
- [ ] Verifies linked `/docs/mcp` page exists (create if missing as part of this story)

**Effort:** S (≤4 hrs)
**Depends on:** none

## Definition of done

- [ ] All 7 stories accepted (5/7 done as of 2026-07-16)
- [x] /docs/mixins, /docs/install pass smoke tests against current cia source (one stale `font-load` heading label on /docs/mixins)
- [x] cia.btn($bg:) state cascade fix verified across all 8 themes
- [x] /docs/composition page lives and is linked from main nav
- [ ] MCP server has ≥80% line coverage via the new tests (**no MCP tests exist**)
- [ ] `npm test` (or `npm run test:mcp`) runs MCP tests in CI (**not wired**)
- [x] README.md MCP section is concise + /docs/mcp page absorbs the detail
- [ ] No Round 8 audit findings remain open (audit fixes done; MCP test debt remains)

## Risks

- **MCP test client choice.** Programmatic MCP test client may not exist yet. Mitigation: spawn server as subprocess and write a minimal JSON-RPC client (small, fits in test file).
- **/docs/composition scope creep.** Tempting to add 3 examples instead of 1. Mitigation: scope to ONE bespoke component done well. Additional examples can ship in v1.1.
- **btn state-cascade fix could regress.** Mitigation: visual-regression smoke test in Playwright (already wired) across all 8 themes.

## Related

- [EPIC-01-recipes-book.md](./EPIC-01-recipes-book.md) — MCP recipe exposure (US-01.4.1) tested here in US-05.2.2
- [project_v07x_punch_list.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_v07x_punch_list.md) — original audit-style memory; replace/update once these ship
