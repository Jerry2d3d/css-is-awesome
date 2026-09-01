# v2.0 — Visual Builder

**Target release:** v2.0.0 (~6-12 months after v1.5 — gives v1.x time to settle and validate before a major bump)
**Theme:** The Recipes Maker — Jerry's visual recipe builder. A major version because it changes the cia surface area significantly (a new product layer on top of the recipe book).

> **Status: Not started (planned).** This is a post-v1.0 version (v1.0 shipped: tagged 2026-08-17, launched 2026-09-01). No story in the epic below has begun; everything here is future work. Per the "ship-then-see" rule, v2.0 may never ship at all (see "Why might v2.0 NEVER ship" below).

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-recipes-maker.md) | **Recipes Maker** | Visual web tool where users drag cia primitives onto a stage, configure via mixin params, save the result as a portable recipe markdown file. | ~3-4 weeks | 18 |

**Total v2.0 effort:** ~15-20 working days. **Total stories:** 18.

## Definition of done for v2.0

- [ ] Recipes Maker lives at `/recipes/maker` on the cia website
- [ ] All 18 stories accepted
- [ ] At least 3 community-built recipes shipped via the Maker
- [ ] CHANGELOG.md v2.0.0 entry
- [ ] MIGRATION.md v1.x → v2.0 section written (changes are additive — no breaking changes expected)

## Why v2.0 (not v1.x)

Jerry's 2026-05-23 framing: Recipes Maker is a "second-order product." It only makes sense once:
- The recipe format is battle-tested (v1.0-v1.5 ships and stabilizes)
- There's user feedback on the recipe book to inform UX
- The community is actively writing recipes (so Maker has a clear audience)

A major version (v2.0) signals the product's scope expanded — cia is no longer just SCSS + tokens + themes + recipes, it's a system for AUTHORING those recipes visually. That's a story worth a major bump.

## Why might v2.0 NEVER ship

- If recipe authoring is fine without a visual builder (community writes them in markdown), Recipes Maker becomes superfluous
- If a better visual paradigm emerges (e.g., LLM-driven recipe generation in 2027), Maker may pivot or merge with it
- Jerry's call at v1.5 ship: revisit whether v2.0 is the right next step or whether to slot a different theme
