# Theming Guide

css-is-awesome is fully themeable. Pick the method that fits your stack.

## Built-in theme names (v0.7+)

Theme names use a `-light` / `-dark` mode suffix:

- `sketchbook-light` (default — also matches `:root:not([data-theme])`)
- `press-light`
- `graphite-dark`
- `glass-light`
- `cupertino-light`
- `terminal` — intentionally single-mode, CRT phosphor by design

The unsuffixed v0.6 names (`sketchbook`, `press`, `graphite`, `glass`,
`cupertino`) are kept as backward-compat aliases through 0.7.x and removed in
v0.8. See [`MIGRATION.md`](./MIGRATION.md) for the migration steps and
[`CHANGELOG.md`](./CHANGELOG.md) for the timeline.

---

## Quick Brand Swap (3 lines)

Replace the default Royal Blue brand with your own colors — just set these CSS custom properties:

```css
:root {
  --brand-primary: #E11D48;
  --action-primary-default: #E11D48;
  --action-primary-hover: #BE123C;
}
```

That's it. Every button, link accent, and focus ring now uses your brand color.

---

## Method 1: CSS Custom Properties (Runtime)

Override any token at `:root`. Works with the compiled CSS — no build step needed.

```css
:root {
  /* Brand */
  --brand-primary: #E11D48;
  --brand-primary-hover: #BE123C;
  --brand-primary-active: #9F1239;

  /* Actions (tie to brand) */
  --action-primary-default: #E11D48;
  --action-primary-hover: #BE123C;
  --action-primary-active: #9F1239;

  /* Typography */
  --font-primary: "Poppins", sans-serif;

  /* Shape */
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Spacing */
  --space-md: 1.25rem;
}
```

### Available token families

| Prefix | Examples |
|--------|----------|
| `--brand-*` | `primary`, `secondary`, `accent` + hover/active |
| `--background-*` | `default`, `subtle`, `navbar` |
| `--surface-*` | `default`, `subtle`, `muted`, `emphasis` |
| `--text-*` | `primary`, `secondary`, `muted`, `inverse`, `link` |
| `--border-*` | `default`, `subtle`, `emphasis`, `focus` |
| `--action-primary-*` | `default`, `hover`, `active` |
| `--action-secondary-*` | `default`, `hover`, `active` |
| `--success/warning/error/info-*` | `default`, `hover`, `subtle`, `text` |
| `--font-*` | `primary`, `serif`, `mono` |
| `--font-size-*` | `xs` through `6xl` |
| `--font-weight-*` | `light`, `normal`, `medium`, `semibold`, `bold`, `black` |
| `--line-height-*` | `none`, `tight`, `snug`, `normal`, `relaxed`, `loose` |
| `--radius-*` | `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `full` |
| `--shadow-*` | `sm`, `md`, `lg`, `xl`, `2xl`, `inner`, `none` |
| `--space-*` | `none`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl` |
| `--z-*` | `hide`, `base`, `dropdown`, `sticky`, `fixed`, `backdrop`, `modal`, `popover`, `tooltip`, `toast` |
| `--duration-*` | `instant`, `fast`, `normal`, `slow`, `slower` |
| `--opacity-*` | `0` through `100` |

---

## Method 2: SCSS Overrides (Compile-Time)

Override theme maps when importing. Full control over every token.

```scss
@use "css-is-awesome/scss/theme" with (
  $brand: (
    primary:        #E11D48,
    primary-hover:  #BE123C,
    primary-active: #9F1239,
    secondary:      #8B5CF6,
    secondary-hover:#7C3AED,
    secondary-active:#6D28D9,
    accent:         #06B6D4,
    accent-hover:   #0891B2,
  )
);

@use "css-is-awesome/scss/generator";
@include generator.generate-theme;
```

You can override any theme map: `$brand`, `$colors-light`, `$colors-dark`, `$fonts`, `$radius`, `$shadows-light`, `$shadows-dark`.

---

## Method 3: Multi-Brand Theming

Use `data-theme` attributes for brand + mode combinations:

```css
[data-theme="brand-a-light"] {
  --brand-primary: #E11D48;
  --action-primary-default: #E11D48;
  --action-primary-hover: #BE123C;
  --action-primary-active: #9F1239;
}

[data-theme="brand-a-dark"] {
  --brand-primary: #FB7185;
  --action-primary-default: #FB7185;
  --action-primary-hover: #F43F5E;
  --action-primary-active: #E11D48;
  --background-default: #0A0A0A;
  --surface-default: #151515;
  --text-primary: #FFF;
  --border-default: #2A2A2A;
}
```

Switch brands in JS:

```js
document.documentElement.setAttribute("data-theme", "brand-a-dark");
```

See `scss/examples/_theming.scss` for complete Brand A (Rose) and Brand B (Teal) examples.

---

## Theme Switching (JS)

Drop `docs/theme-switch.js` into your app for automatic theme management:

```html
<script src="css-is-awesome/docs/theme-switch.js"></script>

<button onclick="ciaTheme.toggle()">Toggle dark/light</button>
<button onclick="ciaTheme.set('auto')">Use system preference</button>
```

Features:
- Persists choice in `localStorage`
- Falls back to `prefers-color-scheme` when set to `"auto"`
- No flash of wrong theme (runs synchronously on load)
- Listens for system preference changes

API: `ciaTheme.get()`, `ciaTheme.set("dark"|"light"|"auto")`, `ciaTheme.toggle()`

---

## Figma Token Sync

Import `figma-tokens/tokens.json` into [Tokens Studio for Figma](https://tokens.studio/) to keep design and code in sync. The JSON follows the Tokens Studio format with `value` and `type` fields.
