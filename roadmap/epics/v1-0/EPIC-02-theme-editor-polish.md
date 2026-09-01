# EPIC 02 — Theme Editor Polish

**Status:** 🟡 PARTIAL — share + name + .css download shipped; .scss download, contrast validator, and full reset/diff outstanding (audited 2026-07-16, main @ 97f6ae3). **US-02.1.2 re-opened 2026-08-30** — the theme-system pass changed the selector shape and the contract the download has to satisfy (see note under the table)
**Effort estimate:** ~3-4 working days
**Stories:** 9

> **Update 2026-09-01 — v1.0 launched with this epic partial.** v1.0.0 was tagged 2026-08-17; the launch (first npm publish `css-is-awesome@1.1.0`, public repo, live docs site) completed 2026-09-01. The open work — `.scss` download (US-02.1.1), the re-opened US-02.1.2 follow-up, the inline contrast validator (F2.3), and full reset/diff (F2.4) — is **carried forward post-launch** per the ship-then-see rule.

## Audited status — 2026-07-16 (main @ 97f6ae3)

The dock lives at `src/components/ThemeEditorDock/ThemeEditorDock.tsx`. **Share via URL is fully shipped** (encode + copy + hydrate, commit 656f1a4). **Download ships `.css` only** — the `.scss` / `@include cia.theme()` export was never added. The **inline contrast validator (F2.3) was never built** (no `src/lib/theme-validator-browser.ts`, no contrast/ratio/WCAG UI in the dock). Reset is **global-only**; the diff view is a passive always-on "modified" badge, not the specced toggle.

| Story | Status | Evidence |
|-------|--------|----------|
| US-02.1.1 Download `mytheme.scss` | ⛔ NOT SHIPPED | Dock only has `buildDownloadCSS` + a single "↓ Download" button that emits `.css`; no SCSS/`@include cia.theme()` serializer |
| US-02.1.2 Download `mytheme.css` | ✅ DONE | `buildDownloadCSS()` + `triggerDownload('<name>.css', ...)`, matches `public/themes/<name>/theme.css` shape |
| US-02.1.3 Theme name input + sanitizer | ✅ DONE | `sanitizeName()`, name input, default `<family>-custom` |
| US-02.2.1 Encode overrides to URL | ✅ DONE | `src/lib/theme-share.ts` (CompressionStream + base64, `?t=`), `replaceState` debounced |
| US-02.2.2 Copy share link button | ✅ DONE | `copyShare()` + `copyShareLink()`, confirmation toast |
| US-02.2.3 Loading shared URL hydrates | ✅ DONE | Decode on mount, switches to sender's family, graceful decode-fail toast |
| US-02.3.1 In-browser contrast validator | ⛔ NOT SHIPPED | No `theme-validator-browser.ts`; no live PASS/FAIL/DECORATIVE badges |
| US-02.3.2 Contrast ratio + WCAG status | ⛔ NOT SHIPPED | Depends on 02.3.1; no ratio tooltip anywhere in the dock |
| US-02.4.1 Reset (row / group / global) | 🟡 PARTIAL | Only a global `reset()` + single "Reset" button; no per-row/per-group reset, no confirm modal |
| US-02.4.2 Show-diff toggle | 🟡 PARTIAL | Modified rows show an always-on `●`/"modified" badge; no toggle, no sessionStorage persistence, no per-group count |

> **Re-opened 2026-08-30 — US-02.1.2 needs a follow-up.** The theme-system pass changed both the target shape and the contract the dock is validating against, so "matches `public/themes/<name>/theme.css`" no longer means what it meant when this row was ticked:
>
> - Shipped themes now emit `:root, :root[data-theme="<name>"]` so a drop-in file themes the page with no `<html data-theme>` edit. A download that emits only `[data-theme="<name>"]` produces a file that renders nothing when dropped in alone.
> - `--space-0` … `--space-9` are contract-required (the t-shirt names are now `var()` aliases and optional), so a downloaded theme omitting them fails `validate-themes`. Spacing is also now genuinely themeable, which means the dock has nine real controls it isn't exposing.
> - Six dead `--radius-*` tokens left the contract; `--btn-radius` and friends are the live knobs.
>
> US-02.3.1's pair count moved 17 → 22 as well (see below).

## Mission

Take the existing `/themes` editor (~1,200 LOC, ships today, persists overrides to localStorage) from "works" to "ship-ready." Add download, share via URL, and inline WCAG contrast validation so users can author and distribute custom themes without leaving the browser.

## Why now

The theme editor is one of cia's three v1.0 differentiators. Tailwind Play does utility-soup. Material Theme Builder is colors-only. cia covers ALL 127 required contract tokens — but today there's no way to export the result. Without download + share, the editor is a demo, not a tool.

## Out of scope

- Multi-theme side-by-side compare (post-v1.0)
- Cloud save (would require backend)
- Public theme marketplace
- Theme version pinning per user

## Features

### F2.1 — Download exported theme (SCSS + CSS)

**Goal:** A user editing tokens in the dock can download a clean, ship-ready theme file in either SCSS source or compiled CSS form.

#### US-02.1.1 — Download mytheme.scss button

**As** a designer or dev who's customized tokens in the editor
**I want** to download an SCSS file wrapped in `@include cia.theme('myname') { ... }`
**So that** I can drop it into my SCSS project and consume it through the cia mixin system

**Acceptance criteria:**
- [ ] "Download .scss" button visible in the dock
- [ ] Serializes light + dark overrides to a single `@include cia.theme('<name>') { ... }` block
- [ ] Color tokens emitted as `light-dark(<light>, <dark>)`
- [ ] Non-color overrides emitted inside `@media (prefers-color-scheme: dark)` per locked architecture
- [ ] Output passes `npm run validate-themes` after compile

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-02.1.2 — Download mytheme.css button

**As** a designer or dev who wants a drop-in CSS file
**I want** to download a compiled CSS file with `[data-theme="myname"] { ... }` blocks
**So that** I can use the theme without an SCSS build step

**Acceptance criteria:**
- [ ] "Download .css" button visible in the dock
- [ ] Output mirrors the existing `public/themes/<name>/theme.css` shape
- [ ] Includes both light and dark blocks (or `light-dark()` per token)
- [ ] File downloads as `<name>.css`

**Effort:** S (≤4 hrs)
**Depends on:** US-02.1.1

#### US-02.1.3 — Theme name input with sanitizer

**As** a user about to download
**I want** to pick a theme name and have invalid characters auto-corrected
**So that** the downloaded file uses a safe identifier and the `[data-theme]` attribute selector works

**Acceptance criteria:**
- [ ] Input field labeled "Theme name"
- [ ] Sanitizer: lowercase, strip whitespace, replace invalid chars with `-`, max 50 chars
- [ ] Default name = active theme + "-custom" (e.g. `sketchbook-custom`)
- [ ] Preview "Your theme: my-brand" updates live as user types
- [ ] Sanitized value used in both .scss and .css downloads

**Effort:** S (≤4 hrs)
**Depends on:** none

---

### F2.2 — Share via URL

**Goal:** A user can copy a single URL that fully reproduces their edited theme on someone else's machine.

#### US-02.2.1 — Encode all overrides to URL search params

**As** a user with a beautifully customized theme
**I want** the editor URL to update as I edit, encoding my overrides
**So that** the URL itself is the share artifact

**Acceptance criteria:**
- [ ] On every override change, update `window.history.replaceState` with new query param
- [ ] Encoding: gzip + base64 the overrides JSON, then URL-encode → `?t=<short-hash>`
- [ ] URL stays under 2,000 chars even with full token override (verify with full-edit smoke test)
- [ ] No third-party encoder dependencies (use built-in `CompressionStream` if available, polyfill if needed)

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-02.2.2 — "Copy share link" button

**As** a user happy with their theme
**I want** a button that copies the current URL to my clipboard
**So that** I can paste it into Slack/email without manually selecting the address bar

**Acceptance criteria:**
- [ ] Button visible in the dock, near the download buttons
- [ ] Uses Clipboard API + execCommand fallback (mirror existing CopyButton pattern)
- [ ] Toast or inline confirmation: "Copied — anyone with this link can see your theme"

**Effort:** S (≤4 hrs)
**Depends on:** US-02.2.1

#### US-02.2.3 — Loading a shared URL hydrates the editor

**As** a recipient of a shared URL
**I want** opening the link to instantly show the sender's theme applied to the preview components
**So that** I see what they're showing me without any extra clicks

**Acceptance criteria:**
- [ ] On `/themes` mount, parse `?t=` param
- [ ] Decode + decompress + apply to overrides state
- [ ] Update the active theme name input to match
- [ ] Falls back gracefully if decode fails (show toast, load default)

**Effort:** S (≤4 hrs)
**Depends on:** US-02.2.1

---

### F2.3 — Inline contrast validator

**Goal:** Users editing color tokens see immediate WCAG pass/fail feedback so they can't ship a non-compliant theme by accident.

#### US-02.3.1 — Run theme-validator.js logic in-browser

**As** a user editing token colors
**I want** the contrast validator to run live as I edit
**So that** I see FAIL badges the moment I drop below WCAG 2.2 AA

**Acceptance criteria:**
- [ ] Port the contrast-check logic from `scripts/theme-validator.js` to a browser-safe module at `src/lib/theme-validator-browser.ts`
- [ ] Check all **22** token contrast pairs whenever any color token changes (was 17; the five `--code-*` foregrounds against `--code-bg` were added 2026-08-30)
- [ ] Badge each affected ColorRow with PASS / FAIL / DECORATIVE
- [ ] Computation debounced to <50 ms per re-check; no jank on slider drag

**Effort:** L (1-2 days)
**Depends on:** none

#### US-02.3.2 — Show contrast ratio + WCAG status

**As** a user inspecting a borderline color
**I want** to see the actual ratio (e.g. "4.51 — passes AA") next to the badge
**So that** I can make informed trade-offs without leaving the editor

**Acceptance criteria:**
- [ ] Hover on FAIL badge → tooltip with "Ratio: X.XX — needs Y.YY for AA"
- [ ] Decorative tokens (like `--border-default` per SC 1.4.11) labeled "decorative" with info icon
- [ ] Click on a FAIL badge → focuses the offending color token row

**Effort:** M (4-8 hrs)
**Depends on:** US-02.3.1

---

### F2.4 — Reset + diff view

**Goal:** Users can experiment freely knowing they can always return to the base theme, and can see at a glance what they've actually changed.

#### US-02.4.1 — Reset to base button (per row / per group / global)

**As** a user who went too far on one token
**I want** a reset arrow on every modified token, plus group-level + global reset buttons
**So that** I can undo without wiping my whole session

**Acceptance criteria:**
- [ ] Each row with an override shows a reset arrow
- [ ] Click → remove that token's override, fall back to base value, re-render preview
- [ ] Group header has "Reset group" button (visible when any token in group is overridden)
- [ ] Dock footer has "Reset all" with confirmation modal
- [ ] localStorage updates immediately

**Effort:** S (≤4 hrs)
**Depends on:** none

#### US-02.4.2 — Show diff toggle highlights overridden tokens

**As** a user reviewing their changes
**I want** a "Show diff" toggle that visually marks every overridden token
**So that** I can audit what I'll be exporting at a glance

**Acceptance criteria:**
- [ ] Toggle button in dock header, default off
- [ ] When on: modified token rows get a colored left-border + count badge per group
- [ ] Persists per-session in sessionStorage (not URL)

**Effort:** S (≤4 hrs)
**Depends on:** none

## Definition of done

- [ ] All 9 stories accepted (5/9 done, 2 partial as of 2026-07-16)
- [ ] `/themes` editor exports a .scss file that compiles + passes validate-themes (**.scss export not built**)
- [x] `/themes` editor exports a .css file equivalent to existing `public/themes/<name>/theme.css` shape
- [x] Share URLs round-trip across browsers
- [ ] Live contrast validation runs on every color change (**not built**)
- [ ] Reset + diff controls work at row / group / global scope (**global reset only; diff is passive badge**)
- [x] No regression in existing localStorage persistence behavior

## Risks

- **CompressionStream support.** Only Safari ≥16.4, Firefox ≥113, Chrome ≥80. Fallback to uncompressed base64 if missing — verify URL stays under 2,000 chars (could fail for full-edit themes). Mitigation: detect, warn, gracefully degrade.
- **Validator browser port maintenance.** Two copies of the contrast logic = drift risk. Mitigation: extract shared module to `scripts/lib/contrast.mjs`, import from both Node script and browser code via package.json `exports`.
- **Performance on full-token override.** 127 tokens × repaint on every slider tick could jank. Mitigation: requestAnimationFrame the style injection, debounce validator at 50 ms.

## Related

- [project_theme_editor_state.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_theme_editor_state.md) — current state of the editor (memory snapshot)
- [EPIC-01-recipes-book.md](./EPIC-01-recipes-book.md) — recipes will reference the theme editor as the way to customize the recipe's appearance
