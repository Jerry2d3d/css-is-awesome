# EPIC v1.1-07 — MCP that just works (`npx css-is-awesome-mcp`)

> Added 2026-09-07 from the external review. The reviewer flagged the single
> sharpest friction on our most differentiating feature: MCP won't start until
> the user separately runs `npm install @modelcontextprotocol/sdk zod`.
> Pull-forward candidate — small, high-leverage, DX not features.

**Status:** ✅ Complete (v1.1) — `css-is-awesome-mcp@1.0.1` published to npm
2026-09-11, verified with a real fresh `npx` call, docs/error-messages
updated across both repos.
**Effort estimate:** ~1-2 working days
**Stories:** 4

> **Status note (2026-09-11, final).** `css-is-awesome-mcp` is live on npm.
> Both repos now publish exclusively through GitHub Actions (semantic-release
> + a Classic Automation `NPM_TOKEN`, never a manual terminal `npm publish`
> — npm killed authenticator-app 2FA setup in September 2025, so a terminal
> publish has no way to satisfy the OTP prompt; see
> [[feedback_npm_publish_via_ci_only]]).
>
> **A real bug shipped with the first publish, and was fixed the same day.**
> `css-is-awesome` still declared its own `bin: { "css-is-awesome-mcp": "mcp/server.cjs" }`
> — the same command name the new package needed. Since the new package
> depends on core, npm links both packages' bins into the same
> `node_modules/.bin/`, and core's silently won: `npx css-is-awesome-mcp`
> was running core's old file, not the new package's own — proven by
> `serverInfo.version` reporting cia's version instead of the new package's.
> The existing "consumer-shaped" verification script didn't catch it because
> it copied `server.cjs` directly into its scratch dir instead of installing
> the new package as a real dependency, so it never exercised npm's `bin`
> resolution at all — the one mechanism the bug lived in. Fixed by removing
> core's colliding `bin` entry (nothing that depended on the *file* broke —
> every real `.mcp.json` config already used the direct `node .../mcp/server.cjs`
> path) and rewriting the verify script to install both packages for real and
> assert on the resolved bin target before spawning it. Full story:
> [the blog post](https://cssisawesome.com/blog/the-mcp-command-that-ran-someone-elses-file).
>
> Confirmed while investigating: the "zero JS for CSS-only installs"
> invariant this whole epic protects was **already correctly upheld**
> before any of this — `sdk`/`zod`/`sass` are `peerDependencies` with
> `peerDependenciesMeta.*.optional: true`, which npm never auto-installs
> even on npm 7+. The actual gap was always exactly the DX one the epic
> names: someone who *wants* the MCP server had to run a second manual
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
- [x] **US-V11.07.1.2** (S) — ✅ DONE. `mcp/server.cjs`'s guard-error
  messages now recommend `npx css-is-awesome-mcp` first, with the manual
  peer-install path kept as the documented fallback. Core's own colliding
  `bin` entry was removed in the same pass (see the bug writeup above).

### F2 — Proof + docs

- [x] **US-V11.07.2.1** (M) — Done differently than scoped, and hardened
  further after shipping: rather than extending the CORE repo's
  `scripts/mcp-coverage.mjs` (which tests the in-repo dev-tree path by
  design and still should — confirmed unaffected, still 30/30 tools, 100%
  coverage), the NEW repo has its own `scripts/verify-consumer-install.mjs`.
  Its first version still missed the actual bin-collision bug because it
  copied `server.cjs` directly instead of installing the package for real —
  rewritten to pack and install both packages as real dependencies and
  assert on the resolved `.bin` target (POSIX-symlink-aware, not just a
  Windows-shaped file read). Runs via `.github/workflows/ci.yml` on every
  push/PR, now actually green on real CI.
- [x] **US-V11.07.2.2** (S) — ✅ DONE. README, AGENTS.md, `llm.txt`,
  `bin/README.md`, and `/docs/mcp` all updated to lead with
  `npx css-is-awesome-mcp` as the recommended path, with the in-repo
  `mcp/server.cjs` copy documented as the alternative. The README and
  `llm.txt` previously contained an explicit warning telling people *not*
  to use that command — written before the package existed, now backwards
  and corrected.

## What changes

- ✅ A new `css-is-awesome-mcp` package (Option B) — a sibling **repo**
  (`K:/Repo/css-is-awesome-mcp`), published to npm as `1.0.1`.
- ✅ `mcp/server.cjs`'s SDK-require guard message updated to recommend the
  new package first.
- ✅ CI gains a consumer-shaped MCP launch check — in the new repo, running
  on every push, now including the bin-resolution regression check.
- ✅ MCP install docs simplified to one command, across both repos' READMEs
  and the docs site.
- ✅ Core's own colliding `bin.css-is-awesome-mcp` entry removed — not
  originally scoped this precisely, but became necessary once the
  collision was found (see status note above).

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
  with a real fresh `npx` call against a fully isolated npm cache, resolving
  to the new package's own server (not core's — see the bin-collision fix)
- [x] A consumer-shaped launch check exists (`scripts/verify-consumer-install.mjs`
  + `.github/workflows/ci.yml` in the new repo), actually installs both
  packages for real, and is green on real CI
- [x] Docs are one command — README, AGENTS.md, llm.txt, bin/README.md, and
  `/docs/mcp` all lead with `npx css-is-awesome-mcp`
- [x] The core `css-is-awesome` package still declares zero JS runtime
  dependencies — untouched by any of this work
- [x] `css-is-awesome-mcp` published to npm (`1.0.1`) via CI/semantic-release,
  never a manual terminal publish

## Related

- `mcp/server.cjs`, `scripts/mcp-coverage.mjs`, `package.json` (`bin`,
  `peerDependencies`), [[feedback_no_js_in_package]],
  [[project_mcp_server_sdk_and_checker]].
