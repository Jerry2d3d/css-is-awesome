# v1.1 — Recipes Momentum

**Target release:** originally v1.1.0 — but that npm version number has been consumed: semantic-release published `css-is-awesome@1.1.0` on 2026-09-01 carrying the launch-wave work (theme rework, a11y fixes, linux baselines), not this backlog. This backlog ships under whatever later versions semantic-release derives from its commits.
**Theme:** Capitalize on v1.0 recipes momentum. Expand the recipe catalog, ship the install wizard, scaffold the `@cia/a11y-recipes` add-on, and prove the recipes → framework-pack codegen pattern with `@cia/react` v0.1.

> **Status: Not started (planned).** v1.0 has shipped (v1.0.0 tagged 2026-08-17; launched 2026-09-01 with the first npm publish, public repo, and live docs site) — but no story in any epic below has begun; everything here is future work. The density knob (EPIC-05) was queued into this version on 2026-08-29 (f9822be) and is likewise unstarted. The 18 v1.0 stories carried forward post-launch (see [v1-0/README.md](../v1-0/README.md)) compete with this backlog for priority once real user signal arrives.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-additional-recipes.md) | **Additional Recipes (batch 1)** | 7 more recipes: combobox-multiselect, breadcrumb, pagination, file-upload, toast, sortable list, color-picker. | ~10-14 days | 14 |
| [02](./EPIC-02-install-wizard.md) | **`npm create cia` wizard** | Guided install: framework? theme? a11y add-on? Wires SCSS entry + theme attr in one command. | ~3-5 days | 7 |
| [03](./EPIC-03-cia-a11y-recipes.md) | **`@cia/a11y-recipes` add-on** | Separate npm package: WCAG-strict variants of the v1.0 recipes (combobox with announcements, datepicker with screen-reader month nav, command-palette with focus trap). Recipes-first; tiny JS shims only where unavoidable. | ~5-7 days | 10 |
| [04](./EPIC-04-framework-pack-react.md) | **`@cia/react` v0.1 (POC)** | Prove the codegen pipeline: parse recipes → emit React components. First batch of generated components. Sync mechanism for recipe updates. | ~2 weeks | 12 |
| [05](./EPIC-05-density-knob.md) | **The density knob (`--space-unit`)** | One variable rescales the whole spacing system. `--space-0..9` become `calc()` over a master unit; set it once and the UI tightens or opens up. Density changes a page's character more than colour does. | ~1-2 days | 4 |

**Total v1.1 effort:** ~26-37 working days. **Total stories:** 47.

## Definition of done for v1.1

- [ ] 12 recipes total in the recipe book (5 from v1.0 + 7 new)
- [ ] `npm create cia@latest` ships and works on Mac/Linux/Windows
- [ ] `@cia/a11y-recipes` npm package published
- [ ] `@cia/react` v0.1 published with 3-5 generated components
- [ ] CHANGELOG.md entry for this backlog's release (note: CHANGELOG already has a `1.1.0` entry dated 2026-09-01 — that's the launch wave, not this backlog)
- [ ] No regression in v1.0 epic DoDs
