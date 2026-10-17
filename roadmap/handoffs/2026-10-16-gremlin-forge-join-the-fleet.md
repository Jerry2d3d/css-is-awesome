# 2026-10-16 — Gremlin Forge ("join the fleet")

**From:** Gremlin Forge, whose tool-onboarding wizard registers cia as a tool of kind `library` and then verifies the registration from the outside with a compliance check. The prompt was rendered from Forge's generic onboarding recipe plus a few cia-specific findings; it arrived in two versions (10-15 and 10-16), the second carrying a correction.
**Rounds:** two — the prompt, then the correction after cia's read-back.
**Epics:** none opened. The ask is a tool on the existing MCP server, not a feature; it is recorded here because the handoff log, not the roadmap, is where consumer asks live.

## Asked

1. **A `status` tool** on the MCP server: `{ version, counts, hash, store, takenAt }`, about forty tokens, so Forge's preflight stops deriving counts from a full `list_mixins`.
2. **The fleet envelope** on every list / search answer — `{ total, items, store }`, with `store` saying where the answer came from — never a bare array. (Optional for cia.)
3. **A `.env.example`** at the repo root declaring every environment variable the server reads, names only, so the compliance check can compare it against the source.
4. *(10-15 only, withdrawn 10-16)* Three "open" items from a 2026-09-19 tracking row: the whole-document `color.` prefix in `theme_from_tokens`, the missing `scripts/tokens-to-theme.cjs` export, and flat `component.*` aliases.
5. **Not asked of cia**, stated explicitly: no database slice, no flat-file sync, no agents, no character sheets or personas, no fleet writes. cia is kind `library`: Forge reads its contract and surface over MCP and nothing flows the other way.

## Answered

| Ask | What changed | Shipped in |
|---|---|---|
| 1 | `status` added to the bundled server (`mcp/server.cjs`, 35 tools) and to the `css-is-awesome-mcp` package. Returns `version` (the answering server), `cia` (the cia it reads — the two differ in the standalone package), `contractVersion`, `counts` for mixins / functions / tokens / themes / components / recipes / animations, a 16-hex `hash` over every public **name** (not body — a doc edit is not a surface change), `store: "disk"`, `takenAt`. The coverage suite calls it and asserts the shape; `/docs/mcp` documents it. | next release from `main` (unreleased at time of writing); `css-is-awesome-mcp` next minor |
| 2 | Already true for `{ total, items }` — all twelve list / search handlers returned that shape. `store: "disk"` added to each; it is a constant because this server reads the filesystem and nothing else. The coverage suite now fails a list envelope without it. | same |
| 3 | `.env.example` added. It declares nothing, because the server and the `cia` CLI read no environment variables; the file says so and says how to declare one if that ever changes. | same |
| 4 | **Nothing — already shipped.** All three landed in **1.19.1** (2026-09-19); Forge's own findings file has said so since 2026-09-23. Both calling forms re-verified on current `main` during the read-back; Forge withdrew the item and corrected its tracking row the same day. | 1.19.1 |
| 5 | Agreed, and nothing in this change touches the npm package contents, the website's positioning, the contract, or the "zero runtime JavaScript" rule. | — |

## Pins

Any `css-is-awesome` from the release that carries `status` onward; nothing older breaks, because every change is additive. Until then Forge's preflight keeps deriving counts and labelling them `derived`, which is the documented fallback.

## Heads-up

- The standalone `css-is-awesome-mcp` package lags the bundled server by one tool (`fix_theme`, 1.21.0). Its header no longer claims an exact tool count for that reason; porting `fix_theme` is a separate, small change.
- The compliance check probes the **dev checkout** (`K:/Repo/css-is-awesome/mcp/server.cjs`), not the npm package, so it can pass before a release — and will fail again if that checkout is on a branch without the tool.
