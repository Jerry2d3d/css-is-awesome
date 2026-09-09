# EPIC v1.3-05 — AI-assisted token diff in the editor

> Added 2026-09-07 from the external review. The forward-looking idea: a prompt
> in the theme editor ("make this feel like a professional financial app —
> less rounded, tighter spacing, navy primary, AA") returns a **proposed token
> diff** you accept or reject — the AI constrained by our contract, never
> spraying arbitrary CSS. Deliberately last of the four review epics.

**Status:** Planned (v1.3) — **GATED** on [v1.2 EPIC-07](../v1-2/EPIC-07-token-intelligence-editor.md)
**Effort estimate:** ~3-5 working days (website path); the MCP-agent path is near-zero
**Stories:** 4

## Mission

Let a natural-language intent produce a **bounded token diff** — only
contract tokens change, every change previews live, nothing is applied without
an explicit accept. The value is precisely that the model is fenced by the
same contract the editor already enforces.

## Why now / why last

It's the highest-ceiling idea and the highest-risk one, and it only makes
sense **after** the token relationship map exists (so a proposed diff can show
what it will ripple into) and after MCP DX is smooth (the contract is what
fences the model). Sequencing: EPIC-07 (map) → this.

## The tension (READ — this touches architecture)

The docs site is a **static export** (`output: "export"`, no backend) and we
**ship no API key** ([[feedback_no_js_in_package]] is about the npm package,
but the same zero-secret discipline applies to the site). So "AI in the editor"
cannot mean "our server calls a model for the user."

## Decision — LOCKED 2026-09-07: Option A (MCP-agent path)

Jerry's call, and it's the same principle as the MCP packaging decision: don't
bolt an AI runtime onto the core product; let the capability live where the AI
already is — the user's own agent, reached through the cia MCP. ~90% of the
value for ~10% of the work, and it keeps every architectural promise (no key,
no backend, no site JS).

- **CHOSEN — Option A: MCP-agent path.** The capability effectively exists
  today: an agent with the cia MCP can read the contract + token map and
  propose a diff in the user's own editor/CLI. Ship as a **documented recipe +
  an `assemble_prompt` intent** ("propose a theme token diff for <goal>") — no
  website code, no keys, no backend. The separate MCP package
  ([v1.1 EPIC-07](../v1-1/EPIC-07-mcp-zero-install.md)) is the channel that
  fences the model to our contract.
- **STRETCH — Option B: bring-your-own-key box in the dock.** The editor takes
  the user's own provider key (kept in the browser, never sent to us) and calls
  the provider directly. Zero backend, honors static export. Only if real
  demand shows up for the in-editor button ([[project_ship_then_see_rule]]);
  cost is provider CORS caveats, key-handling UX, and a "my key doesn't work"
  support surface.
- **REJECTED — Option C: serverless with our key.** Breaks pure static export,
  adds a backend to maintain, our cost, an abuse surface. Do not build without
  a separately-approved decision.

## Out of scope

- Applying diffs without human accept. Always propose → preview → accept/reject.
- Any change to non-contract CSS. The model may only move contract tokens.

## Features

### F1 — Constrained proposal

- **US-V13.05.1.1** (M) — Define the proposal contract: input = intent text +
  current theme tokens + the contract; output = a **diff limited to contract
  token names** (reject/ignore anything off-contract). Acceptance: a proposal
  that names a non-contract token is refused, not applied.
- **US-V13.05.1.2** (M) — Every proposed diff runs the existing validators
  (`theme-validator`, `theme-a11y`) before it can be accepted; an AA-failing
  proposal is flagged, not silently applied. Acceptance: a proposal that drops
  contrast below AA shows the failure inline.

### F2 — The chosen delivery

- **US-V13.05.2.1** (M) — Implement Option A: a recipe + an `assemble_prompt`
  intent ("propose a theme token diff for <goal>") that hands the agent the
  current tokens, the contract, and the token map. Acceptance: from a plain
  intent in an MCP-connected agent, the user gets a previewable, contract-valid
  diff and can accept or reject it — no website code, no key, no backend.
  (BYOK dock UI is deferred to the Option-B stretch, not this story.)
- **US-V13.05.2.2** (S) — Docs: how it's fenced (contract + validators), the
  privacy story (BYOK keys never leave the browser; we store nothing), and the
  explicit "propose, never auto-apply" guarantee.

## What changes

- **Option A:** a new recipe + one `assemble_prompt` intent in the MCP; no
  website runtime change.
- **Option B:** new dock UI (prompt, diff review, accept/reject) + a
  client-side provider call guarded by BYOK; validators run in the browser.
- Either: the token map and validators are wired as the model's guardrails.

## What we may lose

- **Scope creep into an AI product.** This is the epic most able to balloon.
  Held small by: propose-only, contract-fenced, and shipping the agent path
  first.
- **Support surface (Option B).** "My key/model doesn't work" becomes our
  problem in users' eyes even though we hold no key. Mitigated by a blunt BYOK
  disclaimer and keeping A as the recommended path.
- **The static-export invariant** if anyone reaches for Option C. Guard it:
  no backend ships without an explicit, separately-approved decision.

## Risks

- Model output drift — proposals that look valid but violate intent. The
  validator gate (F1.2) is the backstop; nothing bypasses it.
- Browser provider access (Option B) depends on provider CORS policies that
  can change; treat B as stretch, not commitment.

## Definition of done

From a natural-language intent the user gets a **contract-limited, validator-
checked, preview-before-accept** token diff — delivered via the MCP-agent path
(and optionally a BYOK dock) — with no backend, no shipped key, and no
auto-apply. GATED: does not start until [v1.2 EPIC-07](../v1-2/EPIC-07-token-intelligence-editor.md)
ships the token map.

## Related

- [v1.2 EPIC-07 — token intelligence in the editor](../v1-2/EPIC-07-token-intelligence-editor.md) (prerequisite),
  [v1.1 EPIC-07 — MCP zero-install](../v1-1/EPIC-07-mcp-zero-install.md) (the contract-fencing channel),
  `scripts/theme-validator.js`, `scripts/theme-a11y.js`, `mcp/server.cjs`
  (`assemble_prompt`), [[project_ship_then_see_rule]], [[feedback_no_js_in_package]].
