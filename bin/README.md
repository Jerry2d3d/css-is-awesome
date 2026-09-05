# bin/

cia's CLI entry points. **These are the only JavaScript files cia ships** — the package itself remains JS-free per the locked architecture rule (`feedback_no_js_in_package.md`); the CLI tools in `bin/` are explicitly allowed because they're consumer-facing tooling, not consumed by browser code at runtime.

## Bins registered in `package.json`

| Bin | File | What it does |
|---|---|---|
| `css-is-awesome-mcp` | `../mcp/server.cjs` | MCP stdio server for AI agents (themes, mixins, recipes, etc.) |
| `cia` | `./cia.cjs` | The CLI router — `migrate` (tailwind/bootstrap), `add` (recipe registry), `analyze` (design-system health) |

Invoke either via `npx` from a consumer project that has cia installed:

```bash
npx css-is-awesome-mcp        # MCP server (stdio; configure via .mcp.json)
npx cia --help                # CLI help
npx cia migrate tailwind ./tailwind.config.js
npx cia add bottom-nav        # copy a recipe into the project — own the pattern
npx cia analyze src/styles    # health check: dead symbols, space() trap, hex, BEM
```

## Subcommand files

`cia.cjs` is the router. Each subcommand lives in its own sibling file and is loaded lazily so consumers who only use one path don't pay the require cost of the others.

| Subcommand | File | Status |
|---|---|---|
| `cia migrate tailwind <path>` | `migrate-tailwind.cjs` | **PR 1**: parses + dumps theme JSON. Future PRs: map tokens + emit theme.scss. |
| `cia migrate bootstrap <path>` | (planned) | Roadmap: `roadmap/epics/v1-0/EPIC-03-migration-on-ramp.md` F3.2 |

## Adding a new subcommand

1. Create `bin/<command>.cjs` that exports `module.exports = { run: async (args) => {...} }`
2. Add a route in `bin/cia.cjs`:
   ```js
   if (command === 'newcommand') {
     const { run } = require('./newcommand.cjs');
     await run(rest);
     return;
   }
   ```
3. Add help text in `bin/cia.cjs`'s `HELP` constant
4. Document in this README + add an entry to the relevant epic file in `roadmap/epics/`

## Optional peer dependencies

The CLI gracefully degrades when consumer-project deps aren't installed:

- **`jiti`** — required to load `tailwind.config.ts` / `.mjs`. `.js` / `.cjs` work without it. If a consumer hits a `.ts` config without jiti, the CLI prints a clear install hint.
- **`tailwindcss`** — when present, the CLI uses Tailwind's own `resolveConfig` so `extends`, plugins, and defaults are folded in. When absent, the raw config is parsed directly (less complete, but enough for inspection).

cia doesn't depend on either at runtime — both are loaded inside `try/catch`. cia ships with neither in its own `dependencies` field; they're optional peer deps for the consumer.

## Architecture rules these binaries respect

- Zero JS in npm `files` manifest beyond `bin/` and `mcp/` (and `dist/` for compiled CSS)
- No browser code in these bins — they run in Node, in the consumer's terminal
- No telemetry, no network calls (other than what `tailwindcss/resolveConfig` does internally, which is none)
- Errors print to stderr; structured output prints to stdout (pipe-safe)
