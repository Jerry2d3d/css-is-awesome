# EPIC v1.4-06 — Flowchart styling

**Status:** Planned — design approved by Jerry 2026-11-23; ships in 1.23.0
**Effort estimate:** ~3 working days
**Stories:** 9

## Mission

Style a flowchart from cia: boxes, lanes, short connectors and seven health
states that read without colour, plus the same states as a dot or pill
outside a chart. Mixins only; nothing emits until called.

## Why now

Asked by Gremlin Forge on 2026-11-14 and accepted the same day; re-asked in
the combined handoff of 2026-11-23 (ask 1). Two consumer charts wait on it.
`badge()` cannot stand in: it has no neutral role, so `off` and `not-built`
render unreadable.

## Out of scope

- **Edges across the whole graph.** The consumer draws them in SVG, reading
  the two new tokens for stroke width and dash.
- **A second state set** (run states: done · current · waiting · skipped ·
  failed). The state map is built so a second set can be added without
  renaming anything, but it is not in 1.23.0. It comes after the consumer
  says what look it needs.
- **Decision nodes, edge labels, a legend.** Same: follow-up, on request.
- **Forced-colors anywhere outside these mixins.** New ground for cia; it
  stays inside this epic.
- **Changes to `stepper`, `badge` or `alert`.**

## Design

### Mixins (new file `scss/components/_flowchart.scss`)

| Mixin | Styles |
|---|---|
| `flowchart($gap: 4, $switch: md)` | Frame: lanes left-to-right when wide, top-to-bottom below `$switch`, by container query (`m.container` / `m.cq`) |
| `flowchart-lane($gap: 3)` | A labelled band grouping boxes |
| `flowchart-node($size: md, $r: md)` | The box: label, second line, signal slot; hover, focus ring, selected, disabled; all seven states from `[data-state]` |
| `flowchart-state($state)` | One state applied directly, without the attribute |
| `flowchart-connector($shape: straight, $dashed: false, $arrow: false)` | `straight` or `elbow`, between neighbours only; logical properties, so arrows follow writing direction |
| `flowchart-status($state, $shape: dot)` | `dot` or `pill`, for lists and settings panels |

### States

| State | Colour role | Border (the non-colour signal) |
|---|---|---|
| `working` | success | solid |
| `degraded` | warning | double |
| `failed` | error | solid, double weight |
| `off` | neutral, muted surface | dashed |
| `not-built` | neutral, no fill | dotted |
| `checking` | info | solid; quiet pulse, none under `prefers-reduced-motion` |
| `unknown` | neutral | solid, thin |

Border style alone separates `failed`, `off` and `not-built`. `working`,
`checking` and `unknown` need the signal slot (icon or word) for a
non-colour difference; the recipe says it must be filled.

### Attributes

- Health state: `[data-state="…"]`. No ARIA state exists for it.
- Selected: `[aria-selected="true"]`.
- Disabled: `[aria-disabled="true"]`.
- `aria-current` is **reserved** for the run-state "current step"
  (`aria-current="step"`), so it is not used for selection. (Changed from the
  2026-11-14 draft, which allowed either attribute for selected.)

### Tokens (contract 1.3 → 1.4, new optional feature `flowchart`)

| Token | Default |
|---|---|
| `--flowchart-line-width` | `2px` |
| `--flowchart-dash` | `6px` |

Both optional with defaults. No theme changes, nothing required, no
`--status-*` tokens: states map onto the existing success / warning / error
/ info and neutral roles.

## Features and stories

### Feature 1 — The mixins

- [ ] **US-V14.06.1.1** `flowchart`, `flowchart-lane`, `flowchart-node` (L)
- [ ] **US-V14.06.1.2** The seven states, `flowchart-state` (M)
- [ ] **US-V14.06.1.3** `flowchart-connector`, both shapes, both directions (M)
- [ ] **US-V14.06.1.4** `flowchart-status`, dot and pill (S)
- [ ] **US-V14.06.1.5** Forced-colors rules for all of the above (S)

### Feature 2 — Contract

- [ ] **US-V14.06.2.1** Two optional tokens, feature `flowchart`, contract
  1.4; `check:contract` passes (S)

### Feature 3 — Proof and docs

- [ ] **US-V14.06.3.1** Recipe with a working example; `validate-recipes`
  passes (M)
- [ ] **US-V14.06.3.2** API and MCP coverage entries; `get_component` and
  `search_mixins("flowchart-status")` find it (S)
- [ ] **US-V14.06.3.3** Element-level screenshots: seven states × LTR/RTL ×
  both layouts (M)

## Definition of done

- [ ] The four shipped bundles are byte-identical to the previous release's
      (proves nothing existing moved)
- [ ] Every theme compiles and validates; `check:contract` passes at 1.4
- [ ] All CI gates green, including `check:rtl` and the new screenshots
- [ ] Each state is distinguishable in greyscale and in forced-colors mode
- [ ] Released as 1.23.0 containing only this epic (and v1.4-07 feature 1)
- [ ] `status` via MCP reports 1.23.0; `list_components` lists the group

## Risks

- **Visual suite blind spot.** A 1% full-page tolerance can't see dashed vs
  dotted, so the state screenshots are element-level.
- **RTL arrows.** `check:rtl` audits properties only; an arrow drawn with a
  transform can pass and still point the wrong way. Screenshots cover it.
- **Scope pull.** The second state set and decision nodes are requested
  already; they stay out of 1.23.0.

## Related

- [`../../handoffs/2026-11-23-gremlin-forge-everything-open.md`](../../handoffs/2026-11-23-gremlin-forge-everything-open.md) — ask 1
- [`EPIC-07-mcp-current-and-findable.md`](./EPIC-07-mcp-current-and-findable.md) — the state-word search ships with this
- [`EPIC-03-contract-hygiene.md`](./EPIC-03-contract-hygiene.md) — the optional-token rule
