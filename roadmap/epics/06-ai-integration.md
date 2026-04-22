# Epic 6: AI Integration

## Summary
Makes css-is-awesome first-class legible to AI coding assistants (Claude, ChatGPT, Gemini, Cursor, Windsurf, Copilot) so they can reason about the system and generate correct code with it. The mixin-first architecture already fits in a few thousand tokens; this epic capitalizes on that by shipping the machine-readable artifacts, tools, and prompt surfaces that let an agent introspect tokens, mixins, and components, validate a theme, and scaffold a project without the user hand-feeding it docs. Deliverables include a Model Context Protocol (MCP) server, a `cia` CLI, an auto-generated JSON token export, reusable prompt templates, custom Claude/ChatGPT/Gemini bots, an `llm.txt` summary at repo root, a SemVer policy for AI consumers, and an integration guide. Together they turn "AI can probably handle this" into "an AI assistant can build a working page in one prompt."

## Goals
- MCP server exposes at least 6 tools covering tokens, mixins, components, theme validation, mixin suggestion, and component scaffolding, and is verified to connect from at least one mainstream client (Claude Desktop, Cursor, or ChatGPT).
- `cia` CLI ships with at least 5 commands (`init`, `add`, `theme new`, `theme validate`, `icons add`) installable via `npm install -g @css-is-awesome/cli` or `npx cia`.
- JSON token export in Design-Tokens-Community-Group format is auto-generated on every build from the SCSS source of truth, covers 100% of Epic 1's token contract, and ships at a stable URL.
- Custom Claude, ChatGPT, and Gemini assistants are live with public URLs listed in the root README, each wired to the MCP server and the JSON token export.
- An `llm.txt` at repo root summarizes the library in a single fetch (install methods, token list, mixin list, 1 example usage block, links) and stays under 32 KB.
- A new user following the integration guide can drive an AI assistant to produce a working themed page in one prompt, end-to-end, without opening the docs site.

## Out of scope
- The token system itself (names, contract, validator logic) — see Epic 1 (Library Foundations). This epic consumes Epic 1's contract, not redefines it.
- Docs-site content and long-form prose — see Epic 4 (Documentation Site). This epic references docs; it does not write them.
- React component API design — see Epic 3 (React Component Library). This epic introspects components; it does not design them.
- CI infra and release automation — see Epic 5 (Quality & Delivery). This epic ships artifacts; Epic 5 ships the pipelines that publish them.
- Community contribution policy for prompts and bots — see Epic 7 (Community & Project Meta).
- Visual/functional regression of generated code — see Epic 5 (Quality & Delivery).

## Features

### Feature 6.1: MCP (Model Context Protocol) server
A Node server (`@css-is-awesome/mcp`) that speaks MCP over stdio and/or HTTP so an AI client can connect and introspect the library. Exposes a tool surface covering tokens, mixins, components, theme validation, mixin suggestion from natural language, and component scaffolding. Stays stateless; reads the library's own source plus the generated JSON token export as its ground truth so there is no drift.

#### User Stories

**US-6.1.1** — As an AI assistant, I want a `list_tokens` tool that returns every design token with its type, current value, and example uses, so that I can cite exact token names when generating CSS.

**Acceptance criteria:**
- [ ] Tool returns a structured array of `{ name, category, type, value, example }` entries for every token in Epic 1's contract.
- [ ] Coverage is complete — no "not yet indexed" gaps; total count matches the contract count.
- [ ] Tool response is under 100 KB for the full set and streams in under 1 second locally.
- [ ] Published documentation with setup steps exists for at least Claude Desktop or Cursor.
- [ ] Works with at least one mainstream AI client (Claude Desktop, Cursor, or ChatGPT).

**Priority:** P2
**Effort:** 3
**Role:** AI assistant

**US-6.1.2** — As an AI assistant, I want a `list_mixins` tool that returns every mixin with signature, parameters, defaults, and an example output, so that I can generate SCSS calls that compile on the first try.

**Acceptance criteria:**
- [ ] Tool returns `{ name, signature, params: [{name, type, default}], description, example_input, example_output_css }` for every mixin in `scss/_mixins.scss` and `scss/components/*`.
- [ ] Coverage is complete — cross-checked against a lint script that enumerates declared mixins.
- [ ] Errors (e.g. mixin source unreadable) return a structured error object, not a raw exception.
- [ ] Works with at least one mainstream AI client.

**Priority:** P2
**Effort:** 3
**Role:** AI assistant

**US-6.1.3** — As an AI assistant, I want a `list_components` tool that returns every React component with its props and an example JSX snippet, so that I can compose UIs using the library's own wrappers.

**Acceptance criteria:**
- [ ] Tool returns `{ name, import_path, props: [{name, type, required, default}], example_jsx }` for every exported component.
- [ ] Coverage matches the Epic 3 component inventory with zero missing entries.
- [ ] Example JSX is syntactically valid and renders in a smoke test.
- [ ] Structured errors on missing source, not exceptions.

**Priority:** P2
**Effort:** 3
**Role:** AI assistant

**US-6.1.4** — As a developer using an AI copilot, I want a `validate_theme` tool that accepts a `theme.css` content string and returns the Epic 1 validator's output, so that my assistant can verify a theme it just wrote before I save it.

**Acceptance criteria:**
- [ ] Tool accepts a raw CSS string and returns `{ ok: boolean, missing: [], warnings: [], unknown: [] }`.
- [ ] Internally invokes the same validator script Epic 1 ships — no duplicate logic.
- [ ] Returns a structured error object, not a raw exception, on malformed input.
- [ ] Documented with a setup walkthrough.

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

**US-6.1.5** — As an AI assistant, I want a `suggest_mixin(description)` tool that takes a natural-language request and returns the best-matching mixin(s), so that I can pick the right call without scanning every mixin name.

**Acceptance criteria:**
- [ ] Tool accepts a string description and returns a ranked array of `{ name, relevance_score, why }` with at least the top 3 matches.
- [ ] Ranking uses mixin name + description text; no external model call required.
- [ ] Returns an empty array with a structured `reason` when no match passes a minimum threshold.
- [ ] Works with at least one mainstream AI client.

**Priority:** P2
**Effort:** 3
**Role:** AI assistant

**US-6.1.6** — As an AI assistant, I want a `generate_component(spec)` tool that scaffolds a new component from a template, so that I can propose a complete, library-conformant file in one tool call.

**Acceptance criteria:**
- [ ] Tool accepts `{ name, kind: 'atom'|'molecule'|'overlay', props?, description? }` and returns `{ files: [{path, content}] }`.
- [ ] Generated file imports the library's mixins and tokens per the current conventions, and would pass the library's lint on write.
- [ ] Errors on invalid `kind` or naming collisions return structured error objects.
- [ ] Coverage: every component kind in the Epic 3 template set is scaffoldable.

**Priority:** P2
**Effort:** 7
**Role:** AI assistant

**US-6.1.7** — As an MCP client integrator, I want clear setup docs for connecting Claude Desktop, Cursor, and a custom client, so that I can wire the server without reading its source.

**Acceptance criteria:**
- [ ] `docs/ai/mcp-setup.md` covers Claude Desktop config, Cursor config, and a generic stdio client recipe.
- [ ] Each path is verified end-to-end against the current MCP server version.
- [ ] Troubleshooting section covers the 3 most common failure modes (wrong Node version, path issues, stdout noise).

**Priority:** P2
**Effort:** 1
**Role:** MCP client integrator

### Feature 6.2: `cia` CLI
A command-line companion (`@css-is-awesome/cli`) installable globally or via `npx`. Mirrors the MCP server's capabilities for humans who prefer a terminal, and bridges the library into a user's project (scaffolding, theme creation, icon drop-in, validator). Designed to feel shadcn-adjacent: copy reference components into the consumer's repo rather than locking them to a runtime dependency.

#### User Stories

**US-6.2.1** — As a CLI user, I want `cia init` to scaffold a new project with css-is-awesome wired in, so that I can go from empty directory to first render in under a minute.

**Acceptance criteria:**
- [ ] `npx cia init <dir>` creates a working Next.js or Vite project with SCSS set up, Sketchbook theme imported, and a starter page.
- [ ] Running the project builds and renders without additional configuration.
- [ ] `cia init --help` documents every flag; interactive prompts cover framework choice.
- [ ] Works on Windows, macOS, and Linux.

**Priority:** P2
**Effort:** 7
**Role:** CLI user

**US-6.2.2** — As a CLI user, I want `cia add <component>` to pull a reference component into my project, so that I own the source like shadcn and can modify it.

**Acceptance criteria:**
- [ ] `cia add button` copies the reference Button component and its SCSS partial into the configured project path.
- [ ] The command updates an index/barrel file if present, or creates one.
- [ ] Re-running warns on overwrite and offers `--force`.
- [ ] Coverage matches the Epic 3 inventory — every shipped component is `add`-able with no gaps.

**Priority:** P2
**Effort:** 3
**Role:** CLI user

**US-6.2.3** — As a CLI user, I want `cia theme new <name>` to generate a new `theme.css` from the contract template, so that I start from a file that already passes the validator.

**Acceptance criteria:**
- [ ] Command writes `public/themes/<name>/theme.css` populated with every token from Epic 1's contract at default values.
- [ ] The generated file passes `cia theme validate` with exit 0.
- [ ] Command refuses to overwrite an existing folder without `--force` and emits a structured error message.
- [ ] Documented on the docs site.

**Priority:** P1
**Effort:** 1
**Role:** CLI user

**US-6.2.4** — As a CLI user, I want `cia theme validate <file>` to run the Epic 1 validator, so that I get the same gate CI runs locally.

**Acceptance criteria:**
- [ ] Command invokes the exact validator from Epic 1 — no parallel implementation.
- [ ] Exit code matches the underlying validator's exit code.
- [ ] Output is human-readable by default and switches to JSON with `--json` for AI consumers.
- [ ] Errors are actionable: each missing token is listed by name with a suggested default.

**Priority:** P1
**Effort:** 1
**Role:** CLI user

**US-6.2.5** — As a CLI user, I want `cia icons add <svg-url-or-path>` to drop an icon into my configured icon folder, so that I don't have to hand-place files.

**Acceptance criteria:**
- [ ] Command accepts a local file path or a URL and writes the SVG to the project's configured icon directory.
- [ ] Incoming SVGs are run through an SVGO-equivalent optimization.
- [ ] Command fails with a structured error when the SVG violates the Epic 2 icon spec (bad viewBox, inline styles, etc.).
- [ ] Documented in `cia icons --help` and the docs site.

**Priority:** P2
**Effort:** 3
**Role:** CLI user

**US-6.2.6** — As a CLI user, I want `cia docs <topic>` to open the relevant docs page (local or hosted), so that I can jump to reference material without leaving my terminal.

**Acceptance criteria:**
- [ ] `cia docs button` opens the Button docs page in the default browser.
- [ ] Without an argument, opens the docs home.
- [ ] Unknown topics print a ranked list of suggestions and exit non-zero.
- [ ] Works with or without network (falls back to local docs when offline, if installed).

**Priority:** P2
**Effort:** 1
**Role:** CLI user

**US-6.2.7** — As a developer using an AI copilot, I want every `cia` command to support `--json` output, so that my assistant can consume results without parsing human text.

**Acceptance criteria:**
- [ ] Every command accepts `--json` and emits a stable schema documented in `docs/ai/cli-json.md`.
- [ ] Errors in JSON mode are structured objects with `code`, `message`, `hint`.
- [ ] The schema is versioned (see Feature 6.7) and breaking changes bump the major.

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

### Feature 6.3: JSON token export
Auto-generate a JSON representation of the full token set on every build, in Design-Tokens-Community-Group (DTCG) format, compatible with Figma Tokens and similar tools. Today a `figma-tokens/` folder exists; this feature verifies its coverage matches Epic 1's contract, automates regeneration from the SCSS source of truth, and publishes the file at a stable hosted URL so AI tools and build pipelines can fetch it directly.

#### User Stories

**US-6.3.1** — As a system author, I want the JSON token export auto-generated from the SCSS source, so that it never drifts from the canonical tokens.

**Acceptance criteria:**
- [ ] A build script reads the SCSS token maps and writes `figma-tokens/tokens.json` in DTCG format.
- [ ] The script runs in the same pipeline as `npm run build:css`; stale output fails CI.
- [ ] Coverage is complete — every token in Epic 1's contract appears in the JSON; verified by a count assertion.
- [ ] Documented with setup steps.

**Priority:** P1
**Effort:** 3
**Role:** system author

**US-6.3.2** — As an AI assistant, I want to fetch the token JSON from a stable URL, so that I can pin a version and load it into context in one request.

**Acceptance criteria:**
- [ ] The JSON is published at a versioned URL (e.g. `/api/tokens/v1.json` or a CDN equivalent).
- [ ] The URL is listed in `llm.txt` (Feature 6.6) and the root README.
- [ ] The response includes a `version` field tied to the library's SemVer.
- [ ] Works from a cold fetch in any mainstream AI client.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

**US-6.3.3** — As a designer, I want the JSON importable into Figma via the Figma Tokens / Tokens Studio plugin, so that my Figma file stays in sync with the code.

**Acceptance criteria:**
- [ ] Importing `tokens.json` into Tokens Studio produces usable variables across color, typography, space, and shadow.
- [ ] A short docs page shows the import flow with screenshots.
- [ ] Round-trip (code → JSON → Figma) preserves token names 1:1.

**Priority:** P2
**Effort:** 1
**Role:** designer

### Feature 6.4: AI prompt templates
A `prompts/` folder in the repo (and distributed via the CLI) containing reusable prompt snippets for common tasks: scaffolding a component that matches the design system, migrating a Bootstrap or MUI component to css-is-awesome, generating a new theme from a brand brief, explaining the system to a fresh model context. Each template is parameterized and versioned.

#### User Stories

**US-6.4.1** — As a prompt author, I want a `prompts/` folder with a documented schema for each template, so that contributions follow a consistent shape.

**Acceptance criteria:**
- [ ] `prompts/README.md` defines the frontmatter schema (`id`, `title`, `inputs`, `version`, `description`).
- [ ] At least 5 templates ship at launch: `generate-component`, `migrate-from-bootstrap`, `migrate-from-mui`, `generate-theme`, `explain-system`.
- [ ] Every template includes example inputs and expected-output shape.
- [ ] Templates pass a lint script that validates the schema.

**Priority:** P2
**Effort:** 3
**Role:** prompt author

**US-6.4.2** — As a developer using an AI copilot, I want to pull a prompt template via the CLI (`cia prompt <id>`), so that I can paste it into my chat without hunting on GitHub.

**Acceptance criteria:**
- [ ] `cia prompt generate-component --var name=Button` prints the filled template to stdout.
- [ ] `cia prompt list` enumerates every template with id + title.
- [ ] Errors on unknown id or missing required var return structured messages.
- [ ] Documented in the integration guide (Feature 6.8).

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

**US-6.4.3** — As a bot maintainer, I want the prompt templates surfaced in the docs site, so that users without the CLI can copy them from the web.

**Acceptance criteria:**
- [ ] A docs-site page lists every template with a copy-to-clipboard button.
- [ ] The page is generated from the `prompts/` folder at build time (no duplicate content).
- [ ] Each template page links back to its source file on GitHub.

**Priority:** P2
**Effort:** 1
**Role:** bot maintainer

### Feature 6.5: Custom Claude / ChatGPT / Gemini bots
Pre-configured assistants published on each of Anthropic's, OpenAI's, and Google's hosted-bot platforms. Each is wired to the MCP server (where supported), the JSON token export, and the docs site so it answers questions about the library correctly out of the box. Public URLs ship in the README and docs.

#### User Stories

**US-6.5.1** — As a developer using an AI copilot, I want a public Claude/ChatGPT/Gemini bot tuned on css-is-awesome, so that I can ask design-system questions without wiring anything myself.

**Acceptance criteria:**
- [ ] A Claude (Projects or Custom Bot), a ChatGPT Custom GPT, and a Gemini Gem are published with public URLs.
- [ ] Each bot's system prompt references the JSON token export URL and the llm.txt URL.
- [ ] All three URLs appear in the root README and the docs-site integration page.
- [ ] Each bot can correctly answer 10 benchmark questions (mixin signatures, token values, component props) in a manual test.

**Priority:** P2
**Effort:** 3
**Role:** developer using an AI copilot

**US-6.5.2** — As a bot maintainer, I want a single source document that every bot's system prompt is built from, so that the three bots stay in sync.

**Acceptance criteria:**
- [ ] A `prompts/bots/system.md` file is the source of truth for the shared system prompt.
- [ ] Platform-specific overrides are kept in small adjoining files (`claude.md`, `chatgpt.md`, `gemini.md`).
- [ ] A release checklist documents how to push changes to all three platforms.
- [ ] The checklist is referenced from `CONTRIBUTING.md` (Epic 7).

**Priority:** P2
**Effort:** 1
**Role:** bot maintainer

**US-6.5.3** — As a developer using an AI copilot, I want each bot to correctly refuse or redirect when asked about out-of-scope topics (unrelated CSS frameworks, general design questions), so that answers stay grounded.

**Acceptance criteria:**
- [ ] The system prompt includes an explicit scope and a polite redirect for off-topic questions.
- [ ] Manual test: 5 off-topic prompts produce a redirect, not a hallucinated answer.
- [ ] On-topic prompts are answered with cited token names, mixin names, or component names.

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

### Feature 6.6: `llm.txt` / `ai.txt`
A plain-text `llm.txt` at repo root (and served at `/llm.txt` on the docs site) that summarizes the system in a single fetch. Contains what the library is, install methods, a full token list, a full mixin list, one example usage block, and links to the docs, JSON tokens, and MCP server. Sized for a single LLM context load. Cheap, high leverage; treated as P1 even though the rest of this epic is P2.

#### User Stories

**US-6.6.1** — As an AI assistant, I want a single `/llm.txt` fetch that tells me everything I need to start generating correct css-is-awesome code, so that I don't have to scrape the docs site.

**Acceptance criteria:**
- [ ] `llm.txt` exists at repo root and is served at `/llm.txt` on the deployed docs site.
- [ ] Contents include: one-paragraph overview, install commands, token list, mixin list with signatures, one end-to-end example, and cross-links.
- [ ] Total file size stays under 32 KB.
- [ ] Coverage of tokens and mixins is complete — no gaps versus the contract.

**Priority:** P1
**Effort:** 1
**Role:** AI assistant

**US-6.6.2** — As a system author, I want `llm.txt` auto-generated from the same sources as the docs and JSON export, so that it can never drift.

**Acceptance criteria:**
- [ ] A build script assembles `llm.txt` from SCSS tokens, mixin signatures, and a frontmatter intro file.
- [ ] Stale or hand-edited `llm.txt` fails CI via a checksum/regeneration step.
- [ ] The script runs in the same pipeline as the JSON export.

**Priority:** P1
**Effort:** 1
**Role:** system author

**US-6.6.3** — As a developer using an AI copilot, I want the llm.txt URL printed on the docs home and in the README, so that I can paste it into my assistant without digging.

**Acceptance criteria:**
- [ ] The root README has an "AI assistants" section with the URL and a one-line usage hint.
- [ ] The docs-site home shows the same link in a sidebar or callout.
- [ ] An `ai.txt` alias at repo root points to the same content (redirect or copy) for discoverability.

**Priority:** P1
**Effort:** 1
**Role:** developer using an AI copilot

### Feature 6.7: Versioning policy for AI consumers
The MCP server, CLI, and JSON token export each follow their own SemVer, published independently from the library's version, so AI tools can pin a stable interface while the library itself evolves. Documented contract for what constitutes a breaking change in each surface.

#### User Stories

**US-6.7.1** — As an MCP client integrator, I want the MCP server versioned independently with a published changelog, so that I can pin a known-working version.

**Acceptance criteria:**
- [ ] `@css-is-awesome/mcp` publishes to npm with its own SemVer and a `CHANGELOG.md`.
- [ ] A documented policy defines breaking changes (tool removal, tool-signature change, response-shape change).
- [ ] A `version` tool returns the running server version and the library version it was built against.

**Priority:** P2
**Effort:** 1
**Role:** MCP client integrator

**US-6.7.2** — As a CLI user, I want `cia --version` to show both the CLI version and the library version it expects, so that I can diagnose mismatches.

**Acceptance criteria:**
- [ ] `cia --version` prints `cli@x.y.z library@a.b.c`.
- [ ] The CLI warns (non-fatal) when the consumer's installed library version is outside its tested range.
- [ ] The tested range is documented in `docs/ai/cli-versioning.md`.

**Priority:** P2
**Effort:** 1
**Role:** CLI user

**US-6.7.3** — As an AI assistant, I want the JSON token export to carry a `schema_version` field, so that I can detect and adapt to format changes.

**Acceptance criteria:**
- [ ] Every emitted `tokens.json` includes `schema_version` following SemVer.
- [ ] Format changes bump schema_version per the documented policy.
- [ ] Breaking changes publish to a new URL path (`/api/tokens/v2.json`) while v1 stays live through a deprecation window.

**Priority:** P2
**Effort:** 1
**Role:** AI assistant

### Feature 6.8: Integration guide
A dedicated docs-site page that walks a reader through every way to hook AI into css-is-awesome: connecting the MCP server to Claude Desktop / Cursor, using the custom bots, installing the CLI, when to reach for each tool, and worked one-prompt examples. This is the landing surface for developers arriving via the "AI-friendly" pitch.

#### User Stories

**US-6.8.1** — As a developer using an AI copilot, I want one docs page that explains all AI integration paths, so that I don't have to assemble the picture from scattered READMEs.

**Acceptance criteria:**
- [ ] A page at `/docs/ai` covers MCP setup, CLI usage, custom bots, `llm.txt`, and JSON tokens.
- [ ] Each section links to deeper docs and to the relevant source repo paths.
- [ ] The page is linked from the docs-site sidebar and the landing page's AI callout.
- [ ] Published with setup steps verified against current versions.

**Priority:** P2
**Effort:** 3
**Role:** developer using an AI copilot

**US-6.8.2** — As a developer using an AI copilot, I want a "build a themed page in one prompt" worked example on the integration page, so that I have a concrete demonstration of the differentiator.

**Acceptance criteria:**
- [ ] The page includes a reproducible example prompt plus the assistant's expected output, using one of the custom bots or a local Claude Desktop + MCP setup.
- [ ] The output renders as a valid themed page with zero hand-edits.
- [ ] The example is rerun each release to confirm it still works.

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

**US-6.8.3** — As a developer using an AI copilot, I want a "when to use what" decision table (CLI vs MCP vs raw docs vs bot), so that I pick the right tool without trial and error.

**Acceptance criteria:**
- [ ] The integration page includes a table mapping task types (scaffold project, one-off question, generate component in-chat, batch migration) to the recommended tool.
- [ ] Each row links to the relevant setup section.
- [ ] The table fits on one screen.

**Priority:** P2
**Effort:** 1
**Role:** developer using an AI copilot

## Dependencies
- Blocks: nothing in 1.0. This epic is mostly post-1.0, though the MCP server, CLI, `llm.txt`, and JSON token export can ship ahead as differentiators without gating the 1.0 release.
- Blocked by: Epic 1 (token contract + validator — the MCP `list_tokens` and `validate_theme` tools, the JSON export, and `llm.txt` all consume the contract), Epic 3 (React component API — the MCP `list_components` and CLI `add` commands introspect this surface), Epic 4 (docs content — the integration guide and bots reference the published docs).

## Priority
P2 (post-1.0) overall, with two P1 exceptions that should ship before 1.0 because they are cheap and high leverage:
- Feature 6.6 (`llm.txt` / `ai.txt`) — a single generated file that dramatically lifts AI accuracy.
- Feature 6.3 (JSON token export) — verification and automation of an artifact the repo already partially ships.
