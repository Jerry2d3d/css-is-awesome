# v1.3 — Ecosystem

**Target release:** v1.3.0 (~3-5 weeks after v1.2)
**Theme:** Ecosystem hooks. Figma plugin (token sync), theme marketplace (community submissions), DTCG/Style Dictionary migration CLI, and `@cia/angular` (second framework recipe pack).

> **Status: Not started in this repo (planned).** This is a post-v1.0 version (v1.0 shipped: tagged 2026-08-17, launched 2026-09-01). No story tracked *in this folder* has begun. One exception worth flagging: EPIC-01's actual substance (the Figma token bridge) is in active development, just not here — see EPIC-01's own status banner and [`roadmap/figma-pipeline.md`](../../figma-pipeline.md). Note: the DTCG bridge EPIC-03 surfaces (`scripts/dtcg-to-scss.mjs`) already exists internally, but the public `npx cia migrate dtcg` CLI has not been built. `@cia/angular` (EPIC-04) is additionally GATED on v1.1 EPIC-04 codegen proving out.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-figma-plugin.md) | **Figma Plugin** ⚠️ _superseded, token bridge now external_ | Original scope superseded by [`roadmap/figma-pipeline.md`](../../figma-pipeline.md) (2026-09-05). Its Phase F1 (token bridge) is now being built **outside this repo**, at sibling project `K:/Repo/figma-import-export` (an MCP server, not a Figma-side plugin) — in progress as of 2026-09-10. The in-Figma plugin UI + Community publish (Phase F2) remains future, unstarted work. | ~2 weeks | 12 |
| [02](./EPIC-02-theme-marketplace.md) | **Theme Marketplace** | `/themes/community` gallery. Submission via GitHub PR (no backend in v1.3). Moderation tooling for the maintainer. | ~1 week | 8 |
| [03](./EPIC-03-dtcg-migration.md) | **DTCG / Style Dictionary CLI** | Surface the existing `scripts/dtcg-to-scss.mjs` as `npx cia migrate dtcg`. Docs page + integration test. | ~3 days | 4 |
| [04](./EPIC-04-framework-pack-angular.md) | **`@cia/angular` v0.1** | Apply codegen pattern from v1.1 EPIC-04 to Angular. First batch of generated components. | ~2 weeks | 10 |
| [05](./EPIC-05-ai-token-diff.md) | **AI-assisted token diff** | Prompt → a contract-limited, validator-checked, preview-before-accept token diff. No backend, no shipped key (MCP-agent path; optional BYOK dock). GATED on v1.2 EPIC-07. From the 2026-09-07 external review. | ~3-5 days | 4 |

**Total v1.3 effort:** ~31-40 working days. **Total stories:** 38.

## Definition of done for v1.3

- [ ] Figma plugin published to Figma Community
- [ ] `/themes/community` page lives + ≥3 community themes submitted
- [ ] `npx cia migrate dtcg <path>` works end-to-end
- [ ] `@cia/angular` v0.1 published with 3-5 generated components
- [ ] CHANGELOG.md v1.3.0 entry
- [ ] If v1.1 EPIC-04 codegen failed and was deferred, this epic ALSO deferred (Angular depends on the codegen pipeline)
