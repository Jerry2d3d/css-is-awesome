# 2026-11-23 — Gremlin Forge ("everything open")

**From:** Gremlin Forge, relayed by Jerry. One prompt that folds in every earlier open prompt to cia (2026-09-18 through 2026-11-19) and replaces them.
**Rounds:** one. cia checked every claim against `origin/main` at `19c1bf1` (1.22.1) and npm; all were accurate. Jerry approved the answers.
**Epics:** [v1.4-06](../epics/v1-4/EPIC-06-flowchart.md) · [v1.4-07](../epics/v1-4/EPIC-07-mcp-current-and-findable.md) · [v1.4-08](../epics/v1-4/EPIC-08-rules-as-records.md)

## Asked

1. Flowchart styling, accepted 2026-11-14 for 1.23.0 but not yet on the roadmap.
2. `search_tokens("status")` (and `success`, `warning`, `error`) should find the role tokens a state maps onto.
3. `npx css-is-awesome-mcp` should answer about the current cia and carry `fix_theme`.
4. Every rule as a flat record (id, owner, tags, triggers, short, full, kind, loadsWith, checker, appliesTo, status), beside the documents.
5. `list_rules`, `search_rules`, `get_rule` on the MCP server.
6. A database copy of the rule records, or a no.
7. One team-lead agent that brings in specialists.
8. A team file and `get_team`.
9. Five checks for additions: exists already · fits the contract · proven · tests and a what-and-why · owner approves.
10. A request record: a flat inbox with states and a required reason for each decision.
11. One way in for requests: `submit_request`, `list_requests`, `get_request`.
12. The contributing guide changed to meet that gate.
13. A role for css-scss-master as gatekeeper or specialist.
14. A one-line report for the "rules that disagree" work.
15. Anything cia still needs from Forge.

## Answered

| Ask | Answer | Where |
|---|---|---|
| 1 | Accepted. Design approved by Jerry 2026-11-23. | [v1.4-06](../epics/v1-4/EPIC-06-flowchart.md), 1.23.0 |
| 2 | Accepted. | [v1.4-07](../epics/v1-4/EPIC-07-mcp-current-and-findable.md) feature 1, 1.23.0 |
| 3 | Accepted. A real bug: the README said the standalone package is "never out of sync", and it was not. | [v1.4-07](../epics/v1-4/EPIC-07-mcp-current-and-findable.md) feature 2, next `css-is-awesome-mcp` |
| 4 | Accepted with a change: records are **generated from** the documents, not kept beside them, so no rule is written twice. | [v1.4-08](../epics/v1-4/EPIC-08-rules-as-records.md) feature 1 |
| 5 | Accepted, read-only. | [v1.4-08](../epics/v1-4/EPIC-08-rules-as-records.md) feature 2 |
| 6 | Declined. A library with no database; read the records through ask 5. | — |
| 7–8 | Declined. No agent team inside a styling library. | — |
| 9 | Covered by the existing flow. "Proven" means a named story in a real project needs it, or two projects asked. The what-and-why is the commit message, which writes the changelog; tests are the CI gates. The owner's approval is Jerry merging the pull request and approving the release gates; there is no second approval. | — |
| 10–11 | Declined as asked. Requests arrive as GitHub issues using a request template; the thread holds the decision and its reason. The MCP server stays read-only, so there is no `submit_request`. This log keeps recording accepted asks. | — |
| 12 | Declined. The open welcome to outside contributors stays. | — |
| 13 | Declined as framed: there is no in-library gate to hand over. | — |
| 14 | Done in 1.22.1: one wording per rule in `AGENTS.md`; `CONTRIBUTING.md` and the React sections of `css-is-awesome.instructions.md` marked as this repo's only; one hard-rule list in `llm.txt`, which the MCP `overview` prompt reads. | 1.22.1 |
| 15 | Nothing waiting. Page surfaces shipped in 1.20.0 and the devlog in 1.22.0. | — |

## Pins

None change today. Floor at `^1.23.0` once the flowchart mixins are used.

## Heads-up

- Contract goes 1.3 → 1.4 in 1.23.0, with two optional tokens (`--flowchart-line-width`, `--flowchart-dash`). No existing theme needs editing.
- Flowchart selection is styled off `aria-selected`, not `aria-current`; `aria-current="step"` is kept for a future run-state set.
