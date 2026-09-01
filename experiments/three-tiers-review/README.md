# Three-tiers review — outside-model gut check

## What this was

April 2026 sanity check on the three-tier authoring model right after
BEM was removed from every doc, example, and internal style file. Two
Gemini personas (20yr senior designer, 20yr senior front-end dev) were
handed the same context dump — Tier 1 drop-in CSS classes, Tier 2 SCSS
mixins under author-named classes, Tier 3 `bare-tags` recipe at
specificity `0,0,1` — and told to give real-talk feedback, no diplomatic
hedging.

The goal was external pressure-testing before the story got carved into
`THREE-TIERS.md` and the docs site.

## Files

| File | Purpose |
|---|---|
| `gemini-designer.txt` | Prompt framing the three tiers for a senior web designer persona. |
| `gemini-frontdev.txt` | Same three-tier prompt aimed at a senior front-end dev persona (jQuery → Next 15 arc). |

Only the prompts are committed — responses lived in chat and were
folded directly into the canonical docs.

## Outcome

The three-tier model survived intact and is now load-bearing:

- `THREE-TIERS.md` at the repo root documents the same Tier 1 / Tier 2 /
  Tier 3 split verbatim (plus a Tier 4 for React).
- `package.json` exports expose all three doors: `./min` and `./core`
  for Tier 1, `./scss/components/*` for Tier 2, `./scss/recipes/*` for
  the Tier 3 `bare-tags` recipe.
- `dist/` ships `css-is-awesome.min.css`, `*.core.css`, and
  `*.utilities.css` — the baked router output Tier 1 consumes.
- `btn(variant)` is still the single router mixin all tiers resolve to;
  BEM did not return.

---

_Archived — not load-bearing. Kept for provenance of the review that
green-lit the current `THREE-TIERS.md`._
