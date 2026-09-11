---
title: The MCP command that ran someone else's file
slug: the-mcp-command-that-ran-someone-elses-file
category: engineering
tags: mcp, ai, tooling, npm, developer-experience
audience: library authors, AI tool builders
excerpt: A dedicated zero-install MCP package, a same-named bin in two packages, and a test suite that stayed green while the real command ran the wrong file.
author: Jerry Hansen
publishDate: 2026-09-11
updatedDate: 2026-09-11
---

[An earlier post](/blog/an-mcp-server-for-a-css-library) covered cia's in-repo MCP server and its "setup trap, documented honestly": `@modelcontextprotocol/sdk` and `zod` are optional peer dependencies, by design, because cia's core promise is zero JavaScript for anyone who just wants the CSS. The cost landed on anyone who *did* want the server — a manual `npm install @modelcontextprotocol/sdk zod` before anything would run.

That trap is now closed. [`css-is-awesome-mcp`](https://www.npmjs.com/package/css-is-awesome-mcp) is a dedicated package — `npx css-is-awesome-mcp` in an `.mcp.json` and nothing else. No second install step, ever. Getting there took a wrong architecture-adjacent shortcut, a real bug in production for a few hours, and a test suite that never exercised the one thing it existed to prove.

## Why a second package, not a flag

The obvious-looking fix — bundle the SDK into `css-is-awesome` behind a flag, or just move it into `dependencies` — was never on the table. `css-is-awesome`'s zero-JS guarantee isn't a preference, it's load-bearing: thousands of installs are CSS-only, and none of them should pay for an MCP SDK they never asked for. `peerDependenciesMeta.*.optional: true` already protected that correctly, which meant the real gap wasn't an architecture problem — it was a two-line DX problem being solved by asking every interested user to fix it manually, one `npm install` at a time.

So `css-is-awesome-mcp` ships as a genuinely separate package: its own repo, own release pipeline, own version number. It depends on `css-is-awesome` as a real dependency and resolves the installed copy's actual source —

```js
const CIA_ROOT = path.dirname(require.resolve('css-is-awesome/package.json'));
```

— never a vendored snapshot, so it can't drift from whatever version of cia you actually have installed. The ~1400 lines of tool logic didn't move or change; only the ten-line header that resolves file paths did. One-way dependency, same as the design-system-vs-boilerplate split cia already uses elsewhere: the packaging layer depends on the source of truth, never the reverse.

## The bin two packages agreed to share

`css-is-awesome` already declared `bin: { "css-is-awesome-mcp": "mcp/server.cjs" }` — the same command name the new package needed for its own bin. That seemed harmless: same logical server, same tool surface, why not the same name in both places.

npm disagreed, silently. `css-is-awesome-mcp` depends on `css-is-awesome`, so a real install pulls both into the same `node_modules`, and both packages' `bin` fields get linked into the same `node_modules/.bin/`. Two packages, one command name, one shared directory — something has to win, and npm doesn't document which, because it isn't supposed to happen.

Verifying this by hand, after the package was live on npm:

```
node_modules/.bin/css-is-awesome-mcp → ../css-is-awesome/mcp/server.cjs
```

Core's old bin won. `npx css-is-awesome-mcp` — the entire pitch of the new package — was silently running the *other* package's file. It still answered MCP calls correctly, by coincidence: core's copy resolves its own paths relative to itself, and nested inside another package's `node_modules` that still happened to land on the right files. `serverInfo.version` gave it away — `1.12.0`, cia's version, when the new package's own `server.cjs` would have reported `1.0.0`. A tool that reports the wrong number wasn't `resolve_size`'s trap from the last post; it was this one's smoke detector.

Fixed the obvious way: `css-is-awesome`'s own `bin` entry lost the `css-is-awesome-mcp` key. Nothing that depended on the *file* broke — every project actually wired up to it (three separate `.mcp.json` configs, checked before touching anything) pointed at `node K:/path/to/css-is-awesome/mcp/server.cjs` directly, never the bin shortcut. Only the shortcut itself, which nothing was using, and which now belongs to exactly one package instead of two.

## The test that proved nothing

The package shipped with a verification script specifically built to catch exactly this class of bug — "prove it works the way a real `npx` install does, not just the dev-tree path." It packed cia into a real tarball, installed it fresh, and called real tools over real stdio. It passed. The collision shipped anyway.

The script copied `server.cjs` straight into its scratch directory instead of installing the new package as a real dependency:

```js
// what it did — sidesteps npm entirely
fs.copyFileSync(path.join(REPO_ROOT, "server.cjs"), path.join(scratch, "server.cjs"));
```

That's a dev-tree test wearing a consumer-shaped costume. It proved `server.cjs`'s logic works. It never asked npm to create a `bin` symlink for it, so it never touched the one mechanism the bug lived in. A test that skips the exact step a real user's command depends on will stay green forever, no matter how real the rest of it looks.

The fix packs *both* packages, installs both as real `file:` dependencies in a scratch `package.json`, and asserts on the resolved bin before ever spawning it:

```js
if (binTarget.includes("css-is-awesome/mcp/server.cjs")) {
  fail(`resolves to CORE's mcp/server.cjs, not this package's own server.cjs — bin name collision regressed`);
}
```

Reverting the fix locally and re-running proved the assertion actually catches it — pass with the fix, fail without it, not just pass either way. Confirming a regression test can fail is the only way to know it isn't decorative.

Second bug, smaller: that assertion passed on Windows and failed on Linux CI, with all four functional checks still green. npm's `.bin` entries aren't the same shape cross-platform — Windows gets a shell/cmd wrapper script whose text contains the resolved path; POSIX gets a real symlink. `readFileSync` on a symlink follows it and returns the *target file's source code*, not a path — so the substring check was comparing a file path against a pile of JavaScript, on the one platform (Linux, i.e. every CI runner) that actually mattered. Fixed with `lstatSync().isSymbolicLink()` to read the link target directly instead of dereferencing it.

## What actually proved it fixed

Not the test suite — a cold `npx` call, with an isolated npm cache so nothing could be reused from a prior run:

```bash
NPM_CONFIG_CACHE=/tmp/fresh-npm-cache npx -y css-is-awesome-mcp@latest
```

```json
{"result":{"serverInfo":{"name":"css-is-awesome","version":"1.0.0"}}}
```

`1.0.0` — the new package's own version, not cia's. That's the whole fix, confirmed the same way a real user would hit it: by running the actual command, not a script that resembles it.

## The two-line version

Splitting the SDK into a separate package solved a real dependency problem. Sharing a bin name across two packages in the same dependency tree created a new one, silently, because npm has no obligation to tell you when two packages want the same filename in the same folder. If your test proves a real install works, make sure it actually performs the install — the shortcut that skips the slow part is usually the shortcut that skips the part with the bug in it.
