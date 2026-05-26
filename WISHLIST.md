# What can we do? — cia wishlist

Open list of ideas that could make cia better. Not committed work — entries here are seeds. When an idea earns its weight, it becomes a real epic in [`roadmap/epics/`](./roadmap/epics/README.md) with acceptance criteria and a release target.

> **Anyone can suggest.** Open a PR adding to this file. Format: title, one-paragraph description, what makes it interesting, what would have to be true to ship it. Jerry curates; promoted items move to the epics folder.

---

## Seeded by Jerry — 2026-05-26

### 1. Figma → MCP → Code (designer-to-code loop)

A designer opens Figma. cia's Figma plugin reads the design + tokens. The data ships through cia's MCP server. An AI agent (Claude Code, Cursor, etc.) reads the MCP payload + cia recipes and produces working code in a target framework.

**Pick the target:** HTML. Reason — HTML is the least framework-locked output. A consumer can transform HTML → React / Vue / Svelte / Angular trivially; can't transform React back to anything else. HTML output also aligns with boilerplate-slim's HTML set.

**What makes it interesting:** the "designer-to-code" loop is design-tooling's holy grail. cia has the THREE pieces nobody else has assembled:
- Figma plugin (slated v1.3) for design ingestion
- MCP server for AI-agent surface
- Recipes book for the actual component patterns

If we wire these together, the loop becomes: **Figma design → tokens + structure → MCP context → AI generates HTML using cia recipes → consumer adapts to their framework.** Nobody else can ship this in 2026 — the pieces don't exist for them.

**What would have to be true to ship it:**
- Figma plugin reads design + variable references (v1.3 EPIC-01 progress)
- MCP server accepts a "design intent" payload (extension to current MCP API)
- Recipes have enough machine-readable structure that an AI can compose them per design intent
- HTML output template exists in boilerplate-slim (Wk 6 of pre-release sprint)

**Estimate:** ~6-8 weeks of focused work after the v1.0 sprint completes. Could be v1.4 or v1.5 territory.

---

### 2. HTML → PDF via @media print (standalone tool)

A small standalone tool that takes an HTML page and produces a clean printable PDF using cia's print styles. Built on the `@media print` recipe (v1.2 EPIC-04 planned) + a headless browser engine (Puppeteer or Playwright already in cia's dev deps).

**What makes it interesting:** real product space. Every business needs HTML → PDF eventually — invoices, reports, certificates, dashboards-as-PDF, contracts. Most existing tools (wkhtmltopdf, weasyprint, browserless) require manual styling work for each output. cia has a print recipe that lets the entire app reskin for paper with one `@use` line.

The tool would be: feed any HTML page → tool applies cia print recipe + tokens → outputs clean, paginated, branded PDF. Nobody else in the design-system space ships this in 2026.

**Stays disciplined:**
- cia core stays JS-free — the tool is a SEPARATE package (e.g. `@cia/pdf` or `jerry2d3d/cia-pdf`)
- Mirrors the two-product architecture: cia is the styling foundation; @cia/pdf is the consumer-facing tool
- Print recipe in cia core is the foundation; the tool wraps Puppeteer + applies the recipe

**What would have to be true to ship it:**
- Print recipe shipped in cia (planned v1.2 EPIC-04)
- Headless browser engine picked (Puppeteer is in dev deps; Playwright is in test deps)
- Tool API designed: `npx @cia/pdf <html-path> --out <pdf-path> --theme <name>`
- Print output verified across 3-5 real document types (invoice, report, certificate)

**Estimate:** Small version = ~1-2 weeks (basic tool + print recipe). Polished version with multi-theme + custom page sizes + headers/footers = ~3-4 weeks.

---

## How to add to this list

**For maintainers / Jerry:** add an entry under "Seeded by ..." with the format above. Honest about what would have to be true. Honest about effort.

**For the community (once cia is public):** open a PR. Brief description, the strategic interest, the prerequisites. Don't include implementation plans — those come when the item is promoted to an epic.

## How items leave this list

Three exit paths:
1. **Promoted to an epic** — moves to `roadmap/epics/v1-X/` with full acceptance criteria. Cross-link back to the wishlist entry.
2. **Rejected (with reason)** — moved to a `## Rejected` section at the bottom with one sentence of why. Preserves history.
3. **Shipped** — wishlist entry deleted; reference in `CHANGELOG.md` + the epic file remains.

Never silently drop items. The decision history is the value.
