---
name: my-recipe-slug
description: One sentence describing what this recipe builds.
category: overlay
complexity: medium
cia-version: ">=1.0.0"
---

<!--
Copy this file to <your-slug>.md (no leading underscore) and fill in each
section. Required: name, description, category, complexity, cia-version
frontmatter + all H2 sections below up to "Framework examples". Optional
sections (Variants, Pitfalls, Related recipes) can be dropped if empty.

See ./README.md for the full schema spec.
-->

## Use this when

A short paragraph (1-3 sentences) describing the consumer scenario. If the
reader's situation doesn't match what you describe, they should bail and
look elsewhere. Be specific about what this recipe IS and ISN'T.

## Structure (raw HTML)

The markup with `data-slot` attributes for consumer hooks. Framework-agnostic;
the consumer adapts to JSX / template / Svelte syntax.

```html
<element data-cia-recipe="my-recipe-slug">
  <slot data-slot="title"></slot>
  <slot data-slot="body"></slot>
</element>
```

## Styling (cia mixins)

```scss
@use 'css-is-awesome' as cia;

.my-thing {
  @include cia.some-mixin(variant);
}
.my-thing [data-slot="title"] {
  @include cia.type(heading-2);
}
```

Show the minimum to make it work. Cross-link to mixin docs for parameter
detail. Use consumer-chosen class names (`my-thing`), never `cia-*`.

## Interactivity

Describe the behavior. Prefer native browser primitives (`<dialog>`, popover
API, `:has()`, radio + `:nth-of-type()`). JS only where the native primitive
genuinely can't do the job.

- Native: which APIs / pseudo-classes do the work
- JS: when consumer needs a script, what it does, how small it can be
- Edge cases: SSR safety, hydration timing, mobile gestures

## A11y checklist

Concrete, testable items. Each item references the WCAG SC or ARIA pattern.

- [ ] item 1 — (WCAG 2.2 SC X.X.X reference or ARIA pattern URL)
- [ ] item 2
- [ ] item 3

## Framework examples

Minimum 4 subsections: React, Vue, Svelte, vanilla (Web Component preferred
for vanilla). Each example must be runnable code, not pseudocode.

### React

```tsx
// runnable React example
```

### Vue

```vue
<!-- runnable Vue example -->
```

### Svelte

```svelte
<!-- runnable Svelte example -->
```

### Vanilla (Web Component)

```js
// runnable Web Component example
```

## Variants

(optional) Common adaptations. One sub-block per variant with the styling delta.

## Pitfalls

(optional) Known gotchas — SSR, browser compat, focus management edge cases.

## Related recipes

(optional) Cross-link to other recipes.
