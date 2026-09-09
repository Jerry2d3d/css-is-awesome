---
title: Two new analyzer rules (and one we'd already shipped)
slug: two-new-analyzer-rules
category: engineering
tags: cli, developer-tools, accessibility, design-systems, design-tokens
audience: front-end developers, design system authors
excerpt: cia analyze grew a rule that suggests the nearest scale token for a hard-coded length, and a heuristic that flags interactive styling with no visible focus state. Writing the docs page for both turned up a third rule that had shipped months ago without anyone updating the roadmap to say so.
author: Jerry Hansen
publishDate: 2026-09-09
updatedDate: 2026-09-09
---

`cia analyze` already did the useful thing: read the real, installed API
surface — not a snapshot, not a guess — walk a project's stylesheets, and
grade the result. A health score, findings grouped by category, a suggested
fix on each one. That shipped as its own pass a few weeks back. This one adds
two more rules to the report, and accidentally corrects the roadmap in the
process.

## `off-scale-length`: the nearest-token hint

Every cia theme declares a spacing scale (`--space-0`…`--space-9`) and a
radius scale (`--radius-sm`…`--radius-full`). A consumer who writes
`border-radius: 7px` instead of `var(--radius-lg)` hasn't broken anything —
the page renders fine — but they've opted that one corner out of the theme.
Swap themes later and every other radius on the page moves except that one.

The new rule catches exactly that: a literal `border-radius` / `padding` /
`margin` / `gap` value close to a scale step gets flagged with the nearest
token as a suggestion.

```
⚠ border-radius: 7px
   → close to the reference scale's --radius-lg; consider the token instead
     of a literal (exact px varies by theme)
```

The interesting design problem wasn't the regex, it was the reference. What
counts as "close to `--radius-lg`" depends on *whose* `--radius-lg` you ask —
scale values are a per-theme decision, not a contract. Sketchbook's is 6px.
**Terminal's is `0` — deliberately, for every radius token, because Terminal
is styled to look like a flat-cut terminal window.** A rule that suggested
"this should equal 6px" would be actively wrong for a third of a Terminal
user's stylesheet.

So the rule doesn't claim equivalence. It uses Sketchbook — already
`CONTRACT.md`'s designated reference implementation, not a new concept — as a
*hint* table, and the suggestion text says so explicitly: "consider the token
... exact px varies by theme." And a literal `0` is never flagged at all,
because `0` is unambiguous and matches a real, intentional theme choice. A
scale-awareness rule that couldn't accommodate the one theme that ignores the
scale on purpose would be a rule worth deleting.

## `missing-focus-visible`: an info, not an error

The second rule looks for `:hover` / `:active` styling on something
button- or link-shaped with no `:focus-visible` or `focus-ring` anywhere in
the same file — a keyboard user gets mouse-only feedback, which is a real
a11y gap.

It's file-scoped on purpose, not selector-paired. cia's own button component
sets focus-ring once, in the base mixin, and then adds `&:hover` /
`&:active` per variant lower in the file:

```scss
// scss/components/_buttons.scss
@mixin btn-base {
  @include m.focus-ring;   // set once, for the whole component
  // ...
}
@mixin btn($variant) {
  &:hover  { background: m.color(interactive-hover); }
  &:active { background: m.color(interactive-active); }
}
```

A rule that required focus-ring to sit next to every single hover block
would flag this exact, correct, shipped pattern as broken. Checking "does
this *file* mention focus-visible or focus-ring at all" is coarser, but it's
coarse in the direction that doesn't lie to you.

It's also the reason the report gained a category it didn't have a home for
before. `Accessibility` now sits alongside API / Contract / Spacing / Color
/ Naming / Layout, and it's the only category so far where every rule ships
at `info` — a hint, never a gate. Regex-based selector heuristics are noisy
by nature; failing a build on one would train people to silence the tool
instead of trusting it.

## The rule we'd already shipped

Writing the new `/docs/analyzer` page meant listing every rule with its
level and category — which meant reading the actual source instead of the
epic's own plan, and finding `off-contract-token` sitting there already:
`var(--inkk)` correctly flagged as a likely typo of `--ink`, live in
`bin/analyze.cjs`, doing exactly what a not-yet-started roadmap item
described.

It shipped as groundwork for the graded report before this specific epic
file was even written, and nobody went back to flip the box. Which is the
same disease [the MCP server post](/blog/an-mcp-server-for-a-css-library)
described for a tool description that said "60+ mixins" when the real count
was 42: a hand-maintained number describing a moving system, quietly
drifting behind it. The difference this time is which direction it drifted —
the roadmap undersold something that already worked, instead of a doc
oversold something that didn't. Still worth catching. A plan that says
"planned" for shipped work sends someone to rebuild it.

## What it's for

Run it in CI (`cia analyze --strict` if you want warnings to fail the
build too) and both new rules do the same job the rest of the report does:
catch drift while it's a one-line diff, not after a theme swap makes it
someone's Monday. `off-scale-length` keeps a project's spacing honestly on
the grid it claims to use. `missing-focus-visible` catches the interactive
state most people only think about after a keyboard-only bug report.
Neither replaces a real accessibility audit or a design review — they're
both heuristics, and both say so — but a heuristic that runs on every commit
catches more than a review that runs once a quarter.

Full rule reference, including the six rules that already existed, is at
[`/docs/analyzer`](/docs/analyzer).
