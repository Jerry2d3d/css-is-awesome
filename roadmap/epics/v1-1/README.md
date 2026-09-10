# v1.1 — Recipes Momentum

**Target release:** originally v1.1.0 — but that npm version number has been consumed: semantic-release published `css-is-awesome@1.1.0` on 2026-09-01 carrying the launch-wave work (theme rework, a11y fixes, linux baselines), not this backlog. This backlog ships under whatever later versions semantic-release derives from its commits.
**Theme:** Capitalize on v1.0 recipes momentum. Expand the recipe catalog, ship the install wizard, scaffold the `@cia/a11y-recipes` add-on, and prove the recipes → framework-pack codegen pattern with `@cia/react` v0.1.

> **Status: In progress.** v1.0 has shipped (v1.0.0 tagged 2026-08-17; launched 2026-09-01 with the first npm publish, public repo, and live docs site). Of the epics below, **EPIC-08 is complete** (all 7 batch-2 recipes shipped 2026-09-10: `datepicker`, `data-table`, `confirm-dialog`, `admin-dashboard-layout`, `auth-flow`, `otp-input`, `multi-step-wizard` — 21 recipes now in the book total); **EPIC-09 (Playground)** was moved in from v1-0 EPIC-04 the same day, still 0/7; every other epic (01-07) remains unstarted. The density knob (EPIC-05) was queued into this version on 2026-08-29 (f9822be) and is likewise unstarted. The remaining v1-0 carried-forward stories (see [v1-0/README.md](../v1-0/README.md)) compete with this backlog for priority once real user signal arrives.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-additional-recipes.md) | **Additional Recipes (batch 1)** | 7 more recipes: combobox-multiselect, breadcrumb, pagination, file-upload, toast, sortable list, color-picker. | ~10-14 days | 14 |
| [02](./EPIC-02-install-wizard.md) | **`npm create cia` wizard** | Guided install: framework? theme? a11y add-on? Wires SCSS entry + theme attr in one command. | ~3-5 days | 7 |
| [03](./EPIC-03-cia-a11y-recipes.md) | **`@cia/a11y-recipes` add-on** | Separate npm package: WCAG-strict variants of the v1.0 recipes (combobox with announcements, datepicker with screen-reader month nav, command-palette with focus trap). Recipes-first; tiny JS shims only where unavoidable. | ~5-7 days | 10 |
| [04](./EPIC-04-framework-pack-react.md) | **`@cia/react` v0.1 (POC)** | Prove the codegen pipeline: parse recipes → emit React components. First batch of generated components. Sync mechanism for recipe updates. | ~2 weeks | 12 |
| [06](./EPIC-06-blog.md) | **The blog: two tracks** | Engineering-the-system posts + NEW CSS-discoveries track; index split, feed.xml, 3 seed posts | S | 5 |
| [05](./EPIC-05-density-knob.md) | **The density knob (`--space-unit`)** | One variable rescales the whole spacing system. `--space-0..9` become `calc()` over a master unit; set it once and the UI tightens or opens up. Density changes a page's character more than colour does. | ~1-2 days | 4 |
| [07](./EPIC-07-mcp-zero-install.md) | **MCP that just works** | `npx css-is-awesome-mcp` with no manual `sdk`+`zod` install — bundle into the server artifact or ship an add-on package, without adding JS deps to the core package. From the 2026-09-07 external review; pull-forward DX. | ~1-2 days | 4 |
| [08](./EPIC-08-additional-recipes-batch-2.md) | **Additional Recipes (batch 2, from Boiler)** | 7 more recipes, each backed by a real reference implementation surveyed from `boiler-project-ai` via its own MCP server: datepicker, data-table (both close the original, never-built v1.0-queued gap), admin-dashboard-layout, confirm-dialog, auth-flow, multi-step-wizard, otp-input. **Complete 2026-09-10** — all 7 shipped, all verified live. | ~9-13 days | 14 |
| [09](./EPIC-09-playground.md) | **Playground** | `/playground` page — paste SCSS using cia mixins, live-compiled preview, share via URL. Moved here 2026-09-10 from v1-0 EPIC-04, where it had sat unprioritized since the 2026-09-01 launch. Distinct from v2.0's Recipes Maker (code-first vs. drag-and-drop — see the epic file for the comparison). | ~4-6 days | 7 |

**Total v1.1 effort:** ~40-58 working days. **Total stories:** 72.

## Definition of done for v1.1

- [ ] 28 recipes total in the recipe book (21 shipped as of 2026-09-10, including all 7 of batch 2 — EPIC-08 above is now Complete — + batch 1's still-unstarted 7 to reach 28. This line previously said "12 total (5 from v1.0 + 7 new)," which was stale: only `dialog` and `combobox` ever shipped in v1.0; everything else shipped across later, unplanned-against-this-backlog work — see `roadmap/epics/README.md`'s audit notes for the real history)
- [ ] `npm create cia@latest` ships and works on Mac/Linux/Windows
- [ ] `@cia/a11y-recipes` npm package published
- [ ] `@cia/react` v0.1 published with 3-5 generated components
- [ ] CHANGELOG.md entry for this backlog's release (note: CHANGELOG already has a `1.1.0` entry dated 2026-09-01 — that's the launch wave, not this backlog)
- [ ] No regression in v1.0 epic DoDs
