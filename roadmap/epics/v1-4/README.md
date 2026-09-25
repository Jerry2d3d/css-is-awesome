# v1.4 — Consumer feedback wave

**Target release:** rolling 1.x minors (this folder tracks a *wave*, not one npm version — see the version-number caveat in [`../README.md`](../README.md)). Already shipped from it: **1.16.1, 1.17.0, 1.18.0, 1.19.0** and `css-is-awesome-mcp` **1.3.0 / 1.4.0**.
**Theme:** The reserved "scoped from v1.1–v1.3 feedback" slot became real on 2026-09-18 when the first external consumer feedback arrived — Gremlin Forge (a project generator) via boiler-project-ai's handoff. Everything here exists because a consumer asked for it or was broken by us; that is the ship-then-see rule doing its job. Extended 2026-09-23 with EPIC-04, the devlog: the wave is now "everything that came after the launch" rather than strictly the consumer handoff.

> **Status: In progress — 4 of 5 epics complete (2026-09-24).** EPIC-02 (design-tokens on-ramp) and EPIC-03 (contract hygiene) shipped within two days of the handoff; EPIC-01 (page surfaces) shipped in **1.20.0** and EPIC-05 (deprecation auto-fix) in 1.21.0. **EPIC-04, the devlog, is the only one left.** The full request/answer trail is in [`../../handoffs/2026-09-18-gremlin-forge-boilerplate.md`](../../handoffs/2026-09-18-gremlin-forge-boilerplate.md).

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-page-surfaces.md) | **Page surfaces** (`hero` + `band`) | Two theme-owned page backgrounds — colour, gradient/image, ink, scrim — light/dark paired, applied by `cia.surface(hero\|band)` or `<body data-surface>`, editable in the theme editor, dogfooded on the site's home page. Contract 1.3, optional feature `page-surfaces`. **✅ Complete — 1.20.0.** | ~2-3 days | 8 | **Complete 2026-09-24** — contract 1.3, derived for all 24 themes (all pairs ≥ 10.35:1), opt-in enforced by a test, wave divider included.
| [02](./EPIC-02-design-tokens-on-ramp.md) | **Design tokens → validated theme** | `npx cia theme from-tokens` + MCP `theme_from_tokens` + in-process handler (DTCG / Tokens Studio / cia-flat → contract-complete, validated `theme.css`), then the mapping exposed as data (`cia theme map`, MCP `get_token_map`). **✅ Complete — 1.17.0 + 1.19.0.** | ~2 days | 6 |
| [03](./EPIC-03-contract-hygiene.md) | **Contract hygiene** | `--space-unit` relaxed from required to optional (contract 1.1), optional tokens reported as info, CI gate that fails a release when the contract lists change without the version bump VERSIONING.md demands, optional tokens grouped by feature (contract 1.2). **✅ Complete — 1.16.1 + 1.18.0.** | ~1 day | 5 |
| [04](./EPIC-04-devlog-and-now.md) | **The devlog** (`/now` + working notes) | A `/now` page generated at build time from the release history and this folder's own epic statuses, plus short dated working notes in the author's voice. Answers "what is happening", which neither the docs nor the blog do. Includes the first post for the empty `ai` track. **Planned** — five open questions in the epic file. | ~3-4 days | 9 |
| [05](./EPIC-05-deprecation-autofix.md) | **The deprecation auto-fix** | A deprecation becomes an offer, not a notice: the validator, `get_token` and `cia analyze` all name the replacement, and `npx cia fix-theme` / the MCP `fix_theme` tool rename it — property only, so the theme renders identically, and never writing unless you ask. CI guards the contract's `deprecated` map. **Complete 2026-09-24.** | ~1 day | 7 |

## Definition of done for v1.4

- [x] A consumer can turn a design-tokens file into a validated cia theme with one command and no repo checkout — verified from a clean `npm install css-is-awesome` project on 2026-09-19
- [x] Adding a required contract token without a contract MAJOR fails CI (`npm run check:contract`), proven with a negative test
- [x] Every optional token belongs to exactly one feature and the validator reports "missing the tokens for X"
- [x] Page surfaces: `hero` and `band` slots in the contract (1.3), the mixin + body attribute, the editor section, the home page dogfooding it, both audit pairs — shipped 1.20.0; opt-in now gated in CI by `npm run test:surfaces`
- [ ] The consumer (Gremlin Forge / boiler-project-ai) re-tested against the published numbers and pinned `^1.19.0`

## Sequencing

1. EPIC-03 first (2026-09-18) — a correctness fix for every consumer's theme validator, nothing else could ship on a broken contract.
2. EPIC-02 (2026-09-18/19) — the on-ramp Forge's theme step is sequenced on.
3. EPIC-01 (2026-09-24) — the first *new* capability of the wave; Jerry's four open answers came in and it shipped as 1.20.0.

## Related

- [`../../handoffs/`](../../handoffs/) — the consumer handoff log this wave answers
- [`../v1-3/EPIC-03-dtcg-migration.md`](../v1-3/EPIC-03-dtcg-migration.md) — superseded by EPIC-02 here
- [`../../../CONTRACT.md`](../../../CONTRACT.md) — the token contract EPIC-01 and EPIC-03 change
