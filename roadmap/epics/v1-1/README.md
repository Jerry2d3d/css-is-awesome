# v1.1 — Recipes Momentum

**Target release:** v1.1.0 (~4-6 weeks after v1.0 ships)
**Theme:** Capitalize on v1.0 recipes momentum. Expand the recipe catalog, ship the install wizard, scaffold the `@cia/a11y-recipes` add-on, and prove the recipes → framework-pack codegen pattern with `@cia/react` v0.1.

> **Status: Not started (planned).** This is a post-v1.0 version — v1.0 has not shipped yet. No story in any epic below has begun; everything here is future work.

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
- [ ] CHANGELOG.md v1.1.0 entry
- [ ] No regression in v1.0 epic DoDs
