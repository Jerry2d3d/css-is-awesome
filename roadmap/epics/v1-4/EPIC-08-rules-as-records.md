# EPIC v1.4-08 — Rules as records, generated from the documents

**Status:** Planned
**Effort estimate:** ~3 working days
**Stories:** 6

## Mission

Let an agent load only the cia rules its work needs, one record per rule,
without creating a second copy of any rule that someone has to keep in step.

## Why now

Gremlin Forge's combined handoff of 2026-11-23, asks 4 and 5. Forge wants one
record per rule (id, owner, tags, triggers, short, full, kind, loadsWith,
checker, appliesTo, status) and three read tools on the MCP server.

**The changed part.** Forge asked for records kept *beside* the documents.
1.22.1 (`91ecb5f`, `b2b6a63`) just removed the drift that hand-kept copies
caused: four documents answered the same rules differently, and the MCP
`overview` prompt printed two hard-rule lists that disagreed. So the records
are **generated from** the documents. The documents stay the only place a rule
is written or edited.

## Out of scope

- A database copy of the rules (ask 6, declined: cia is a library with no
  database; callers read the records through feature 2).
- A rule that exists only as a record.
- Shortening or deleting anything in the documents.

## Features and stories

### Feature 1 — Records built from the documents

- [ ] **US-V14.08.1.1** Mark each rule in `AGENTS.md`, `llm.txt` and
  `css-is-awesome.instructions.md` with a stable id and its record fields, in a
  form that reads naturally as prose. (L)
- [ ] **US-V14.08.1.2** A build script writes the records from those marks;
  `CONTRACT.md` stays data and is not turned into rules. (M)
- [ ] **US-V14.08.1.3** A CI check fails when the records are out of date with
  the documents, or when two records share an id. (S)

### Feature 2 — Read tools on the MCP server

- [ ] **US-V14.08.2.1** `list_rules({ kind, tags, loadsWith })` returning short
  forms, and `get_rule({ id })` returning the full record. (M)
- [ ] **US-V14.08.2.2** `search_rules({ query })` matching triggers, then tags,
  then text, with an honest `total: 0`. All three return
  `{ total, items, store }`; the existing `read_*` tools stay. (M)
- [ ] **US-V14.08.2.3** MCP coverage for all three, including the no-match
  case; the standalone package gets the same tools (see v1.4-07). (S)

## Definition of done

- [ ] Every rule in the three documents has exactly one record, and editing the
      document is the only way to change one
- [ ] The CI check fails on a stale record, proven with a negative test
- [ ] The three tools answer through both servers
- [ ] Nothing in the npm package loads at runtime (records are data)

## Open question (decide when the epic starts)

Whether the generated records ship in the npm package (allowed: they are data)
or reach callers only through the MCP server.

## Risks

- **Marking prose without spoiling it.** If the marks make the documents hard
  to read for people, the design is wrong; the documents are for people first.

## Related

- [`../../handoffs/2026-11-23-gremlin-forge-everything-open.md`](../../handoffs/2026-11-23-gremlin-forge-everything-open.md) — asks 4, 5 and 6
- [`EPIC-07-mcp-current-and-findable.md`](./EPIC-07-mcp-current-and-findable.md) — keeps the standalone server in step
