---
title: From 0.8 to 1.0
slug: from-0-8-to-1-0
category: engineering
tags: release, semver, versioning
audience: library authors, cia users
excerpt: We cut 1.0 on 2026-08-17 with 24 of 42 planned stories done and an entire epic unstarted. Here is the reasoning, and what actually changed.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
---

The v1.0.0 commit changed seven files. None of them were library code.

```
CHANGELOG.md    CONTRIBUTING.md    README.md    SECURITY.md
package.json    docs/faq    docs/install
```

That is the honest shape of this release. `253610a` bumped `package.json` from
`0.8.2` to `1.0.0`, repointed the CDN URLs from `@0.8` to `@1`, and rewrote a
support table. Zero SCSS touched. The interesting question is not "what did 1.0
add" — it is "why call it 1.0 at all."

## The version number was the last thing to change

The real break happened on 2026-05-21, in `2e8a3c6` — the v0.8 mixin-first
reframe. That commit is where cia stopped being a class library that also had
mixins and became a mixin library where the selector is your problem, not ours.

It was not gentle. Twelve mixin renames with no aliases and no deprecation
window:

```scss
// 0.7
@include m.bp(md) { … }
@include m.inset(3);

// 0.8 — hard cut, no alias shipped
@include cia.media(md) { … }
@include cia.pad(3);
```

The responsive `:` utilities (`.cia-sm:flex` and friends) were deleted outright —
85 lines. Theme selectors collapsed: `[data-theme="press-light"]` became
`[data-theme="press"]`, with both modes handled by `light-dark()` inside one
file. Utility classes went opt-in behind `@use … with ($utilities: true)`.

The payoff was measurable. `main.scss` compiled output went from 16.6 KB gzipped
to 8.2 KB — half the bytes, mostly by deleting things.

The cost was equally real: anyone on 0.7 had to do a find-and-replace across
their whole codebase with no compiler-assisted migration path. We wrote
`MIGRATION.md` instead of shipping aliases, on the theory that a deprecation
shim you never remove is worse than a rename you do once. That theory is only
cheap because of the next section.

## Nobody was using it

The package has never been published to npm. Not once, not as a prerelease.

This is the fact that makes the whole 1.0 decision legible. A SemVer promise
costs you exactly as much as the number of people it constrains. With zero
external consumers, the promise costs nothing today and buys the thing we
actually wanted: a fixed reference point so the docs, the MCP server, and the
CDN URLs stop describing a moving target.

It also means the `@1` CDN URLs in `/docs/install` currently 404. We shipped
them anyway, documented as such in the release commit, because the alternative
was leaving `@0.8` links that would be wrong the moment we do publish.

## Cutting at 24 of 42

The v1.0 epic backlog was locked 2026-05-23 with 42 stories across five epics.
The last audit before the release, 2026-07-16, put it at 24 shipped
(`roadmap/epics/v1-0/README.md`):

| Epic | Stories | State at cut |
|---|---|---|
| Recipes book | 13 | 7 — schema, catalog, dynamic route, MCP exposure; 2 of 5 planned recipes |
| Theme editor polish | 9 | 5 — share URL, name, `.css` download |
| Migration on-ramp | 6 | 6 — done |
| Playground | 7 | 0 — no `/playground` route exists |
| Bug fixes + MCP polish | 7 | 5 — MCP test suite not built |

An entire epic at zero. The playground — paste SCSS, see it render, share the
URL — is the single most useful thing we could build for someone evaluating cia,
and it is not in 1.0.

The trade-off, stated plainly: 1.0 here means "the API is stable," not "the
product is finished." Those are different claims and conflating them is how
version numbers become marketing. The mixin signatures, the 123-token contract,
and the theme architecture are what SemVer now protects. The website is not part
of the versioned surface — `VERSIONING.md` names exactly three: CSS class names,
the SCSS mixin API, and the token contract. The playground can ship in 1.1
without lying to anyone.

## What actually shipped in the 0.9/1.0 window

Between the 0.8 reframe and the version bump, roughly eighty commits:

**A zero-emit authoring barrel** (`e76dede`). The documented import for component
styles, `@use 'css-is-awesome' as cia`, resolved to the CSS-emitting bundle — no
mixin API, and it printed `:root`, which Next.js CSS Modules pure mode rejects.
The docs had been teaching an import that did not compile.

```scss
@use 'css-is-awesome/api' as cia;   // forwards everything, emits nothing
.card { @include cia.card-base($shadow: 2); }
```

That work also caught a latent bug: `spinner()` and `skeleton()` declared their
`@keyframes` at module top level, so CSS Modules renamed the keyframes but not
the reference. They now emit via `@at-root` inside the mixin, only when called.

**A migration CLI** — `cia migrate tailwind` and `cia migrate bootstrap`, four
PRs (#6, #7, #8), parsing a Tailwind config or Bootstrap `_variables.scss` into a
cia theme with a per-mapping confidence report. The only epic that finished.

**Print/PDF as pure CSS** (`47f1fc2`). Four mixins — `print`, `print-base`,
`print-hidden`, `print-only` — and three custom properties. No Puppeteer, no
server: the browser's Print → Save as PDF is the generator. Pulled forward from
v1.2 because it was small and the recipes book needed the win.

**MCP server to 30 tools.** Also, in `8b54516`, `SERVER_VERSION` stopped being a
hardcoded `'0.8.2'` literal.

## Version is derived, not typed

Two places reported the version. Both were string literals. Both had already
drifted — the homepage hero said `v0.8` while the package said `0.8.2`.

```ts
// src/app/page.tsx
import { version } from "../../package.json";
```

```js
// mcp/server.cjs
return require(path.join(PROJECT_ROOT, 'package.json')).version;
```

Both fixed on 2026-08-17, hours before the release. The verification note in the
release commit reads: hero renders "v1.0.0 · Mixin-first", MCP `serverInfo`
returns `{"name":"css-is-awesome","version":"1.0.0"}`. Nobody typed either one.

## The two weeks before the cut were mostly finding things that were wrong

Three worth naming, because they are the kind of bug that reports success.

**The a11y validator was blind** (`34edf0f`). cia fails builds on contrast
violations by default. But `scripts/theme-a11y.js` could not parse `light-dark()`
— so seven themes scored 0 of 17 contract pairs, 119 silent skips, while
printing a green check and exiting 0. The fail-by-default guarantee had not been
running on the flagship themes. Fixed with a paren-aware splitter; the audit now
evaluates both color schemes per pair and keeps the worse one. All seven came
back clean, and the actual defect it had been hiding — recipe chips at 1.49:1
against a 4.5:1 requirement — got fixed the same commit.

**The Playwright baselines were stale since 2026-05-03** (`652f6b2`). Confirmed
stale rather than a font artifact, because the images differed in *height*: the
`/docs` baseline was 2897px against 4308px actual. The job had been failing on
every PR since roughly May. Root cause was a missing `{platform}` key in
`snapshotPathTemplate`, so a linux CI runner and a win32 dev machine shared one
baseline set — only one of them could ever be green.

**The theme count was inconsistent** (`6646365`, `dcff8d8`) — different pages
said 8 and 9 with nothing explaining the gap. It turns out both are right.
`scss/themes/` holds **9** sources but they form **8 families**, because
`terminal` is authored as two single-mode files — `terminal` dark-only and
`terminal-light` light-only — while the other seven each carry both modes in
one file via `light-dark()`. Terminal is two brands, not two modes.

So the picker offers 8, `public/themes/` builds 21 files, and MCP `list_themes`
reports 9 because it counts sources. The docs now say **8 theme families** and
explain the exception rather than pretending one of the numbers is wrong. The
gallery page, separately, was missing `prism` entirely — it had been shipping
and validating clean while listed nowhere.

## Where 1.0 actually stands

Measured, gzipped:

| Bundle | Size |
|---|---|
| `dist/tokens.css` | 2.2 KB |
| `core.min.css` | 2.4 KB |
| `utilities.min.css` | 4.1 KB |
| `css-is-awesome.min.css` (full) | 7.3 KB |
| Per-theme file | 1.5–3.4 KB |
| JavaScript in the package | 0 KB |

Eight theme families across 21 files. A 123-token contract. A 49-glyph icon
core. Six components that need no JavaScript — accordion, modal, tooltip,
dropdown, tabs, copy button — built on `<details name>`, `<dialog>`, `popover`,
and `:has()`.

What 1.0 did not include: a playground, three of five planned recipes, an MCP
test suite, and a published npm package.

One of those closed quickly. `8aab2e7` shipped call-and-assert coverage for
both surfaces — 174 of 174 public mixins and functions, 30 of 30 MCP tools,
CI-gated at 98%. It found a real bug on its first proper run: `scss/_icons.scss`
referenced a `$icon-size` the theme barrel never re-exported, which broke
`svg()`, `svg-bg()`, `fa-icon()` and `fa-spin()` whenever they were called
without an explicit size. Compiled clean, reported success, and was wrong —
the same genre of failure as the a11y validator above.

The playground, the three recipes and the npm publish are still open. The number
on the box means one thing only — if a mixin signature changes, the first digit
changes with it.
