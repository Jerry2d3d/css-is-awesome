# css-is-awesome v1.0 — Epic Backlog

**Locked 2026-05-23** after architecture synthesis (panel + Gemini external review + Jerry instinct refinement).

The v1.0 release reframes cia as **humans-first, AI-second** and ships the recipes book — the architectural answer to "how do we beat shadcn without maintaining a component library."

## Priority ladder (the v1.0 pitch order)

1. **Users first** — easy to learn, no framework lock-in, no maintenance treadmill
2. **Tokens** — one source of truth, swap one value = whole app shifts
3. **Theme editor on the website** — visual customization for all 123 tokens
4. **Mixin-first speed** — `@include cia.btn(primary)` on any selector
5. **AI second (huge bonus)** — recipes book + MCP server make cia uniquely AI-composable

## v1.0 epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-recipes-book.md) | **Recipes Book** | Ship the recipe format + first 5 recipes (dialog, combobox, datepicker, data-table, command-palette). Expose via MCP. | ~5-7 days | 13 |
| [02](./EPIC-02-theme-editor-polish.md) | **Theme Editor Polish** | Download `mytheme.scss`/`.css`, share URL, inline contrast validator, reset/diff view. | ~3-4 days | 9 |
| [03](./EPIC-03-migration-on-ramp.md) | **Migration On-Ramp** | `npx cia migrate` converts Tailwind config + Bootstrap variables into a cia theme. | ~3-5 days | 6 |
| [04](./EPIC-04-playground.md) | **Playground** | `/playground` page on the cia website — paste SCSS, see live rendered output, share via URL. | ~4-6 days | 7 |
| [05](./EPIC-05-bug-fixes-mcp-polish.md) | **Bug Fixes + MCP Polish** | Round 8 audit cleanup, MCP server tests, /docs/composition page. | ~3-4 days | 7 |

**Total v1.0 effort:** ~18-26 focused working days. **Total stories:** 42.

## What's NOT in v1.0 (deferred — see [post-v1-ideas.md](./post-v1-ideas.md))

- VS Code extension (slated v1.5)
- Recipes Maker (visual builder on website)
- `@cia/a11y-recipes` add-on package
- `@cia/angular` / `@cia/vue` / `@cia/svelte` framework recipes
- `npm create cia@latest` install wizard
- Figma plugin
- RTL audit
- Theme marketplace
- Print recipe
- Form validation recipes
- i18n recipe
- Animation orchestration recipes

## Story format (consistent across epics)

```markdown
### US-EE.FF.SS — Short title

**As** a [persona]
**I want** [capability]
**So that** [outcome]

**Acceptance criteria:**
- [ ] Specific, testable condition
- [ ] Another condition

**Effort:** S (≤4 hrs) | M (4-8 hrs) | L (1-2 days) | XL (>2 days)
**Depends on:** US-XX.X.X (or "none")
```

Effort scale:
- **S** — under 4 hours
- **M** — 4 to 8 hours
- **L** — 1 to 2 days
- **XL** — more than 2 days

## Definition of done for v1.0

- [ ] All 5 epic DODs met
- [ ] All 42 stories shipped or explicitly punted to v1.1
- [ ] Tarball still under 250 KB packed
- [ ] No new JS in the npm package files manifest
- [ ] `npm run validate-themes` passes FAIL-by-default across all 9 themes
- [ ] `npm run lint:scss` clean
- [ ] `npm run test` (Playwright + axe) passes
- [ ] CHANGELOG.md `1.0.0` entry written
- [ ] MIGRATION.md `v0.8 → v1.0` section written
- [ ] README.md hero updated to "humans-first" framing
- [ ] llm.txt updated to reflect shipped recipes
- [ ] semantic-release publishes `1.0.0` cleanly to npm
