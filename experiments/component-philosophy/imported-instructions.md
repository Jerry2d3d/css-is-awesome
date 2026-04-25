---
applyTo: "app/src/components/**"
---

# Component Design Rules

These rules govern how all UI components are authored in this project. Follow every rule unless explicitly told otherwise.

---

## File Structure

- Each component lives in its own folder under `src/components/`:
  ```
  src/components/ImagePicker/
  ├── ImagePicker.tsx
  ├── image-picker.types.ts
  └── image-picker.module.css
  ```
- **Component file** — PascalCase: `ImagePicker.tsx`
- **Types file** — kebab-case of the component name: `image-picker.types.ts`
- **Style module** — kebab-case of the component name: `image-picker.module.css`

The types file is optional and only needed if the component has complex props or internal types. The style module is required for every component, even if it's empty, to enforce the styling rules.
---

## Styling

### Vanilla CSS Modules only

- All styles use `.module.css` files. No SCSS, no CSS-in-JS, no Tailwind.
- Import as: `import style from './image-picker.module.css'`

### Root class matches kebab-case component name

Every component's root `<section>` gets a class from the module that is the kebab-case form of the component name:

```tsx
<section className={style['image-picker']}>
```

### Fully nested selectors

CSS must be written with nesting so the hierarchy is readable from the stylesheet alone:

```css
section.image-picker {
  /* root styles */

  > article {
    /* direct child article */

    > header {
      /* header inside article */
    }
  }
}
```

### Prefer tag selectors over class names

Do not add a class when `> TagName` accomplishes the same result. Only introduce a class when you need to distinguish between siblings of the same tag or when the tag alone is ambiguous.

```css
/* Good */
section.image-picker {
  > article {
    > header { ... }
    > ul { ... }
  }
}

/* Bad — unnecessary classes */
section.image-picker {
  > .article-wrapper {
    > .header-section { ... }
    > .list-section { ... }
  }
}
```

### Minimal markup — use pseudo-elements

Prefer `::before` and `::after` pseudo-elements over adding extra HTML elements for decorative or layout purposes. Fewer DOM nodes is always better.

### No `!important`

Never use `!important` in CSS. The only exception is when overriding a third-party component's styles that already use `!important` — fighting `!important` with `!important` is acceptable in that case.

### Margins and padding

Prefer using `block` and `inline` properties for margin and padding instead of individual directional properties. This has better compatibility with RTL and TTB (top-to-bottom) layouts.
Never ever use Triad values, i.e. `margin: 1rem 2rem 1rem;` — this is ambiguous and error-prone, as the bottom value may be accidentally changed without realizing it also changes the top value.

```css
/* Good */
margin-block: 1rem;
margin-inline: 2rem;
padding-block: 0.5rem;
padding-inline: 1rem;

/* Bad */
margin-top: 1rem;
margin-right: 2rem;
margin-bottom: 1rem;
margin-left: 2rem;
padding-top: 0.5rem;
padding-right: 1rem;
padding-bottom: 0.5rem;
padding-left: 1rem;
```

### Sizing unit priority

Use units in this order of preference: **rem → em → vw/vh → ch**

- `rem` for most spacing and font sizes (consistent scale)
- `em` for sizes relative to the current element's font size
- `vw`/`vh` (or `svw`/`svh`) for viewport-relative layout (values are not fibonacci, but rather should be common fractions of the viewport: 25vw, 50vw, 75vw, etc.)
- `ch` for text-width-based sizing
- `%` only for specific cases where the size must be a percentage of the parent container (e.g. width: 100% to fill the parent, values are not fibonacci, but rather common fractions: 25%, 50%, 75%)

### Fibonacci number convention

Use Fibonacci numbers for spacing, sizing, and font values. Both the whole-number part and the decimal part are evaluated **independently** — each side of the decimal point must itself be a single Fibonacci digit (0, 1, 2, 3, 5, 8) or a Fibonacci number (13, 21, 34…). This signals that the value is **approximate and safe to adjust** if requested.

Numbers that do **not** follow this rule are treated as **intentional, exact values** that should not be changed without explicit instruction.

Valid Fibonacci values (each side of the decimal is a Fibonacci number):
```
Whole numbers:  1, 2, 3, 5, 8, 13, 21, 34
Decimals:       .1, .2, .3, .5, .8
Combined:       2.5, 1.8, 5.1, 3.2, 8.3, 13.5
```

Invalid values (at least one side is not a Fibonacci number):
```
Whole numbers:  4, 7, 9
Decimals:       .125, .875, .625
Combined:       3.4, 5.7, 6.9, 123.123
```

Examples in CSS:
```css
padding: 1.3rem;          /* fib.fib, safe to adjust */
font-size: 2.1rem;        /* fib.fib, safe to adjust */
gap: 0.5rem;              /* fib, safe to adjust */
border-radius: 0.3em;     /* fib, safe to adjust */
width: 34rem;             /* fib, safe to adjust */
```

Examples of intentional fixed values:
```css
height: 2.3125rem;        /* not fib, do not change */
border: 1px solid;        /* 1px is a hard boundary */
```

---

## HTML & Semantic Structure

### No same-element nesting

Never nest an element inside the same element type. This is a hard rule:

- No `<div>` inside `<div>`
- No `<span>` inside `<span>`
- No `<p>` inside `<p>`

### Element hierarchy

Use this nesting order for layout containers:

```
section → article → div
```

- `<section>` — component root, and major content groupings
- `<article>` — self-contained content blocks within a section
- `<div>` — generic grouping only when section/article are semantically wrong

Within these containers, use appropriate semantic elements: `<header>`, `<footer>`, `<nav>`, `<aside>`, `<ul>`/`<ol>`/`<li>`, `<figure>`/`<figcaption>`, `<details>`/`<summary>`, `<dialog>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<button>`, `<time>`, etc.

### Component root is always `<section>`

Every component returns a `<section>` as its outermost element (or `null` / fragment in guard-clause early returns). The root section always carries the module class:

```tsx
export default function ImagePicker(props: ImagePickerProps) {
  return (
    <section className={style['image-picker']}>
      ...
    </section>
  );
}
```

Exception: a component may return `null` for conditional non-rendering, or a `<dialog>` if the component **is** a dialog.

### Minimal HTML

Keep DOM depth as shallow as possible. Every element must earn its place — if removing it changes nothing visually or semantically, remove it.

---

## TypeScript

### Props vs Data models

- **Props** — defined with `type` keyword
- **Data models** — defined with `interface` keyword

```ts
type ImagePickerProps = {
  open: boolean;
  onSelect: (image: MediaItem) => void;
  onClose: () => void;
};

interface MediaItem {
  id: string;
  name: string;
  url: string;
}
```

### Co-located types

All types for a component live in the component's **Types file** — kebob-case: `image-picker.types.ts`, co-located in the component folder

---

## Component Authoring

### Function declarations for exported components

Use `arrow functions` for component declaration for the default export:

```tsx
const ImagePicker = (props: ImagePickerProps) => { ... };
export default ImagePicker;
```

### Arrow functions for internal helpers

Private/local functions within a component file use arrow functions:

```tsx
const handleClose = () => { ... };
const formatLabel = (name: string) => name.replace(/-/g, ' ');
```

### Event handler naming

Prefix event handlers with `handle`: `handleClose`, `handleSelect`, `handleToggle`.

### State management

- Use local `useState` for component-specific UI state (open/close, selected item, loading).
- Only introduce shared state (context, store) when multiple unrelated components need the same data.

### Conditional rendering

Use ternary expressions for inline JSX branching. Use early `return null` for guard clauses:

```tsx
if (!open) return null;

return (
  <section className={style['image-picker']}>
    {loading ? <p>Loading…</p> : <ul>...</ul>}
  </section>
);
```

### Class name joining

When combining multiple class names, join them with array syntax:

```tsx
className={[style['image-picker'], props.className].join(' ')}
```

---

## Accessibility

- Use native interactive elements (`<button>`, `<dialog>`, `<a>`) — never attach click handlers to `<div>` or `<span>`.
- All images must have `alt` text.
- Form controls must have associated `<label>` elements (via `htmlFor`).
- Use `role` and `aria-*` attributes only when native semantics are insufficient.
- Keyboard navigation must work: dialogs trap focus, escape closes overlays.
