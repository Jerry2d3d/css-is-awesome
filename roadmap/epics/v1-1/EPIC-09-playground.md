# EPIC 09 — Playground

**Status:** ⛔ NOT STARTED — 0 of 7 stories shipped
**Effort estimate:** ~4-6 working days
**Stories:** 7

> ## 📦 Moved here 2026-09-10 — was v1-0 EPIC-04
>
> This epic originated as [v1-0 EPIC-04](../v1-0/EPIC-04-playground.md), one of the 18 stories carried forward when v1.0.0 shipped (tagged 2026-08-17, launched 2026-09-01) without it, per the ship-then-see rule. It sat in "carried forward" limbo for over a week with no reprioritization. Moved into the active v1.1 "Recipes Momentum" backlog because that's what it actually is: 15 recipes now exist in the book (dialog, combobox, rtl-layout, the 5 form-validation recipes, app-shell, datepicker, data-table, and others), each one a candidate for the "Try in playground →" link this epic's own Mission section describes — the case for building it is stronger today than it was at launch, not weaker. Still **0 of 7 stories shipped**; nothing below was rewritten, only relocated and re-linked. The old path now redirects here (see the v1-0 file).
>
> **Distinct from [v2-0 EPIC-01 Recipes Maker](../v2-0/EPIC-01-recipes-maker.md).** They look similar (both are "build something with cia in the browser") but solve different problems and should stay separate epics:
>
> | | Playground (this epic) | Recipes Maker (v2.0) |
> |---|---|---|
> | Input | You type SCSS | You drag primitives onto a stage |
> | Output | Live-compiled preview of *your* code | A generated recipe `.md` file |
> | Audience | Someone who already knows cia mixins and wants to try/share an idea fast | Someone who doesn't want to write SCSS at all |
> | Analogy | play.tailwindcss.com | a low-code page builder |
> | Status | Fully scoped, 0/7, ready to build | Scoped, "may never ship," gated on the recipe format proving out over v1.0-v1.5 |
>
> Playground is small, code-first, and has no dependency on anything unbuilt — it's a good v1.1 fit. Recipes Maker is deliberately a major-version, "earn it with traction" bet per its own file. Keep them as two epics; don't merge them.

## Mission

A `/playground` page on the cia website where users paste SCSS using cia mixins, see the rendered preview live, and share their experiment via URL. Like Tailwind Play, but for cia mixin authoring.

## Why now

Tailwind Play is one of the most-used pages on tailwindcss.com — it's where people go to verify a class works, prototype a layout, or ask "how do I do X" with a shareable demo. cia today has no equivalent. Every recipe page should be able to link "Try in playground →" — and as of 2026-09-10 there are 15 real recipe pages that could use that link.

## Out of scope

- **VS Code extension** — slated for v1.5, see [post-v1-ideas.md](../v1-0/post-v1-ideas.md)
- **Recipes Maker** — the drag-and-drop visual recipe builder, a separate v2.0 epic (see comparison table above)
- Multi-file editing (single SCSS file only)
- Save to cloud / user accounts
- Embed playground in other docs sites
- Export as CodeSandbox / Stackblitz template

## Features

### F9.1 — In-browser SCSS compilation

**Goal:** Compile SCSS with cia mixins available, all in the browser. No server round-trip.

#### US-09.1.1 — Wire dart-sass in the browser

**As** the playground
**I want** to compile SCSS without a server, using cia's source available to `@use`
**So that** every code change can render instantly and the site stays static-deployable

**Acceptance criteria:**
- [ ] Use `sass` npm package (it ships browser-compatible builds since 1.50)
- [ ] Loaded as a dynamic import so it doesn't bloat the main bundle
- [ ] Falls back to a "loading compiler…" state on first visit
- [ ] Verified compile of `@use 'css-is-awesome' as cia; .btn { @include cia.btn(primary); }`

**Effort:** L (1-2 days)
**Depends on:** none

#### US-09.1.2 — Pre-load cia SCSS modules into the in-browser FS

**As** the playground compiler
**I want** to resolve `@use 'css-is-awesome'` against an in-memory file system populated with cia's actual SCSS source
**So that** `@use` paths work the same as in a real consumer build

**Acceptance criteria:**
- [ ] Fetch cia SCSS files at build time (Next.js static generation reads `scss/**/*.scss`)
- [ ] Bundle them as a JSON map: `{ "css-is-awesome": "...", "css-is-awesome/scss/mixins": "...", ... }`
- [ ] Configure dart-sass importer to resolve from this map
- [ ] All recipes that pass `@use 'css-is-awesome' as cia` work without changes

**Effort:** M (4-8 hrs)
**Depends on:** US-09.1.1

#### US-09.1.3 — Compile on input change (debounced) and render to iframe

**As** the playground user
**I want** the preview to update as I type (with sensible debounce)
**So that** I get fast feedback without thrashing

**Acceptance criteria:**
- [ ] Debounce: 200 ms after last keystroke
- [ ] Compile result injected into preview iframe via `<style>` tag
- [ ] Compile errors don't blank the preview — show last good output with error overlay
- [ ] iframe is sandboxed (`allow-scripts` only if needed; default sandboxed)

**Effort:** M (4-8 hrs)
**Depends on:** US-09.1.1, US-09.1.2

---

### F9.2 — Editor UI with theme picker

**Goal:** A respectable code editor experience (syntax highlight, line numbers, error display) plus a way to preview against any of the shipped cia themes.

#### US-09.2.1 — Monaco editor with SCSS syntax highlighting

**As** a playground user
**I want** the editor to look and feel like VS Code's SCSS editing
**So that** I don't feel like I'm typing into a text-area

**Acceptance criteria:**
- [ ] Monaco editor loaded as dynamic import
- [ ] SCSS language mode active
- [ ] Default content: a starter snippet (one button mixin) so the user lands on something runnable
- [ ] Editor takes ~60% of viewport width on desktop, full width with collapse on mobile

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-09.2.2 — Theme picker in playground

**As** a user testing a custom component
**I want** to switch the preview between all 24 cia themes without rewriting my SCSS
**So that** I can verify my component looks right across the system

**Acceptance criteria:**
- [ ] Theme picker dropdown above the preview iframe
- [ ] Switching the picker injects the chosen `theme.css` into the preview iframe
- [ ] Default = sketchbook (the brand voice)
- [ ] Picker remembers choice in localStorage

**Effort:** S (≤4 hrs)
**Depends on:** US-09.1.3

#### US-09.2.3 — Error pane shows Sass compile errors with line numbers

**As** a user making a mistake
**I want** the error message to point at the line in my SCSS
**So that** I can fix it without parsing a stack trace

**Acceptance criteria:**
- [ ] Compile errors displayed in a panel below the editor
- [ ] Error includes message, file, line, column
- [ ] Click on the error → Monaco jumps to that line
- [ ] No error → panel collapses

**Effort:** S (≤4 hrs)
**Depends on:** US-09.1.3

---

### F9.3 — Share via URL

**Goal:** A single URL captures the user's SCSS + chosen theme so they can paste it into Slack/email.

#### US-09.3.1 — Encode editor contents to URL hash + decode on load

**As** a playground user with a working demo
**I want** to copy the URL and have it open the same editor state for anyone
**So that** I can share via Slack, GitHub issues, or tweets

**Acceptance criteria:**
- [ ] Editor contents + chosen theme encoded to URL hash (`#code=<gzip+base64>&theme=<name>`)
- [ ] Hash updates as user types (debounced at 500 ms — slower than compile)
- [ ] Loading a hash URL hydrates editor + theme on mount
- [ ] "Copy share link" button in playground header
- [ ] Falls back gracefully if hash decode fails (load default state, toast warning)

**Effort:** M (4-8 hrs)
**Depends on:** US-09.2.2

## Definition of done

- [ ] All 7 stories accepted
- [ ] `/playground` page lives, linked from main nav + every recipe page
- [ ] In-browser SCSS compilation works against cia source
- [ ] Theme picker switches preview across all 24 shipped themes
- [ ] Errors display with clickable line jumps
- [ ] Share URLs round-trip across browsers
- [ ] Page passes Lighthouse perf budget (no jank on type, compile under 500 ms cold / 100 ms warm)
- [ ] Mobile layout usable (editor + preview stacked)

## Risks

- **dart-sass bundle size.** ~1 MB minified. Mitigation: dynamic import, lazy-load. First-visit cost is one-time; subsequent visits cached.
- **Monaco bundle size.** Adds another ~2 MB. Mitigation: dynamic import + only load on `/playground` route. Don't ship to other pages.
- **iframe security.** SCSS injection into iframe could be abused if URL hash is malicious. Mitigation: sandboxed iframe, no `allow-same-origin`, escape any user input in `<style>` injection.
- **Compile performance on slow devices.** SCSS compile of a non-trivial mixin call could spike. Mitigation: web worker for compile if this backlog ships fast enough to matter; otherwise document the limitation.
- **Static export.** Playground depends on client-side compile only — confirms Next.js static export still works.

## Related

- [v1-1/EPIC-01-additional-recipes.md](./EPIC-01-additional-recipes.md) and [v1-1/EPIC-08-additional-recipes-batch-2.md](./EPIC-08-additional-recipes-batch-2.md) — every recipe page should link to playground with its example pre-loaded
- [v1-0/EPIC-02-theme-editor-polish.md](../v1-0/EPIC-02-theme-editor-polish.md) — playground theme picker uses same theme switch mechanism
- [v1-0/post-v1-ideas.md](../v1-0/post-v1-ideas.md) — VS Code extension (the v1.5 alternative to playground) lives here
- [v2-0/EPIC-01-recipes-maker.md](../v2-0/EPIC-01-recipes-maker.md) — the visual builder; a different, later epic (see comparison table above)
