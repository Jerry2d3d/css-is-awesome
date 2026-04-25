# Claude — Web designer (20yr)

## Q1 — Ideas that fit as-is

- **Folder-per-component** — already how `src/components/Button/` and `src/components/Tag/` work. Zero friction.
- **Fibonacci convention** — maps cleanly onto our locked numbered scale (`m.space(1..9)`). It's the same idea: numbers = "approximate, safe to nudge." We can keep the contract, just document the spirit.
- **`type` for props / `interface` for data models** — cheap consistency win. `Button.tsx` already uses inline `type ButtonProps`; we'd just lift complex ones into `*.types.ts`.
- **`handle*` event-handler prefix** — non-controversial, already partial in `Tag.tsx` (`onRemove`). Codify it.
- **No `!important`** — fits. A grep over `scss/components/*` should confirm we already comply.
- **Native interactive elements** — already enforced (`<button>` in `Button.tsx`, `<button>` for the close affordance in `Tag.tsx`).
- **Pseudo-elements over decorative DOM** — designer-friendly; nothing in our mixins blocks it.

## Q2 — Conflicts (and resolution)

- **Vanilla CSS only / no SCSS** — hard conflict with our locked mixin-first model. **Not resolvable.** SCSS is the system. We can offer a "no-SCSS path" via utilities + variant classes (Q3), but we don't ditch SCSS.
- **`*.module.css` required even when empty** — conflicts with Jerry's headline ("don't need SCSS files per component unless deviating"). **Resolvable by inverting it:** the module file becomes *optional*, not required. Default authoring path uses utilities + a generated variant class.
- **Root must be `<section>`** — conflicts with `Button.tsx` (`<button>`/`<a>`) and `Tag.tsx` (`<span>`). **Not resolvable for atomic components** — would break semantics. Keep `<section>` as guidance for *composite* components only.
- **Tag selectors over class names inside modules** — fine in vanilla CSS, but CSS Modules + tag selectors leak globally unless the root class scopes them. Our current camelCase-class style in `.module.scss` is safer for the mixin-first model. **Keep ours.**
- **kebab-case class names** — conflicts with our camelCase (`styles.itemInteractive`). **Cosmetic only;** not worth changing across 30+ components.
- **`margin-block`/`margin-inline`** — no conflict, but our utilities (`scss/_utilities.scss` lines 20-49) still emit `margin-top/right/bottom/left`. **Resolvable:** add logical-property variants (`cia-mbs-`, `cia-mbe-`, `cia-mis-`, `cia-mie-`) without removing the existing ones.

## Q3 — Consumer authoring without per-component SCSS

From a designer's chair, the call site should look the **same shape every time**, regardless of component:

```tsx
// HTML-only path (no SCSS file, no React even)
<button class="cia-btn cia-btn-primary">Save</button>
<span class="cia-tag cia-tag-removable">Beta</span>

// React path — same vocabulary, just typed
<Button variant="primary">Save</Button>
<Tag removable>Beta</Tag>
```

**Mental model:** every component has a *base class* (`cia-btn`, `cia-tag`, `cia-card`) and a flat list of *variant classes* (`cia-btn-primary`, `cia-btn-ghost`). One shape. No component is special. A junior dev guesses the class name correctly on the first try because the rule is `cia-<component>` + `cia-<component>-<variant>`.

The React layer is then a *thin* mapper: `variant="primary"` → `cia-btn-primary`. The component file disappears as a styling concern. You only reach for a `.module.scss` when the design genuinely deviates from the base mixin's vocabulary — and at that point, you're a power user, and that's fine.

## Q4 — Concrete proposal

1. **New file: `scss/_components.scss`** — auto-emit one `.cia-<component>` + `.cia-<component>-<variant>` rule per existing mixin. Sketch:

   ```scss
   // scss/_components.scss
   @use 'components/buttons' as b;
   @use 'components/feedback' as fb;

   .cia-btn          { @include b.btn-base; }
   .cia-btn-primary  { @include b.btn(primary); }
   .cia-btn-outline  { @include b.btn(outline); }
   .cia-btn-ghost    { @include b.btn(ghost); }
   .cia-btn-info,
   .cia-btn-success,
   .cia-btn-warning,
   .cia-btn-error    { /* loop via @each over status list */ }

   .cia-tag           { @include fb.tag; }
   .cia-tag-removable { @include fb.tag($removable: true); }
   ```

   This is the "build-time generator" idea from the README, but written by hand once — same effort, more legible than a script.

2. **Refactor `src/components/Button/Button.module.scss`** to *consume* the utility classes via `composes` (or just delete it and have `Button.tsx` apply `cia-btn cia-btn-primary` directly). Sketch for `Button.tsx`:

   ```tsx
   const variantClass = { default: "cia-btn", primary: "cia-btn cia-btn-primary",
                          outline: "cia-btn cia-btn-outline", ghost: "cia-btn cia-btn-ghost" }[variant];
   ```

   `Button.module.scss` becomes optional. Same for `Tag.module.scss`.

3. **Document the contract** in `experiments/component-philosophy/` (or the docs site): "every component ships as a mixin AND a `cia-<name>` utility. Consumers pick their layer."

4. **Adopt the small wins from Q1** — `*.types.ts` for components with non-trivial prop unions (e.g. `Button.tsx`'s discriminated union deserves it), `handle*` prefix lint rule.

## Tradeoffs

- **CSS bundle grows** — every mixin gets a public utility class whether you use it or not. Mitigation: tree-shake via PurgeCSS, or split into `cia-components.css` that consumers opt into.
- **Two ways to do the same thing** — `<Button variant="primary">` and `<button class="cia-btn-primary">` produce identical output. That's a *feature* for designers/static-HTML authors but a *teaching tax* for new contributors. Document which is canonical (React = canonical inside this app; utilities = canonical for outside consumers).
- **Variant explosion** — every new variant requires one line in both `_buttons.scss` (the mixin router already has it) and `_components.scss` (the new utility). Manageable; could be auto-generated later.
- **Deviation pressure relief valve** — when a designer needs something the mixin doesn't expose, they still drop a `.module.scss` and `@include btn(primary) { /* override */ }`. The escape hatch stays open. That's the win.
