# EPIC v1.4-07 — MCP answers are current and findable

**Status:** Planned — feature 1 ships in 1.23.0, feature 2 in the next `css-is-awesome-mcp` release
**Effort estimate:** ~1 working day
**Stories:** 4

## Mission

An agent that asks the MCP server about cia gets the cia that is on npm, and
finds a token by the word it would naturally search for.

## Why now

Gremlin Forge's combined handoff of 2026-11-23, asks 2 and 3, both checked
against the repo and npm the same day:

- `search_tokens("status")` returns `{ total: 0 }`. An agent styling a state
  looks it up by that word first, gets nothing, and guesses.
- `npx css-is-awesome-mcp` reported `cia 1.21.0` while npm `latest` was
  1.22.1. The standalone package (1.5.0) depends on `css-is-awesome ^1.11.1`
  and has no `fix_theme`, which the bundled server has. `README.md` says the
  package "is never out of sync". That sentence is false today.

## Out of scope

- New tokens. State words map onto the existing role tokens; there are no
  `--status-*` tokens (decided 2026-11-14).
- Any change to what the bundled server in this package already answers.

## Features and stories

### Feature 1 — State words find the role tokens (1.23.0)

- [ ] **US-V14.07.1.1** `search_tokens` matches an alias list — `status`,
  `state`, `success`, `warning`, `error`, `danger`, `info`, `neutral` — to the
  role tokens, in both servers. A nonsense query still returns `total: 0`. (S)
- [ ] **US-V14.07.1.2** MCP coverage asserts `search_tokens("status")` returns
  the role tokens and a nonsense query returns none. (S)

### Feature 2 — The standalone package stays in step (`css-is-awesome-mcp`)

- [ ] **US-V14.07.2.1** The standalone server carries every tool the bundled
  one has, `fix_theme` included, and a CI check fails when the two tool lists
  differ. (M)
- [ ] **US-V14.07.2.2** Its `css-is-awesome` floor moves with each cia release,
  and the README replaces "never out of sync" with how a caller gets the
  newest cia (`npx css-is-awesome-mcp@latest`, or a fresh cache) and that
  `status.cia` reports which one it has. (S)

## Definition of done

- [ ] `search_tokens("status")` returns the role tokens through both servers
- [ ] A fresh `npx css-is-awesome-mcp` reports `status.cia` equal to npm `latest`
- [ ] `fix_theme` is in the standalone package's tool list
- [ ] No sentence in the README claims more than the package does

## Risks

- **npx caching.** A caller with an old npx cache can still get an old cia.
  The fix is to say so plainly and let `status` expose it, not to promise
  otherwise.

## Related

- [`../../handoffs/2026-11-23-gremlin-forge-everything-open.md`](../../handoffs/2026-11-23-gremlin-forge-everything-open.md) — asks 2 and 3
- [`EPIC-06-flowchart.md`](./EPIC-06-flowchart.md) — feature 1 ships with it
- [`../v1-1/EPIC-07-mcp-zero-install.md`](../v1-1/EPIC-07-mcp-zero-install.md) — why the standalone package exists
