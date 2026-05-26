# What can we do? — cia wishlist

Open list of ideas that could make cia better. Not committed work — entries here are seeds. When an idea earns its weight, it becomes a real epic in [`roadmap/epics/`](./roadmap/epics/README.md) with acceptance criteria and a release target.

> **Anyone can suggest.** Open a PR adding to this file. Format: title, one-paragraph description, what makes it interesting, what would have to be true to ship it. Jerry curates; promoted items move to the epics folder.

> **The 60-day rule.** Wishlist entries either get promoted (to an epic) OR rejected (with one-sentence reason) within 60 days. Without this discipline, the wishlist becomes a graveyard of "wouldn't it be cool if..." that nobody acts on. Promote 1 item per quarter; reject everything stale.

> **The "ship-then-see" rule.** Everything we don't know about is **after the first release.** Wishlist entries get refined in light of real user signals from v1.0; don't promote on speculation alone.

---

## Active wishlist

### 1. Figma → MCP → Code (designer-to-code loop)

A designer opens Figma. cia's Figma plugin reads the design + Figma variables. The data ships through cia's MCP server. An AI agent reads the MCP payload + cia's three composition layers (tokens, mixins, recipes) and produces working code. The boilerplate-slim component library provides the framework-specific output.

**The architecture (Jerry's refinement, 2026-05-26):**

```
Figma design + variables
        │
        ▼
   cia.tokens (variables map 1:1 via DTCG)
        │
        ▼
   cia.mixins (parameter-power: AI tunes mixins to fit the design intent)
        │
        ▼
   cia.recipes (the assembly template — HTML structure + a11y checklist)
        │
        ▼
   boilerplate-slim components (framework-specific renderer — HTML / React / Angular)
        │
        ▼
   working code in target framework
```

**Pick the target:** HTML. Reason — HTML is the least framework-locked output. A consumer can transform HTML → React / Vue / Svelte / Angular trivially; can't transform React back to anything else. HTML output also aligns with boilerplate-slim's HTML set.

**What makes it interesting:** the "designer-to-code" loop is design-tooling's holy grail. Adobe XD, Visily, Builder.io, Anima, Plasmic have all attempted it. None have nailed it because none of them have **all four layers stacked**:
- Figma plugin for design + variable ingestion (slated v1.3 EPIC-01)
- MCP server for the AI surface (shipped v0.8.2)
- Recipe book for the structural template (v1.0 deliverable)
- boilerplate-slim for the framework-specific output (v1.0 alongside)

If we wire these together, the loop becomes uniquely cia's — nobody else has the pieces aligned.

**What would have to be true to ship it:**
- Figma plugin reads design + variable references end-to-end (v1.3 EPIC-01 must ship clean)
- MCP server accepts a "design intent" payload (extension to current MCP API)
- Recipes have rich machine-readable structure so an AI can compose them per design intent (recipe schema lint enforces this)
- HTML output template exists in boilerplate-slim and matches cia recipes 1:1
- Mixin parameter-power well-documented for the AI's tool surface

**Estimate:** Earliest v1.4. Realistically v1.5 or later — this is post-launch territory because the recipe book + boilerplate-slim need to be MATURE before AI can compose from them. Don't promote until v1.0 ships and there are 15+ recipes proven in the wild.

**60-day status:** Active. Revisit when v1.0 ships (target release decides the timeline).

---

## How to add to this list

**For maintainers / Jerry:** add an entry under "Active wishlist" with the format above. Honest about what would have to be true. Honest about effort.

**For the community (once cia is public):** open a PR. Brief description, the strategic interest, the prerequisites. Don't include implementation plans — those come when the item is promoted to an epic.

## How items leave this list

Three exit paths:
1. **Promoted to an epic** — moves to `roadmap/epics/v1-X/` with full acceptance criteria. Wishlist entry removed; promotion logged below.
2. **Rejected (with reason)** — moved to a `## Rejected` section at the bottom with one sentence of why. Preserves history.
3. **Shipped** — wishlist entry deleted; reference in `CHANGELOG.md` + the epic file remains.

Never silently drop items. The decision history is the value.

---

## Promotions log

| Date | Item | Promoted to | Why |
|---|---|---|---|
| 2026-05-26 | HTML → PDF via @media print | [v1.2 EPIC-04 Print Recipe (and the PDF answer)](./roadmap/epics/v1-2/EPIC-04-print-recipe.md) | Architecture clean (no Puppeteer needed — browser-native print is the PDF generator), scope bounded, real audience (every business needs HTML → PDF), aligns with the existing v1.2 print recipe slot. |

## Rejected

*(none yet)*
