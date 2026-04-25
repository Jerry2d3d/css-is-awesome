# Component philosophy — design exercise

## What's happening

Jerry shared an external `component-design.instructions.md` (saved here as
`imported-instructions.md`) that describes a different component-authoring
philosophy than our current one. He likes the ideas. He wants to know how
our system could absorb the parts that fit.

**His specific note:** *"They don't need SCSS files per component unless
they want to change the base mixins."*

That's the headline question for this exercise.

## Read both before responding

- **`imported-instructions.md`** in this folder — the doc Jerry wants to think about.
- **Our current system** — see references at bottom.

## Their philosophy (summary)

1. **Folder per component** with three files: `Component.tsx`,
   `component.types.ts` (optional), `component.module.css` (required, even
   if empty).
2. **Vanilla CSS Modules only** — no SCSS, no CSS-in-JS, no Tailwind.
3. **Root class = kebab-case component name** — `<section className={style['image-picker']}>`.
4. **Fully nested selectors** with `>` child combinators — hierarchy
   readable from the stylesheet alone.
5. **Tag selectors over class names** — only add classes to disambiguate
   siblings.
6. **Pseudo-elements over extra HTML** — `::before`/`::after` for decorative
   nodes.
7. **No `!important`**.
8. **Block/inline directional properties** — `margin-block` / `margin-inline`
   for RTL/TTB safety, never `margin-top/right/bottom/left`.
9. **Sizing units priority** — `rem → em → vw/vh → ch`, `%` rare.
10. **Fibonacci number convention** — values like `1.3rem`, `2.1rem`,
    `0.5rem` signal "approximate, safe to adjust." Non-Fibonacci values are
    intentional fixed values that shouldn't change without explicit
    instruction.
11. **HTML hierarchy** — `section → article → div`. Component root is always
    `<section>` (or `<dialog>`).
12. **No same-element nesting** — no `<div>` inside `<div>`.
13. **TypeScript** — `type` for props, `interface` for data models.
14. **Arrow-function components** as default export.
15. **Event handlers prefixed `handle`**.
16. **Class joining via array syntax** — `[style['x'], props.className].join(' ')`.

## Our current philosophy (summary)

- Folder per component with: `Component.tsx`, `Component.module.scss`
  (required), `index.ts` (re-export).
- **SCSS Modules** that `@use 'mixins' as m;` and apply our library mixins.
- CamelCase class names in modules (`styles.itemInteractive`).
- `forwardRef<HTMLElement, Props>` + named export + default export.
- Inline prop type definitions (no separate `.types.ts` file).
- Mixin-first library: `@include btn(primary)`, `@include card-base`, etc.
  Token-driven via theme contract (123 tokens, 6 themes via `[data-theme]`).
- Utility classes (`.cia-*`) exist for layout/spacing/text/color, but NOT
  for full components.
- Components use a mix of `<div>`, `<button>`, `<a>`, etc. as the semantic
  root — not always `<section>`.

## What the agents are answering

Each agent: 5–10 line response per question, full SCSS/code where it
helps.

### Q1 — Which ideas in the instructions doc fit our system AS-IS?

Examples to consider (don't have to use these): the Fibonacci
spacing convention is similar to our numbered scale; the
`section → article → div` hierarchy is orthogonal to our SCSS; the
TypeScript `type`/`interface` split is a small win we could adopt
in `*.types.ts` form.

### Q2 — Which ideas CONFLICT with our system, and is the conflict resolvable?

Examples: the doc bans SCSS; we are SCSS-first. The doc requires a
per-component CSS file; Jerry's note says we should NOT require this
when consumers don't deviate from base mixins. The doc forbids
`!important`; do any of our mixins emit it?

### Q3 — How do we let consumers build a component WITHOUT writing per-component SCSS?

Jerry's headline ask. Possible angles:

- Ship every base component as a utility class (`.cia-card`,
  `.cia-btn-primary`, `.cia-input`) so HTML-only authoring is enough.
- Provide a build-time generator that emits component utility classes
  from existing mixins.
- Accept that React consumers use `<Button variant="primary">` (already
  works) and the "no SCSS file needed" rule applies to React-side use,
  not vanilla HTML.
- Other?

### Q4 — Concrete proposal

Write the smallest set of changes to our codebase that enables Jerry's
"no per-component SCSS unless changing base mixins" rule. Pseudocode is
fine. Reference real file paths from our repo (`scss/components/_buttons.scss`,
`src/components/Button/Button.tsx`, etc.).

## Output format

Each agent writes one file:

```
experiments/component-philosophy/
├── README.md                ← this file
├── imported-instructions.md ← Jerry's source doc
├── claude-webdesign.md
├── claude-frontend.md
├── claude-dev.md
├── gemini-webdesign.md
├── gemini-frontend.md
└── gemini-dev.md
```

Each file's structure:

```markdown
# <Source> — <Persona> (20yr)

## Q1 — Ideas that fit as-is
[bullets]

## Q2 — Conflicts (and resolution)
[bullets]

## Q3 — Consumer authoring without per-component SCSS
[the API + mechanism]

## Q4 — Concrete proposal
[the smallest set of changes — file paths + sketch of code]

## Tradeoffs
[bullets — what you'd give up to make this work]
```

## Reference (read before answering)

- `scss/components/_buttons.scss` — example of how our library mixins are organized today.
- `scss/_mixins.scss` — core mixins, plus the new `font-load` we just shipped.
- `src/components/Button/Button.tsx` and `Button.module.scss` — example of how a React component consumes a mixin today.
- `src/app/docs/recipes/page.tsx` — example of how recipe pages currently compose components.
- `scss/_utilities.scss` — current `.cia-*` utility class set.
- `scripts/theme-contract.json` — 123-token contract.
