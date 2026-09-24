# 2026-09-18 → 19 — Gremlin Forge (via boiler-project-ai)

**From:** Gremlin Forge, a project generator whose "theme step" produces either a boilerplate registry entry (boilerplate lane) or a cia theme file (npm-package lane). Requests relayed through boiler-project-ai's handoff docs (`docs/handoffs/2026-09-18-css-is-awesome-space-unit-contract.md` in that repo).
**Rounds:** three (18th: the contract break + four questions; 19th: two asks on item 1 + a follow-up; later 19th: layout confirmation + two final asks).
**Epics:** [v1-4 EPIC-02](../epics/v1-4/EPIC-02-design-tokens-on-ramp.md), [v1-4 EPIC-03](../epics/v1-4/EPIC-03-contract-hygiene.md); heads-up for [v1-4 EPIC-01](../epics/v1-4/EPIC-01-page-surfaces.md).

## Asked

1. **Contract break.** 1.12.0 added `--space-unit` to the REQUIRED list in a MINOR, which VERSIONING.md forbids. Requested: move it to optional, bump the contract to 1.1, report optional tokens as info, add a CI check that fails a release when the required list grows without a contract bump. (The alternative offered was a proper 2.0.)
2. **Theme from design tokens.** Is there a supported path from a design-tokens JSON (DTCG or Tokens Studio) to a cia theme file that runs the validator and the contrast audit? Exact command/API, input shape, what it does not cover.
3. **Optional tokens.** A machine-readable way to know which optional tokens enable a feature, so Forge can warn "you are missing the tokens for X".
4. **In-process handlers.** Does `css-is-awesome-mcp` export `handlers` for direct `require`, like `mcp/server.cjs`?
5. **Versions.** Confirm 1.16.1 is on npm and that a consumer resolving 1.16.0 still gets the old required list.
6. *(round 2)* Put `theme_from_tokens` in `handlers`; state the exact `--format` inputs and the minimum a tokens file must contain.
7. *(follow-up)* Expose the DTCG-to-cia mapping table as **data**, and confirm the command accepts the groups ui-ux-builder emits (color, font family + type scale, spacing unit + scale, radius, shadow) with required vs optional groups spelled out.
8. *(round 3)* Confirm boilerplate's canonical DTCG layout is accepted (top-level `light`/`dark` as modes; `font.family.primary|secondary|mono`; `component.*`), and that `handlers.theme_from_tokens` writes nothing to disk.
9. *(round 3)* Publish the follow-up and send exact version numbers; confirm `npx cia theme map --json` works from a consumer project with only css-is-awesome installed.

## Answered

| Ask | What changed | Shipped in |
|---|---|---|
| 1 | `--space-unit` → optional; contract 1.1; validator reports optional tokens as info (`--show-optional`); `npm run check:contract` CI gate (proven to fail on unbumped changes); VERSIONING rows made explicit. Correction to their brief: the library's root defaults never emitted `--space-unit` — only the shipped theme files do — which is why our own validation never caught it. | **1.16.1** |
| 2 | `npx cia theme from-tokens` + MCP `theme_from_tokens` + `handlers.theme_from_tokens`; DTCG / Tokens Studio / cia-flat; base inheritance; light/dark pairing; validator + audit always run. Type-scale caveat: only `--font-size-base` / `--font-weight-medium` / `--line-height-normal` are contract tokens. | **1.17.0** |
| 3 | `features` map in the contract (10 features / 41 optional tokens); validator reports per feature; `get_token` returns `feature`; `check:contract` guards the map. | **1.18.0** (contract 1.2) |
| 4 | Yes — same `module.exports` shape as core; `main` declared so the bare `require('css-is-awesome-mcp')` works; `theme_from_tokens` ported. | **mcp 1.3.0** |
| 5 | Confirmed by unpacking both tarballs: 1.16.0 = contract 1, 128 required incl. `--space-unit`; 1.16.1 = contract 1.1, 127 + 41. | — |
| 6 | Done in 1.17.0 (handler) and answered in prose: formats, path rules, "minimum content: none — validate coherence, not presence". | **1.17.0** |
| 7 | `tokenMap()` / `resolvePath()` exported; `npx cia theme map [--json] [--path]`; MCP `get_token_map` (33 tools); all five groups accepted, type-scale caveat restated; nothing required. Same release: "zero JavaScript" claims sharpened to "zero runtime JavaScript". | **1.19.0**, **mcp 1.4.0** |
| 8 | Top-level modes: confirmed (tested). `font.family.*` and `component.*` were unmapped → aliases + table entries added so the canonical layout has zero `unmapped`; `themeFromTokens` writes nothing (only the CLI's `--out` writes). | **1.19.0** |
| 9 | Merged and published 2026-09-19; verified `npx cia theme map --json` from a fresh `npm install css-is-awesome` project. | **1.19.0**, **mcp 1.4.0** |

## Pins

- css-is-awesome: **`^1.19.0`** (1.16.0 still bundles the old required list; 1.17.0 lacks `font.family.*` / `component.*` mapping; 1.19.0 has everything above).
- css-is-awesome-mcp: **`^1.4.0`** (`get_token_map` guarded — throws a clear version message on an older core install).
- boiler-project-ai's `CIA_NPM_RANGE` should move to `^1.19.0` once its own smoke passes; not touched by cia.

## Heads-up

- **Page surfaces (contract 1.3, next):** optional feature `page-surfaces` — `hero` and `band` slots, each `--page-<slot>-bg / -image / -ink / -scrim`, light/dark paired; `cia.surface(hero|band)` mixin and `<body data-surface>`. Optional with fallback, so nothing they emit today breaks. Token names will be sent when it ships. Design: [v1-4 EPIC-01](../epics/v1-4/EPIC-01-page-surfaces.md).
- Write tokens on npm now expire in ≤ 90 days; cia intends to move all its packages to npm trusted publishing (no tokens) — no consumer impact.
