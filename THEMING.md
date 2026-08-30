# Theming Guide

css-is-awesome is fully themeable. Pick the method that fits your stack.

## Built-in theme names

24 themes, in 8 families. Each family ships three files:

- `<family>` — dual-mode, both light and dark in one file via native `light-dark()`
- `<family>-light` — light only
- `<family>-dark` — dark only

The families are `boilerplate`, `sketchbook`, `press`, `prism`, `cupertino`,
`glass`, `graphite`, `terminal`. (`terminal` is dark-only by design — CRT
phosphor; `terminal-light` is its daylight companion.)

### The selector model — why `data-theme` is usually optional

Every theme file emits:

```css
:root, :root[data-theme="press-dark"] { … }
```

The bare `:root` half means **dropping a single theme file in restyles the page
with no markup change**. Link it, or copy it over your `theme.css`, and you're
done — you do *not* need to set `<html data-theme="…">` to match.

`data-theme` is still **required** for the all-in-one bundle (`public/theme.css`),
which carries all 24 themes in one file. There the bare `:root` is omitted, and
the attribute is the only thing distinguishing one theme from another:

```html
<link rel="stylesheet" href="/theme.css">
<html data-theme="press-dark">
```

If you're authoring your own theme with the `theme()` mixin, the same switch is
the `$standalone` argument:

```scss
@mixin theme($name, $scheme: light dark, $standalone: true) { … }
```

`$standalone: true` (the default) emits `:root, :root[data-theme="<name>"]`.
Pass `$standalone: false` when the theme is going into a multi-theme bundle.

### Library defaults sit under `:where(:root)`

cia's own default token values emit under `:where(:root)`, specificity `0,0,0`.
Any theme declaration — `:root`, `[data-theme]`, whatever — outranks them
regardless of load order. That's `:where()`, deliberately, not `@layer`; cia
never asks a consumer to adopt layers.

See [`CHANGELOG.md`](./CHANGELOG.md) for the timeline and
[`MIGRATION.md`](./MIGRATION.md) for upgrade steps.

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

Load this *after* the theme file — a theme's `:root` block and your `:root`
block have the same specificity, so source order decides.

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

  /* Spacing — the numbered scale is the source of truth */
  --space-4: 1.25rem;
}
```

### Spacing is themeable

Set the **numbered** scale (`--space-0` … `--space-9`). That's what
`cia.space(4)` compiles to — `var(--space-4)` — so changing `--space-4` changes
every component that asks for step 4.

The t-shirt names (`--space-2xs/xs/sm/md/lg/xl`) are optional aliases, emitted
as *references* into that scale:

```css
--space-xs: var(--space-1);
--space-sm: var(--space-2);
--space-md: var(--space-4);
--space-lg: var(--space-5);
--space-xl: var(--space-6);
```

So they follow the numbered scale automatically — you rarely need to set them.
Setting `--space-md` to a literal only re-points that one alias; it does not
change what `space(4)` resolves to.

### Component shape tokens

`--btn-radius`, `--card-radius`, `--input-radius`, `--modal-radius`,
`--badge-radius` and `--tag-radius` are what the components actually read, and
they cascade from the generic scale by default:

```css
--btn-radius: var(--radius-md, 0.25rem);
```

Move `--radius-*` to reshape everything; set one component token to make a
single exception. (There is no `--radius-button` / `--radius-card` /
`--radius-input` / `--radius-modal` / `--radius-avatar` / `--radius-badge` —
those names were removed because nothing read them.)

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
| `--*-radius` | `btn`, `card`, `input`, `modal`, `badge`, `tag` — optional, default to the `--radius-*` scale |
| `--shadow-*` | `sm`, `md`, `lg`, `xl`, `2xl`, `inner`, `none` |
| `--space-*` | `0` through `9` (the scale themes declare) — plus optional aliases `2xs`, `xs`, `sm`, `md`, `lg`, `xl` |
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

Use `data-theme` attributes for brand + mode combinations. Scope them the way
cia's own themes do — `:root[data-theme="…"]`, specificity `0,2,0` — so they
outrank any bare `:root` block from a dropped-in theme file:

```css
:root[data-theme="brand-a-light"] {
  --brand-primary: #E11D48;
  --action-primary-default: #E11D48;
  --action-primary-hover: #BE123C;
  --action-primary-active: #9F1239;
}

:root[data-theme="brand-a-dark"] {
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

## Theme Switching

**cia ships zero JavaScript.** There is no `ciaTheme` object and no
theme-switching script in the package — switching is four lines you own.

### You may not need to switch at all

A dual-mode theme (the unsuffixed ones: `sketchbook`, `prism`, `glass` …)
already follows the operating system. Its colours are `light-dark()` pairs and
its `color-scheme` is `light dark`, so light and dark both work with no
attribute, no script, and no listener. Ship one file and you are done.

You only need the code below to let a user override the OS — a manual
light/dark toggle, or a picker across several themes.

### Switching modes

Set `color-scheme` on the root element:

```js
document.documentElement.style.colorScheme = 'dark';   // or 'light', or '' for auto
```

### Switching themes

Set the attribute. This requires the multi-theme bundle
(`public/theme.css`), which carries every theme keyed by `data-theme`:

```js
document.documentElement.dataset.theme = 'prism';
```

With a single theme file you do not need this — the file's bare `:root`
already applies. See [The selector model](#the-selector-model--why-data-theme-is-usually-optional).

### Avoiding the flash

Persisting a choice means reading it before first paint. Inline this in
`<head>`, above your stylesheet links — an external script would load too late
and the wrong theme would paint first:

```html
<script>
  try {
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.dataset.theme = t;
    const m = localStorage.getItem('mode');
    if (m) document.documentElement.style.colorScheme = m;
  } catch (e) { /* private mode — fall through to the default */ }
</script>
```

Then write to `localStorage` whenever the user chooses. That is the whole
feature; a dependency would not make it shorter.

---

## Figma Token Sync

Import `figma-tokens/tokens.json` into [Tokens Studio for Figma](https://tokens.studio/) to keep design and code in sync. The JSON follows the Tokens Studio format with `value` and `type` fields.
