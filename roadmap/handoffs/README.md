# Consumer handoffs

Requests that arrive from projects **consuming** cia — a boilerplate, a generator, a design tool — and what cia answered, with the release numbers each answer shipped in. One file per handoff, dated. The epics that the work landed in are linked from each file; the reverse links live in the epic folders.

Why a separate log: the roadmap is what *we* planned; this is what *they* needed. When the two disagree, this folder wins the argument about what to build next (ship-then-see).

| Date | From | About | Outcome |
|---|---|---|---|
| [2026-09-18](./2026-09-18-gremlin-forge-boilerplate.md) | Gremlin Forge (via boiler-project-ai) | `--space-unit` contract break; design tokens → theme; optional tokens by feature; in-process MCP handlers; mapping as data | All shipped: 1.16.1 · 1.17.0 · 1.18.0 · 1.19.0 · mcp 1.3.0 / 1.4.0 → [v1-4](../epics/v1-4/README.md) |

## Adding one

1. Copy the dated file above as a template: **Asked** (verbatim, numbered) → **Answered** (one entry per ask, with what changed and the release it shipped in) → **Pins** (what version range the consumer should use and why) → **Heads-up** (what is coming that will touch them).
2. Add a row here and a dated audit note in [`../epics/README.md`](../epics/README.md).
3. If the answer needs new work, file it as an epic under the current feedback wave (v1.4 today) and link both ways.
