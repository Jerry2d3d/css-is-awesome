# EPIC v1.4-02 — Design tokens → validated theme (the on-ramp)

**Status:** ✅ Complete — shipped as css-is-awesome **1.17.0** (2026-09-18, the converter + CLI verb + MCP tool + in-process handler) and **1.19.0** (2026-09-19, the mapping exposed as data + boilerplate's canonical DTCG layout mapped completely); mirrored in css-is-awesome-mcp **1.3.0 / 1.4.0**. Supersedes [v1-3 EPIC-03](../v1-3/EPIC-03-dtcg-migration.md).
**Effort actual:** ~2 working days
**Stories:** 6

## Mission

A supported path from a design-tokens JSON — whatever a Figma plugin, ui-ux-builder or a prompt emits — to a **contract-complete, validated, contrast-audited** cia `theme.css`, reachable three ways: a CLI verb, an MCP tool, and an in-process handler an inventory builder can call without a transport.

## Why it happened

Gremlin Forge's theme step (2026-09-18 handoff, question 1) asked whether such a path existed. The honest answer was "partly": `scripts/dtcg-to-scss.mjs` lived in the repo only, resolved no aliases, needed Sass, and never ran the validator. The gap was two days of work and it is the piece their pipeline is sequenced on.

## What shipped

### 1.17.0 — the path

- `scripts/tokens-to-theme.cjs` (shipped in `files`, zero dependencies): `themeFromTokens({ tokens, name, format, base, dark, mode, validate })` → `{ css, report, validation }`.
- `npx cia theme from-tokens <tokens.json> --name <slug> [--format auto|dtcg|tokens-studio|cia-flat] [--base boilerplate] [--dark <dark.json>] [--mode light|dark] [--out theme.css] [--json] [--no-validate] [--allow-a11y-fail]`. Exit 0 valid · 1 contract/a11y fail · 2 input error.
- MCP `theme_from_tokens` (32 tools), implemented as `handlers.theme_from_tokens` so `require('css-is-awesome/mcp/server.cjs').handlers` (and the companion package) expose it in-process. **Writes nothing to disk** — validation runs on the returned text before the caller writes anything.
- `npm run test:tokens` (13 tests, 5 fixtures) wired into CI; `coverage:mcp` asserts the tool.

### The input contract (as implemented)

- **Formats** (`auto` default): `dtcg` — DTCG v2025.10, `$value`/`$type` leaves, `{alias}` resolved recursively (cycle/unresolved = loud error), composite colour / dimension / duration / shadow / fontFamily / cubicBezier values; `tokens-studio` — `value`/`type` leaves, single set or `$metadata.tokenSetOrder` multi-set; `cia-flat` — `{ "--token": value }`.
- **Modes**: top-level `light` / `dark` groups (DTCG) or paired `color-light` / `color-dark` groups (Tokens Studio), or a second `dark` file → `light-dark(light, dark)` per differing colour + `color-scheme: light dark`.
- **Path → token**: explicit table (Figma-style names, ~150 entries) → prefix rewrites (`colors.`→ dropped, `spacing.`→`space.`, `border-radius.`/`radii.`→`radius.`, `elevation.`→`shadow.`, `font.family.`/`fontFamilies.`→`font.`, `components.`→`component.`, …) → generic rule (join with `-`, prefix `--`, accept if in the contract; camelCase retry) → otherwise emitted verbatim and listed in `report.unmapped`, never dropped.
- **Minimum content: none.** Required tokens the file omits inherit from `--base` (default `boilerplate`; `--base list`); optional tokens are never inherited. Validate *coherence*, not presence: new backgrounds need matching text colours or the audit fails.
- **Type-scale caveat:** the contract carries `--font-size-base`, `--font-weight-medium`, `--line-height-normal` only; cia's type scale is a Sass map read by `cia.font(weight, step)`. Other sizes pass through as custom properties.
- **Boilerplate's canonical layout** (top-level light/dark, `color.<group>.<name>`, `radius.*`, `shadow.*`, `font.family.primary|secondary|mono`, `component.*`, `space.*`, `typography.size.base`) maps with zero `unmapped` entries — a test asserts it.

### 1.19.0 — the mapping as data

- `tokenMap()` → `{ generatorVersion, contractVersion, explicit, aliases, genericRule, targets: { required, optional } }`; `resolvePath(path)` → `{ token, mapped, via, status }`.
- `npx cia theme map [--json] [--path <token.path>]`; MCP `get_token_map({ path? })` (33 tools) adds `required`, `feature`, `category` from contract 1.2.
- Verified 2026-09-19 from a clean project with only `css-is-awesome` installed: `npx cia theme map --json` returns valid JSON; `--path` lookups resolve.
- Same release sharpened every "zero JavaScript" claim to **zero runtime JavaScript** — the tarball ships Node tooling that never reaches a page.

## Stories (all accepted)

- [x] US-V14.02.1 Converter module with alias resolution, composite values, base inheritance, light/dark pairing
- [x] US-V14.02.2 `cia theme from-tokens` verb with human + `--json` output and honest exit codes
- [x] US-V14.02.3 MCP tool + in-process handler, coverage-asserted, companion package ported
- [x] US-V14.02.4 Docs: `/docs/authoring/themes` "From design tokens", `/docs/mcp`, README, AGENTS, llm.txt, figma-tokens/README
- [x] US-V14.02.5 Mapping as data: `tokenMap()`, `cia theme map`, `get_token_map`
- [x] US-V14.02.6 Boilerplate layout mapped completely (font roles, `component.*`)

## Not done, on purpose

- No Style Dictionary transform and no `$extensions`-based modes — top-level groups are simpler and cover both known emitters.
- No type-scale tokens added to the contract; that is a design decision for a later contract minor, not a converter gap.

## Related

- [`../../handoffs/2026-09-18-gremlin-forge-boilerplate.md`](../../handoffs/2026-09-18-gremlin-forge-boilerplate.md)
- [`../v1-3/EPIC-03-dtcg-migration.md`](../v1-3/EPIC-03-dtcg-migration.md) — the superseded plan
- [`../../figma-pipeline.md`](../../figma-pipeline.md) — the Figma side that will feed this
