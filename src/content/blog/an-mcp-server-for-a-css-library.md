---
title: An MCP server for a CSS library
slug: an-mcp-server-for-a-css-library
category: engineering
tags: mcp, ai, tooling, developer-experience
audience: library authors, AI tool builders
excerpt: Agents guess at mixin signatures because prose docs give them nothing to query. cia ships a stdio MCP server that reads the SCSS instead. What broke along the way.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
readingTime: 6 min
---

An agent asked to style a button in this system will write something like this:

```scss
@include cia.btn(primary, $radius: 8px, $size: md);
```

Confident, well-shaped, and wrong. The real signature is:

```scss
@mixin btn($variant, $bg: null, $bg-hover: null, $bg-active: null, $color: null, $border: null, $args...)
```

No `$radius`. No `$size`. Sizing forwards through `$args...` to `btn-base` as `$py`, `$px`, `$r`. The agent invented a plausible API because plausible is all it had — the README describes the system, it doesn't expose it.

SCSS at least fails loudly here. `undefined mixin` and `no argument named $radius` are compile errors, not silent runtime bugs. But every wrong guess costs a build, a paste of the error back into the chat, and another guess. The alternative — telling the agent to grep-walk `node_modules/css-is-awesome/scss/` — burns a large chunk of context to find one line.

So on 2026-05-22 (`b397815`) cia started shipping a query surface instead of more prose: a Model Context Protocol stdio server at `mcp/server.cjs`, 27 tools at the time, 30 today.

## What it actually is

JSON-RPC over stdio, protocol `2024-11-05`, exposed as the `css-is-awesome-mcp` bin and included in the package `files` manifest — so it lands in every consumer's `node_modules` with the SCSS.

```json
{
  "mcpServers": {
    "css-is-awesome": {
      "command": "npx",
      "args": ["css-is-awesome-mcp"]
    }
  }
}
```

Thirty tools across eight families — themes, mixins, functions, tokens, animations, components, recipes, doc readers — plus two that don't fit a family: `assemble_prompt` and `resolve_size`. List and search tools return a `{ total, items }` envelope; `get_*` returns the full record. `get_mixin("btn")` answers with the signature above plus its params, doc comment, source path, and body. That's the whole point: the signature comes out of the file, not out of a paraphrase of the file that someone forgot to update.

Live totals as of this post: 150 mixins, 24 functions, 153 contract tokens, 9 themes, 10 components, 4 recipes.

## The trade-off: regex, not an AST

Discovery is a filesystem scan. No database, no build step, no index to invalidate. SCSS is parsed with focused regex plus a brace counter that handles cia's multi-line parameter lists. Tokens come from `scripts/theme-contract.json`, which is authoritative rather than inferred.

That is a real limitation, not a footnote. The parser is a heuristic that agrees with Sass's grammar on the code cia actually writes — declarations that follow the house style. It is not a Sass front end, and anything exotic enough to need one would be parsed wrong or skipped. The bet: a parser you can read in one sitting, that runs with zero setup, beats a correct one that needs a build pipeline. If cia's own SCSS ever drifts far enough from the house style to break it, the fix is the house style.

## The setup trap, documented honestly

`@modelcontextprotocol/sdk` and `zod` are declared as *optional* peer dependencies. That's deliberate — cia's core promise is zero JavaScript in the download, and a CSS-only consumer shouldn't pay an SDK install to use a stylesheet.

The cost lands on anyone who does want the server. npm skips optional peers by default, so the server throws on startup:

```
css-is-awesome MCP server: @modelcontextprotocol/sdk is not installed.
Install with: npm install @modelcontextprotocol/sdk zod
```

Which your MCP client will almost certainly show you as "failed to connect." The stderr is there; most clients don't surface it. So setup is two steps and the README says so in bold: install `-D @modelcontextprotocol/sdk zod`, *then* add the `.mcp.json` entry. A trap you document is still a trap, but it's a survivable one.

## Two bugs a consuming project found first

**Three of eight families were dead on npm.** The server reads tokens from `scripts/theme-contract.json`. `scripts/` was never in the `files` whitelist — so on a real npm install, `list_tokens`, `get_token`, and `search_tokens` all returned `{ total: 0 }`. Not an error. Just an empty, plausible answer. Fixed 2026-07-14 in `5d24066` by whitelisting the single file and verifying with `npm pack --dry-run`.

The lesson is narrow and useful: a server that passes locally proves nothing about the published tarball. Everything the server reads at runtime is a packaging dependency, and the repo checkout hides that.

**`search_components` didn't exist.** Every other family shipped `list_*` / `get_*` / `search_*`. Components shipped two of three, so `search_components` returned `-32602` method-not-found. Agents infer the pattern from the other seven families and call the tool that *should* be there. Added in `1ee5cee` (28 → 29 tools). Uniform family shape isn't tidiness; it's the difference between an agent guessing right and an agent hitting an error it can't route around.

Both were reported by the Boiler project — a separate repo that consumes cia. Neither would have surfaced from inside this one.

## The version was lying

`SERVER_VERSION` was a hardcoded `'0.8.2'` literal sitting three feet from `package.json`, which held the same number. Two copies of one fact, one of which gets bumped at release and one of which doesn't.

```js
const SERVER_VERSION = (function () {
  try {
    return require(path.join(PROJECT_ROOT, 'package.json')).version;
  } catch (err) {
    return '0.0.0';
  }
})();
```

Changed in `8b54516` on 2026-08-17. It matters more than a normal duplicated constant because `serverInfo.version` is metadata a client logs, caches, and may condition behavior on — and nothing fails when it's wrong. A stale version number reports success while telling every connected agent something false. Today the server reports `1.0.0` with no code change; before that commit it would still be claiming `0.8.2`.

Same commit fixed a `list_mixins` description that claimed "60+ in `_mixins.scss` + 19 in `_layout.scss`" when the real counts were 42 and 27. Hand-maintained numbers in tool descriptions rot the same way hand-maintained numbers in docs do. There are 30 `registerTool` calls in the file right now; the README still says 29 in one paragraph and 30 in another. Count it yourself — that's the honest advice.

## resolve_size, or: a design decision as a tool

The tool I'd steal for another library is `resolve_size(px)`. It doesn't expose an API surface. It encodes a decision.

cia's spacing is a 4px geometric grid. An agent handed a Figma value writes `1.0625rem` because 17 ÷ 16 = 1.0625, and the next one rounds differently, and the grid quietly stops existing. So:

```json
{
  "px": 17, "base": 4, "step": 4, "exact": false, "rem": 1,
  "scssCall": "cia.px(17)",
  "alternative": "cia.grid(4)  // snaps to 16px (1rem)",
  "notes": "17px is OFF cia's 4px grid (nearest step 4 = 16px). Two options: (a) cia.px(17) emits 1.0625rem off-grid, or (b) cia.grid(4) snaps to 16px which is 1rem. Prefer (b) unless the design intent specifically requires the off-grid value."
}
```

On-grid values are boring by design: 24px returns `cia.grid(6)`, `exact: true`, no alternative. Off-grid values return both paths, a recommendation, and the reasoning — because the agent needs to know that snapping is preferred *and* that the escape hatch exists when a design genuinely wants 17px.

That shape generalizes. Wherever your system has a convention that a reasonable person would violate by accident, a tool that returns the convention plus the escape hatch beats a paragraph in a style guide that nobody's context window reached.

## Why bother

The server is documentation with a return type. Prose docs go stale silently — the README paragraph that said "29 tools" was true for a month and wrong for a day before anyone noticed. A tool that reads the source can only go stale by shipping the wrong file, and shipping the wrong file is a bug with a reproduction.
