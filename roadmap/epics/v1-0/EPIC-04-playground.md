# EPIC 04 — Playground

**Status:** ⛔ NOT STARTED — 0 of 7 stories shipped (audited 2026-07-16, main @ 97f6ae3)
**Effort estimate:** ~4-6 working days
**Stories:** 7

> ## ⛔ Status: NOT STARTED
>
> As of 2026-07-16 (main @ 97f6ae3) **no playground work exists**: there is no `/playground` route (no `src/app/**/playground/` directory), no in-browser Sass compiler wiring, no Monaco integration, and no playground share-URL code. This epic is entirely outstanding v1.0 scope. Every story below (US-04.1.1 through US-04.3.1) is unimplemented.
>
> This file is the authoritative spec for that remaining work — what the playground is, why it matters, and the acceptance criteria to build against.

## Mission

A `/playground` page on the cia website where users paste SCSS using cia mixins, see the rendered preview live, and share their experiment via URL. Like Tailwind Play, but for cia mixin authoring.

## Why now

Tailwind Play is one of the most-used pages on tailwindcss.com — it's where people go to verify a class works, prototype a layout, or ask "how do I do X" with a shareable demo. cia today has no equivalent. Every recipe page should be able to link "Try in playground →".

## Out of scope

- **VS Code extension** — slated for v1.5, see [post-v1-ideas.md](./post-v1-ideas.md)
- Multi-file editing (single SCSS file only in v1.0)
- Save to cloud / user accounts
- Embed playground in other docs sites
- Export as CodeSandbox / Stackblitz template

## Features

### F4.1 — In-browser SCSS compilation

**Goal:** Compile SCSS with cia mixins available, all in the browser. No server round-trip.

#### US-04.1.1 — Wire dart-sass in the browser

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

#### US-04.1.2 — Pre-load cia SCSS modules into the in-browser FS

**As** the playground compiler
**I want** to resolve `@use 'css-is-awesome'` against an in-memory file system populated with cia's actual SCSS source
**So that** `@use` paths work the same as in a real consumer build

**Acceptance criteria:**
- [ ] Fetch cia SCSS files at build time (Next.js static generation reads `scss/**/*.scss`)
- [ ] Bundle them as a JSON map: `{ "css-is-awesome": "...", "css-is-awesome/scss/mixins": "...", ... }`
- [ ] Configure dart-sass importer to resolve from this map
- [ ] All recipes that pass `@use 'css-is-awesome' as cia` work without changes

**Effort:** M (4-8 hrs)
**Depends on:** US-04.1.1

#### US-04.1.3 — Compile on input change (debounced) and render to iframe

**As** the playground user
**I want** the preview to update as I type (with sensible debounce)
**So that** I get fast feedback without thrashing

**Acceptance criteria:**
- [ ] Debounce: 200 ms after last keystroke
- [ ] Compile result injected into preview iframe via `<style>` tag
- [ ] Compile errors don't blank the preview — show last good output with error overlay
- [ ] iframe is sandboxed (`allow-scripts` only if needed; default sandboxed)

**Effort:** M (4-8 hrs)
**Depends on:** US-04.1.1, US-04.1.2

---

### F4.2 — Editor UI with theme picker

**Goal:** A respectable code editor experience (syntax highlight, line numbers, error display) plus a way to preview against any of the 9 cia themes.

#### US-04.2.1 — Monaco editor with SCSS syntax highlighting

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

#### US-04.2.2 — Theme picker in playground

**As** a user testing a custom component
**I want** to switch the preview between all 9 cia themes without rewriting my SCSS
**So that** I can verify my component looks right across the system

**Acceptance criteria:**
- [ ] Theme picker dropdown above the preview iframe
- [ ] Switching the picker injects the chosen `theme.css` into the preview iframe
- [ ] Default = sketchbook (the brand voice)
- [ ] Picker remembers choice in localStorage

**Effort:** S (≤4 hrs)
**Depends on:** US-04.1.3

#### US-04.2.3 — Error pane shows Sass compile errors with line numbers

**As** a user making a mistake
**I want** the error message to point at the line in my SCSS
**So that** I can fix it without parsing a stack trace

**Acceptance criteria:**
- [ ] Compile errors displayed in a panel below the editor
- [ ] Error includes message, file, line, column
- [ ] Click on the error → Monaco jumps to that line
- [ ] No error → panel collapses

**Effort:** S (≤4 hrs)
**Depends on:** US-04.1.3

---

### F4.3 — Share via URL

**Goal:** A single URL captures the user's SCSS + chosen theme so they can paste it into Slack/email.

#### US-04.3.1 — Encode editor contents to URL hash + decode on load

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
**Depends on:** US-04.2.2

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
- **Compile performance on slow devices.** SCSS compile of a non-trivial mixin call could spike. Mitigation: web worker for compile (deferred to v1.1 if v1.0 ships fast enough; document the limitation in v1.0 docs).
- **Static export.** Playground depends on client-side compile only — confirms Next.js static export still works.

## Related

- [EPIC-01-recipes-book.md](./EPIC-01-recipes-book.md) — each recipe page should link to playground with its example pre-loaded
- [EPIC-02-theme-editor-polish.md](./EPIC-02-theme-editor-polish.md) — playground theme picker uses same theme switch mechanism
- [post-v1-ideas.md](./post-v1-ideas.md) — VS Code extension (the v1.5 alternative to playground) lives here
