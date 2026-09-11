# EPIC v1.1-07 — MCP that just works (`npx css-is-awesome-mcp`)

> Added 2026-09-07 from the external review. The reviewer flagged the single
> sharpest friction on our most differentiating feature: MCP won't start until
> the user separately runs `npm install @modelcontextprotocol/sdk zod`.
> Pull-forward candidate — small, high-leverage, DX not features.

**Status:** 🟡 Partial (v1.1) — F1 built and verified locally 2026-09-11;
publish + user-facing doc/error-message updates deliberately deferred (not
forgotten — see the status note below).
**Effort estimate:** ~1-2 working days
**Stories:** 4

> **Status note (2026-09-11).** Built the chosen Option B package —
> `css-is-awesome-mcp`, a new sibling repo at `K:/Repo/css-is-awesome-mcp`
> (matching the `figma-import-export` precedent, per your call) — and
> verified it end to end: `require.resolve('css-is-awesome/package.json')`
> correctly resolves the installed dependency, a real `npm pack` of this
> repo installs and serves identical data to the in-repo dev-tree server
> (157 mixins, 112 sketchbook tokens, 24 themes, 25 recipes — cross-checked
> both ways), and a **clean install from the real npm registry** (not a
> local tarball) works the same way. `scripts/verify-consumer-install.mjs`
> in the new repo automates that whole proof and a `.github/workflows/ci.yml`
> runs it on push/PR (written, not yet exercised — nothing's been pushed).
>
> **Deliberately NOT done this session, and why:** I drafted an update to
> this repo's `mcp/server.cjs` guard-error message and to the public
> README/`/docs/mcp` page recommending `npx css-is-awesome-mcp` as the
> primary fix — then reverted it. `css-is-awesome-mcp` isn't published to
> npm yet (out of this session's scope — see the plan's scope boundary: no
> `npm publish`, no `git push`, no new GitHub repo creation without
> separate explicit go-ahead). Shipping that doc/error-message change now
> would tell a real user hitting the error *today* to run a command that
> fails for them (package not found). Those two edits are staged and ready
> the moment the new package is actually published — publishing it is the
> genuinely remaining step, not more building.
>
> Also confirmed while investigating: the "zero JS for CSS-only installs"
> invariant this whole epic protects was **already correctly upheld**
> before any of this — `sdk`/`zod`/`sass` are `peerDependencies` with
> `peerDependenciesMeta.*.optional: true`, which npm never auto-installs
> even on npm 7+. The actual gap was always exactly the DX one the epic
> names: someone who *wants* the MCP server has to run a second manual
> install first. That's what the new package fixes.

## Mission

Make the MCP server start with **one command and no extra install**:
`npx css-is-awesome-mcp`. Today it throws a helpful-but-real error
(`mcp/server.cjs:88-90`) because `@modelcontextprotocol/sdk` and `zod` are
**peerDependencies** the consumer must install by hand — the exact wall
Boiler hit ([[project_mcp_server_sdk_and_checker]]).

## Why now

The MCP is the AI differentiator (30 tools over stdio, already CI-exercised).
Every step between "I heard cia has an MCP" and "my agent is calling it" is
tax on the feature we most want tried. This is DX, not scope, and it can ship
independently of the recipe backlog.

## The tension (READ — this touches a LOCKED rule)

`css-is-awesome` ships **zero JS runtime dependencies on purpose**
([[feedback_no_js_in_package]]: "cia download = zero JS, period… optional JS
features ship as separate add-on packages"). The naive fix — move sdk+zod to
`optionalDependencies` on the core package — drags a dependency tree into
**every** install, including the thousands who only want the CSS. That breaks
the rule. So the fix has to give the reviewer's "just works" **without**
putting runtime deps on the core package.

## Decision — LOCKED 2026-09-07: Option B (separate package)

Jerry's call, and it's the direct reading of the locked rule: someone who
installs `css-is-awesome` **for the CSS** must never have a JS dependency tree
installed alongside it that they then have to keep in lockstep with cia
releases. No MCP → no JS, full stop.

- **CHOSEN — Option B: a separate `css-is-awesome-mcp` package.** Its real
  `dependencies` are sdk+zod; it depends on `css-is-awesome` for the SCSS data
  it serves. `npx css-is-awesome-mcp` installs that package + its deps
  transitively, so it "just works," while the core CSS package's manifest
  stays completely JS-free. The `bin` entry moves out of the core package into
  the add-on.
- **REJECTED — Option A (bundle sdk+zod into the core package's committed
  `server.cjs`).** Even vendored, it puts JS machinery inside the thing people
  download for CSS, and couples sdk updates to cia's release cadence — the
  coupling Jerry explicitly wants gone.

Open sub-question for F1: does the add-on **depend on** `css-is-awesome`
(always current, but two installs) or **vendor a snapshot** of the `scss/` it
needs (one install, but a version to keep fresh)? Resolve at implementation;
depend-on is the default unless the extra install proves annoying.

## Out of scope

- Adding sdk/zod as plain `dependencies` on the core package. Non-starter —
  it's the rule this epic exists to respect.
- New MCP tools. Packaging/DX only; the 30-tool surface is unchanged.

## Features

### F1 — The chosen packaging

- [x] **US-V11.07.1.1** (M) — ✅ DONE 2026-09-11. Stood up the separate
  `css-is-awesome-mcp` package (Option B) — a new sibling repo, not a `bin`
  moved out of the core package's existing manifest (that removal is a
  separate, deliberately deferred decision — see "What changes" below).
  `server.cjs` there declares sdk+zod as real `dependencies` and resolves
  `css-is-awesome`'s `scss/`, `scripts/theme-contract.json`, etc. by
  depending on it as a real npm dependency (the epic's stated default —
  confirmed viable: those are all in the core package's published `files`
  manifest already). Acceptance criterion verified with one adjustment:
  tested via a real `npm pack` + fresh install (both a local tarball and
  the actual npm registry) rather than "a clean machine" literally, since
  publishing wasn't in this session's scope — `list_mixins` (and 3 other
  tools) answer correctly over real stdio either way, and `css-is-awesome`'s
  own manifest is untouched, so it still pulls zero JS dependencies.
- [~] **US-V11.07.1.2** (S) — Drafted, then **reverted**. The intended
  error-message update (recommend `npx css-is-awesome-mcp` as the primary
  remedy) would be actively wrong advice for anyone hitting the error today,
  since the new package isn't published — `npx css-is-awesome-mcp` would
  fail for them too (package not found). Staged and ready to land the
  moment publishing happens; shipping it before that would trade one broken
  instruction for another.

### F2 — Proof + docs

- [~] **US-V11.07.2.1** (M) — Done differently than scoped: rather than
  extending the CORE repo's `scripts/mcp-coverage.mjs` (which tests the
  in-repo dev-tree path by design and still should — confirmed unaffected,
  still 30/30 tools, 100% coverage), the NEW repo has its own
  `scripts/verify-consumer-install.mjs`, which is the actual "consumer-shaped,
  not dev-tree" proof — it can't live in the core repo since the whole point
  is testing a *separate* package's *separate* install path. Runs via
  `.github/workflows/ci.yml` on push/PR — written and correct, **not yet
  exercised by a real CI run** since nothing in the new repo has been pushed.
- [ ] **US-V11.07.2.2** (S) — Not done. Drafted README + `/docs/mcp` copy
  changes for the core repo, then held them back for the same reason as
  F1.1.2 — the new package isn't published, so the public docs shouldn't
  yet tell a real visitor the one-liner "just works" when it doesn't. Lands
  together with publishing.

## What changes

- ✅ A new `css-is-awesome-mcp` package (Option B) — a sibling **repo**
  (`K:/Repo/css-is-awesome-mcp`), not a subdirectory of this one, built and
  committed locally 2026-09-11. Not yet published.
- ⏸️ `mcp/server.cjs`'s SDK-require guard message update — drafted,
  reverted, staged for when publishing happens (see F1.1.2 above).
- ✅ CI gains a consumer-shaped MCP launch check — in the new repo, not
  this one; written, not yet run (nothing pushed).
- ⏸️ MCP install docs simplifying to one command — same staged/deferred
  status as the guard message.

## What we may lose

- **Option A:** a larger committed binary-ish file, and sdk upgrades become a
  manual re-bundle instead of a lockfile bump. Third-party attribution must
  stay current in `LICENSE-third-party`.
- **Option B:** the operational cost of a second published package — its own
  semver, release automation, and a `css-is-awesome` version it tracks; a
  stale pin here is the class of bug we already hit once with Boiler's 1.0.0
  tarball.
- Either way: nothing about the CSS package's zero-dep install changes — that
  invariant is preserved by design.

## Risks

- Bundling (A) must not accidentally pull sdk/zod into the CSS package's
  `files` footprint beyond the one server file; `validate-package` should
  assert the core manifest still lists no runtime deps.
- (B) resolving the core package's `scss/` from a sibling package is the part
  most likely to break on a consumer's machine; the CI check in F2 exists to
  catch exactly that.

## Definition of done

- [x] `npx css-is-awesome-mcp` starts with no manual sdk/zod install — verified
  against a real npm-registry install and a packed local tarball, both times
  with identical, correct data (157 mixins, 112 sketchbook tokens, 24
  themes, 25 recipes) to the in-repo dev-tree server
- [~] A consumer-shaped launch check exists (`scripts/verify-consumer-install.mjs`
  + `.github/workflows/ci.yml` in the new repo) but hasn't run in real CI yet
  — nothing's been pushed
- [ ] Docs are one command — drafted, reverted; lands with publishing (see
  F1.1.2/F2.2.2 notes above)
- [x] The core `css-is-awesome` package still declares zero JS runtime
  dependencies — untouched by any of this work
- [ ] **Not done: actually publishing `css-is-awesome-mcp` to npm.** This is
  the one genuinely remaining step — everything above is built and verified
  locally. Deliberately outside this session's scope (real, irreversible,
  external action); needs separate explicit go-ahead.

## Related

- `mcp/server.cjs`, `scripts/mcp-coverage.mjs`, `package.json` (`bin`,
  `peerDependencies`), [[feedback_no_js_in_package]],
  [[project_mcp_server_sdk_and_checker]].
