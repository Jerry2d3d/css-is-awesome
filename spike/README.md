# `spike/` — the EPIC-04 codegen evaluation

**This directory deliberately does not ship.** It is not in `package.json`'s
`files` manifest, nothing in `src/` or `scss/` imports it, and it is not wired
into any npm script or CI job. It exists as the evidence behind one decision.

## What it is

[v1.1 EPIC-04](../roadmap/epics/v1-1/EPIC-04-framework-pack-react.md) proposed
`@cia/react`: a package of React components **generated** from the recipe book,
so cia could offer a framework pack without anyone maintaining a component
library by hand. The epic carried its own exit condition:

> If codegen does NOT work cleanly, this epic fails fast and `@cia/react` is
> permanently deferred (recipes remain the only framework story). That's a
> legitimate v1.1 outcome.

This spike implements F4.1 exactly as written, runs it over three recipes of
increasing difficulty, and answers the question with artifacts instead of
opinion. **Verdict: deferred permanently.** The reasoning is in the epic's
decision block; this README covers how to reproduce it.

## Files

| File | What it does |
|---|---|
| `parse-recipe.mjs` | US-V11.04.1.1 — recipe markdown → `{ name, meta, structureHtml, stylingScss, frameworks }` |
| `generate-react.mjs` | US-V11.04.1.2 + .1.3 — emit a `.jsx` component and a colocated `.module.scss` |
| `render-test.mjs` | Does the output parse as `.jsx` and survive `renderToStaticMarkup`? |
| `out/` | Generated components, generated SCSS, and `report.json` |

## Re-running it

```bash
node spike/parse-recipe.mjs scss/recipes/breadcrumb.md          # inspect the parse
node spike/generate-react.mjs breadcrumb combobox-multiselect toast
node spike/render-test.mjs Breadcrumb.jsx ComboboxMultiselect.jsx Toast.jsx
```

Expected output: three components, of which two crash on render and the third
renders a hard-coded pizza-toppings picker. That is the finding, not a bug in
the spike.

## Deviation from the epic worth knowing

F4.1 specifies `remark` + `unified` for the markdown AST. This spike uses
`marked`, which the repo already depends on and which `src/lib/recipes.ts` uses
to render these same files. Adding a second markdown parser would mean the
website and the codegen disagreeing about what a recipe is. If this epic were
ever revived, keep `marked`.

## Reading the numbers

`out/report.json` records, per recipe, how many lines of the generated file
were copied verbatim from the recipe versus synthesised by the generator. The
synthesised portion is byte-identical across all three outputs apart from the
component name, which is the core of the verdict: the generator contributes a
fixed template, and everything else is a copy.
