# v1.3 — Ecosystem

**Target release:** v1.3.0 (~3-5 weeks after v1.2)
**Theme:** Ecosystem hooks. Figma plugin (token sync), theme marketplace (community submissions), DTCG/Style Dictionary migration CLI, and `@cia/angular` (second framework recipe pack).

> **Status: Not started (planned).** This is a post-v1.0 version (v1.0 shipped: tagged 2026-08-17, launched 2026-09-01). No story in any epic below has begun; everything here is future work. Note: the DTCG bridge EPIC-03 surfaces (`scripts/dtcg-to-scss.mjs`) already exists internally, but the public `npx cia migrate dtcg` CLI has not been built. `@cia/angular` (EPIC-04) is additionally GATED on v1.1 EPIC-04 codegen proving out.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-figma-plugin.md) | **Figma Plugin** | Two-way sync between Figma variables and cia tokens. Built on the existing DTCG bridge. Published to Figma Community. | ~2 weeks | 12 |
| [02](./EPIC-02-theme-marketplace.md) | **Theme Marketplace** | `/themes/community` gallery. Submission via GitHub PR (no backend in v1.3). Moderation tooling for the maintainer. | ~1 week | 8 |
| [03](./EPIC-03-dtcg-migration.md) | **DTCG / Style Dictionary CLI** | Surface the existing `scripts/dtcg-to-scss.mjs` as `npx cia migrate dtcg`. Docs page + integration test. | ~3 days | 4 |
| [04](./EPIC-04-framework-pack-angular.md) | **`@cia/angular` v0.1** | Apply codegen pattern from v1.1 EPIC-04 to Angular. First batch of generated components. | ~2 weeks | 10 |

**Total v1.3 effort:** ~28-35 working days. **Total stories:** 34.

## Definition of done for v1.3

- [ ] Figma plugin published to Figma Community
- [ ] `/themes/community` page lives + ≥3 community themes submitted
- [ ] `npx cia migrate dtcg <path>` works end-to-end
- [ ] `@cia/angular` v0.1 published with 3-5 generated components
- [ ] CHANGELOG.md v1.3.0 entry
- [ ] If v1.1 EPIC-04 codegen failed and was deferred, this epic ALSO deferred (Angular depends on the codegen pipeline)
