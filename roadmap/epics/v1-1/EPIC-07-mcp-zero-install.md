# EPIC v1.1-07 — MCP that just works (`npx css-is-awesome-mcp`)

> Added 2026-09-07 from the external review. The reviewer flagged the single
> sharpest friction on our most differentiating feature: MCP won't start until
> the user separately runs `npm install @modelcontextprotocol/sdk zod`.
> Pull-forward candidate — small, high-leverage, DX not features.

**Status:** Planned (v1.1, pull-forward)
**Effort estimate:** ~1-2 working days
**Stories:** 4

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

- **US-V11.07.1.1** (M) — Stand up the separate `css-is-awesome-mcp` package
  (Option B): move the `bin` + `mcp/server.cjs` there, declare sdk+zod as real
  `dependencies`, and resolve the core package's `scss/` (depend-on by default).
  Acceptance: on a clean machine, `npx css-is-awesome-mcp` starts and answers
  `list_mixins` over stdio with no manual sdk/zod step — and installing plain
  `css-is-awesome` pulls **zero** JS dependencies.
- **US-V11.07.1.2** (S) — The runtime error path stays graceful: if the SDK
  genuinely can't load, the message names the exact remedy for the chosen
  packaging (not the old peer-install line).

### F2 — Proof + docs

- **US-V11.07.2.1** (M) — Extend `scripts/mcp-coverage.mjs` / CI to run the
  server the way a consumer would (installed artifact, no dev tree) so a
  packaging regression fails a PR — not just the in-repo `node mcp/server.cjs`
  path. Acceptance: CI green only if the consumer-shaped launch works.
- **US-V11.07.2.2** (S) — README + `/docs` MCP section: the copy-paste
  `.mcp.json` becomes the one-liner; drop the "first install sdk+zod" step;
  note the packaging choice.

## What changes

- Depending on the option: a `prepare-dist` bundling step and a fatter
  committed `mcp/server.cjs` (A), **or** a new `css-is-awesome-mcp` package
  directory + publish pipeline (B).
- `mcp/server.cjs:86-98` SDK-require guard message updates.
- CI gains a consumer-shaped MCP launch check.
- MCP install docs simplify to one command.

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

`npx css-is-awesome-mcp` starts with no manual sdk/zod install on a clean
consumer; CI proves it from a consumer-shaped launch; docs are one command;
and the core `css-is-awesome` package still declares zero JS runtime
dependencies.

## Related

- `mcp/server.cjs`, `scripts/mcp-coverage.mjs`, `package.json` (`bin`,
  `peerDependencies`), [[feedback_no_js_in_package]],
  [[project_mcp_server_sdk_and_checker]].
