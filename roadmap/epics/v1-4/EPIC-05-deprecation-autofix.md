# EPIC v1.4-05 — The deprecation auto-fix

**Status:** ✅ Complete — 2026-09-24. Shipped as `npx cia fix-theme`, the MCP
tool `fix_theme` / `handlers.fix_theme`, a `deprecated-token` rule in
`cia analyze`, a deprecation line in the validator, and a CI guard on the
contract's `deprecated` map.
**Effort estimate:** ~1 working day
**Stories:** 7

## Mission

Turn a deprecation from a statement into an offer. When a theme uses a token
cia has superseded, the tooling should say what replaced it, show exactly what
would change, and rename it on request — without touching the file unless the
consumer says so.

## Why now

Page surfaces (v1.4 EPIC-01) created the project's first real deprecation:
`--background-hero` → `--page-hero-bg`. Until then the `deprecated` map in
`scripts/theme-contract.json` had no consumers at all — it was seeded and then
read by nothing. The lifecycle in [`VERSIONING.md`](../../../VERSIONING.md)
promises deprecate → warn → remove, and the *warn* half was missing.

Three reasons this is worth building rather than documenting:

1. **A rename is exactly what a machine should do.** The consumer's side of a
   deprecation is mechanical: find the token, look up the replacement, change
   the property, leave the value alone. Every part of that is error-prone by
   hand and exact by script.
2. **The map had no guard.** Nothing checked that a deprecated token still
   existed in the contract, or that its replacement was real. A typo there
   would have sent a consumer to a token that does not exist, and no test
   would have noticed.
3. **It generalises for free.** Every future deprecation gets the same
   treatment with no new code — a row in the map is all it takes.

## Out of scope

- Rewriting `.scss` **sources**. The fixer works on compiled theme CSS, which
  is the artifact the contract describes and the validator audits. A Sass
  source can compute a property name; a rename there is not a safe text edit.
- Changing values. Only the property name moves — see the risk table.
- Anything beyond the token contract. This is not a general CSS codemod.

## Features

### F5.1 — The contract is the single source of truth

#### US-V14.05.1.1 — Guard the `deprecated` map in CI

**As** the maintainer
**I want** the build to fail when a deprecation entry is malformed
**So that** the fixer can never offer a rename onto a token that does not exist

**Acceptance criteria:**
- [x] `scripts/check-contract-growth.mjs` validates every entry
- [x] A deprecated token must still be listed in the contract (it stays until a major)
- [x] Its `replacedBy` must be a real contract token
- [x] A replacement target may not itself be deprecated — that chain is a dead end
- [x] Each rule proven to fail on a deliberately broken map

### F5.2 — Everything reads the same map

#### US-V14.05.2.1 — The validator reports deprecations

**Acceptance criteria:**
- [x] Its own line, distinct from the optional-token info line
- [x] Names the old token, the replacement, when it was deprecated and when it goes
- [x] Says the existing value still works, and names the one command that moves it
- [x] Prints on **failing** themes too — a theme missing a required token must not have its deprecations hidden

#### US-V14.05.2.2 — MCP surfaces it

**Acceptance criteria:**
- [x] `get_token` returns `deprecated: { replacedBy, since, removeIn, note }`, `null` otherwise
- [x] `get_token_map` carries the whole map, so an agent translating a design file lands on the current name in one call
- [x] Both read the contract, never a second copy

#### US-V14.05.2.3 — `cia analyze` flags it

**Acceptance criteria:**
- [x] A `deprecated-token` rule, categorised under Contract
- [x] Catches a declaration **and** a `var()` reference
- [x] A longer token that merely starts with a deprecated name is not flagged
- [x] Points at `cia fix-theme`

### F5.3 — The fixer

#### US-V14.05.3.1 — Rename without writing

**As** a consumer on an old token
**I want** the corrected file handed to me rather than applied behind my back
**So that** I can read the diff before anything changes

**Acceptance criteria:**
- [x] `scripts/fix-theme.cjs`, shipped in the `files` manifest
- [x] `fixTheme({ css })` → `{ css, changes, unchanged, deprecatedFound }`
- [x] Never writes to disk — asserted in tests down to the input file's mtime
- [x] Only the property name changes; the value is never touched
- [x] Formatting, comments, ordering and `light-dark()` values survive byte-for-byte
- [x] A commented-out declaration is neither counted nor rewritten

#### US-V14.05.3.2 — Refuse rather than guess

**Acceptance criteria:**
- [x] A block already declaring the replacement is reported as a `conflict` and left alone
- [x] The same collision in a *different* block does not block the rewrite
- [x] A conflict sets a non-zero CLI exit code, so a pipeline stops instead of assuming the theme is current

#### US-V14.05.3.3 — The CLI

**Acceptance criteria:**
- [x] `npx cia fix-theme <file> [--write] [--json]`
- [x] Prints by default and changes nothing; `--write` applies
- [x] Listed in `cia --help` with an example
- [x] Exit codes: 0 done or nothing to do, 1 collisions need a human, 2 usage error

#### US-V14.05.3.4 — The MCP tool

**Acceptance criteria:**
- [x] `fix_theme({ css, apply? })`, reachable in-process as `handlers.fix_theme`
- [x] Returns `applied: false` always, so an agent cannot claim it saved a file
- [x] `requestedApply` echoes the caller's intent back without acting on it
- [x] A `summary` a human can read, and `knownDeprecations` for context
- [x] `coverage:mcp` asserts both the rewrite and the already-current shapes

## Definition of done

- [x] 34 MCP tools, coverage 100%
- [x] `npm run test:fix-theme` — 10 tests, CI-gated
- [x] Docs: CONTRACT.md, MIGRATION.md, `/docs/authoring/themes`, `/docs/mcp`, README, AGENTS, llm.txt
- [x] Every tool-count reference updated

## Risks

- **A rename that changes rendering.** Mitigated structurally: the fixer edits
  the property name only, never the value, and the byte-for-byte test would
  fail if anything else moved.
- **A tool that edits files as a side effect.** The reason `fix_theme` reports
  `applied: false` and the CLI needs `--write`: a tool that writes while
  answering a question is one nobody can safely put in a pipeline.
- **A silently wrong map.** Closed by the CI guard — all three failure modes
  are tested against a deliberately broken contract.
- **Scope creep into a CSS codemod.** Held at the contract boundary: this
  renames contract tokens and nothing else.

## Related

- [v1-4 EPIC-01](./EPIC-01-page-surfaces.md) — created the first deprecation
- [`VERSIONING.md`](../../../VERSIONING.md) — the deprecate → warn → remove lifecycle this implements
- [`CONTRACT.md`](../../../CONTRACT.md) — the `deprecated` map and what reads it
