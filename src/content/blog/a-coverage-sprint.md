---
title: A coverage sprint
slug: a-coverage-sprint
category: engineering
tags: recipes, accessibility, forms, rtl, design-tokens, developer-tools
audience: front-end developers, design system authors
excerpt: Six epics landed in two days — RTL, form validation, an analyzer health report, token intelligence in the editor, and two more recipes. The interesting part isn't the count. It's the three real bugs each pass caught in something already shipped.
author: Jerry Hansen
publishDate: 2026-09-10
updatedDate: 2026-09-10
---

Most of this post is a list of what shipped, because six epics closed in two
days and a list is the honest way to say that. But the pattern worth keeping
is the same one from [the analyzer post](/blog/two-new-analyzer-rules) and
[the print post](/blog/print-is-a-theme): verifying a feature live, in a
browser, kept finding real bugs in things that were already done.

## RTL: the audit and what it found in the audit

`scripts/audit-logical-properties.mjs` scanned `scss/` for physical
properties — `margin-left`, `text-align: left`, that family — that don't flip
for a right-to-left layout. It found 18. Eight were straightforward logical
rewrites (`margin-left` → `margin-inline-start`). Two had no logical
equivalent at all — `background-position` and a `transform: translateX()` in
the switch component's knob — so those got an explicit `[dir="rtl"] &`
override instead, which is the honest fix, not a workaround. The remaining
nine live in `_utilities.scss`'s physical-direction utility classes
(`cia-ml-*`, `cia-text-left`, …), and those are staying physical on purpose —
Tailwind and Bootstrap both ship the same choice, because a consumer who
wants "always left, regardless of direction" is a real, valid use case. A
parallel logical set (`cia-ms-*`, `cia-text-start`, …) shipped alongside so
either intent is one class away.

`/docs/rtl` demos the fixed components in both directions live, `rtl-layout`
is a new recipe, and `tests/rtl.spec.ts` screenshots and axe-scans the whole
recipe catalog in RTL — the first test suite to ever load an actual
`/docs/recipes/*` page. That last detail is what caught the real bug: the
axe scan failed on two pages that have nothing to do with direction. The
shared markdown renderer (`src/lib/recipes.ts` / `src/lib/blog.ts`, the same
`marked` setup both recipes and this post render through) was emitting task-
list checkboxes with no accessible label and scrollable code blocks with no
way to reach them by keyboard. Fixed at the renderer, so every recipe and
every post gets both fixes at once — not just the ones the RTL sweep happened
to touch.

## Five form recipes, one static-export constraint

`html5`, `react-hook-form`, `zod`, `async` (debounced, `AbortController`-
cancellable), and `success-states` — each a real, typed-into interactive
demo, not a screenshot, at its own route. The HTML5 recipe leans on
`:user-invalid`/`:user-valid` and is genuinely zero-JS for the base case,
consistent with how cia frames newer CSS features elsewhere in the docs. The
async recipe is the one that needed a workaround worth naming: this site is
a static export (`output: "export"`, no server), so its "check if the
username is taken" endpoint is a client-side `setTimeout` against a small
hardcoded list rather than a real request. Same UX contract — debounce,
cancel-in-flight, loading/success/error — just no server behind it, and the
recipe says so rather than pretending otherwise.

New `forms` category in the recipe schema, `react-hook-form` added as a
docs-site-only `devDependency` (it never touches the shipped npm package —
the zero-JS promise is about what ships, not what builds the docs).

## The analyzer learned to grade itself, and to say so out loud

`cia analyze` already read a project's real, installed API surface and
scored it. This pass added a graded, categorized report on top of the raw
findings, plus two new rules: `off-scale-length` (a literal spacing or
radius value close to a scale step, suggested as a token — a hint, not an
equivalence claim, because scale values are a per-theme decision) and
`missing-focus-visible` (file-scoped: interactive hover/active styling with
no focus-visible anywhere in the same file). Both, and the reasoning behind
their scope, are written up in [their own
post](/blog/two-new-analyzer-rules). `/docs/analyzer` now documents all
eight rules the analyzer ships.

## The editor tells you where a token goes, and whether it's legible

Two additions to the theme editor's token rows. First, a "used by N ▸"
disclosure on every color/spacing/radius row, sourced from a new
`scripts/build-token-consumer-map.mjs` that derives, from `_mixins.scss`'s
own `@function` bodies, which mixins actually read each token — both
literal `var(--token)` uses and indirect ones through a wrapper function
like `m.color(ink)`. Second, a live WCAG contrast readout on color rows with
a one-click "nearest passing color" fix, computed by a TypeScript port of
the same contrast math the CI contrast audit already uses (a straight
cross-runtime import wasn't possible — `tsconfig.json` disallows importing
`.js` into `.ts` — so the port is verified byte-identical against the
original on real test cases, and the curated audit pairs live in one shared
JSON file both runtimes read).

The consumer map's CI drift guard is a hard fail. Its zero-consumer report —
"this token appears to have no readers" — is informational only, after
measuring an 85-of-123 false-positive rate against cia's own required
contract tokens, including `--ink` and `--paper`. A static scanner can't see
through a token that's only reached via a mixin's own default parameter, and
a check that's permanently red on the system's most load-bearing tokens
trains people to ignore it, not fix anything.

## Two recipes the original plan named and never built

v1.0's first recipes epic named five recipes: dialog, combobox, datepicker,
data-table, command-palette. Only the first two ever shipped. That gap sat
in the roadmap's own "why now" text for the next batch, uncorrected, until
this pass — which is a small version of the same drift the analyzer post
found in its own epic file.

Both are shipped now. `datepicker` is a trigger button plus a
`role="grid"` calendar popup built on native `Date` and `Intl.DateTimeFormat`
— no date library. `data-table` sorts by column through a real three-state
cycle (ascending → descending → back to original order, `aria-sort` kept in
sync) with a minimal inline pager. Both were sourced by surveying
`boiler-project-ai` — the sibling project that consumes cia — through its
own MCP server, which returns its full component catalog on request; its
existing `DataTable` and `DatePicker` implementations are what the recipes
are modeled on.

Verifying the data-table demo surfaced one more small bug in the same
family as the RTL one: its own code sample uses the `cia-sr-only` utility
class on the table caption, but this docs site only loads `theme.css`
(tokens), not the separate opt-in utilities bundle — so the class silently
did nothing and the caption rendered visibly. The live demo now pulls the
`sr-only` mixin directly through a CSS Module; the recipe's own sample is
untouched, because it's correct for any real consumer who does load
utilities. Worth knowing about for the next demo page that reaches for a
utility class on this particular site.

## What's left

`app-shell` — navbar, sidebar/control-panel, footer, composed entirely from
mixins that already existed (`navbar-base`, `sidebar`, `toolbar`, `stack`,
`cluster`), with a Settings modal cross-linked to the `dialog` recipe rather
than re-documented — also shipped in this window, bringing the recipe count
to 16. Five more recipes surveyed from Boiler the same way as the datepicker
and data-table — `admin-dashboard-layout`, `confirm-dialog`, `auth-flow`,
`multi-step-wizard`, `otp-input` — are scoped with real reference
implementations cited and waiting their turn.
