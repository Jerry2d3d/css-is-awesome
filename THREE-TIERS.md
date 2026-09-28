# Three Tiers, One Source of Truth

css-is-awesome ships three authoring surfaces for the same components. Pick the tier that matches your stack — they all resolve to the same mixin output, so styling stays consistent across an app that mixes them.

> One router mixin per component. Three doors into it.

---

## Tier 1 — Drop-in CSS + HTML (no build)

```html
<link rel="stylesheet" href="themes/sketchbook/theme.css">
<link rel="stylesheet" href="css-is-awesome.min.css">

<main class="cia-mx-auto cia-p-6 cia-flex-col cia-gap-4">
  <h1>Welcome</h1>
  <p class="cia-text-text-secondary">Swap the theme file and this re-skins.</p>
  <div class="cia-flex cia-gap-2 cia-items-center">
    <span class="cia-text-lg">Utilities compose with your own CSS.</span>
  </div>
</main>
```

**Audience:** designers, marketing pages, prototypes, anyone without a build step.
**Rules:** one class per element. No BEM, no `__element` / `--modifier` chains. One CSS file, one theme file, ship.

---

## Tier 2 — SCSS mixins + HTML (with build)

```scss
// component styles (Card.module.scss, app.scss, …)
@use 'css-is-awesome/api' as cia;   // one zero-emit barrel — the whole API

.hero-cta {
  @include cia.btn(primary, $px: 6, $r: full);
  @include cia.elevation(2);
}
.checkout-cancel { @include cia.btn(outline); }
.product-card    { @include cia.card-base($shadow: 2); }
```

> Prefer granular imports? `@use 'css-is-awesome/scss/components/buttons' as b;` etc. still work — the `/api` barrel just bundles them under one namespace.

```html
<a class="hero-cta" href="/buy">Buy now</a>
<a class="checkout-cancel" href="/cart">Back to cart</a>
<article class="product-card">…</article>
```

**Audience:** product teams that want their own domain vocabulary in markup (`hero-cta`, `product-card`) without giving up a design system.
**Rules:** author your own class names. Variant is an argument to the mixin, not a class modifier. Every parameter overridable.

### The rule that makes Tier 2 work: change the input, not the output

Your class name, cia's mixin inside it, and **every customization goes through the mixin's arguments**. The mixin is a knob-board — each look-and-feel dimension is an input, so restyling never means writing the CSS the mixin already controls.

```scss
// ✅ change the knob
.filter-bar { @include cia.flex($direction: column, $align: start, $gap: 2); }

// ❌ call the mixin, then fight it
.filter-bar {
  @include cia.flex($justify: between);
  align-items: flex-start;   // $align: start already does this
  flex-direction: column;    // $direction: column already does this
}
```

Both compile. The second is worse in a way that compounds: those two hand-written lines are now invisible to the design system. They don't follow a token, they don't respond to a theme swap, and the next person can't tell whether they were a deliberate exception or a missing argument.

**If a visual dimension can only be reached by overriding in CSS, that is a missing input — add it to the mixin.** That's the rule cia holds itself to, and it's why `space()`, `transition()` and `animate()` all accept raw values as well as scale keys: a consumer should never have to abandon a mixin to keep one specific number.

### Where raw CSS *is* correct

Not everything is cia's job, and pretending otherwise produces worse code than writing plain CSS. Write ordinary CSS when the thing you are styling is genuinely yours:

- **Bespoke identity** — a rotated stamp, a brand illustration, a logo's overflow trick. Preserve the exact values; don't token-swap something whose specific-ness is the point.
- **One-off geometry** — a `clip-path`, a `grid-template-areas` for a layout only this page has, an animation of your own product's mascot.
- **Anything cia has no mixin for.** Reach for a mixin first, check `get_mixin` over MCP if unsure, and write CSS when the answer is genuinely "there isn't one."

The split to hold in your head: **cia owns the system values — colour, spacing, type, radius, motion, elevation. You own the composition and the things that make your product look like itself.** Mixing the two is fine. Re-implementing the first half by hand is the mistake.

---

## Tier 3 — Bare tags (opt-in Pico-mode)

```scss
// app.scss — one line styles the whole site
@use 'css-is-awesome/scss/recipes/bare-tags';
```

```html
<h1>Welcome</h1>
<button>Save</button>
<table>…</table>
<input type="email">
```

**Audience:** content-heavy sites, blog posts, READMEs rendered as HTML, anywhere the author doesn't want to think about classes.
**Rules:** zero classes required. The recipe styles every common bare tag wrapped in `:where()` (specificity `0,0,0`) — no `@layer`. Any selector you add — even another bare tag — wins automatically.

---

## The same button across the two tiers that produce one

Tier 1 is not in this list, and that is the point: **utilities do not make a
button.** They space it, align it and animate it once something else has
styled it.

```html
<!-- Tier 2: your class, cia's mixin -->
<button class="save-btn">Save</button>
```
```scss
.save-btn { @include b.btn(primary); }
```
```html
<!-- Tier 3: no class at all - the bare-tags recipe styles the element -->
<button>Save</button>
```
```scss
@use 'css-is-awesome/scss/recipes/bare-tags';
```

Both resolve to the same `btn(primary)` output, so a Tier 3 bare `<button>` and
a Tier 2 `.save-btn` render identically and can sit in the same app. Both need
a Sass build. Without one, a stylesheet drop-in gives you tokens, resets and
the 746 utilities — and you style the button yourself.

---

## Architecture

- **Single source of truth.** One mixin per component (`btn`, `card-base`, `input-base`, `alert`, …) with private internals.
- **Router pattern.** `btn(variant)` dispatches to private mixins. Variant is an arg, not a class modifier — that's why there's no BEM.
- **Tier 1** = the 746 standalone utility classes for spacing, layout, text
  and animation (`.cia-p-md`, `.cia-gap-4`, `.cia-text-center`,
  `.cia-anim-fade-in`). **The router output is NOT baked into classes** — there
  is no `.cia-btn-primary`, no `.cia-card`, no `.cia-container`, and no
  prebuilt bare-tags stylesheet. A consumer who wants a styled button without a
  Sass build uses Tier 3 on bare tags, not a class.
- **Tier 2** = direct router `@include` in author SCSS under custom class names.
- **Tier 3** = router `@include` applied to bare tag selectors via the recipe.

Change the router, every tier updates. Add a variant once, every tier gets it.

---

## Picking a tier

| You're building… | Use |
|---|---|
| A landing page, prototype, or a static site with no build | Tier 1 |
| A product app where designers want semantic class names | Tier 2 |
| A content site, blog, or generated HTML where classes are noise | Tier 3 |
| A React/Next app | Tier 4 — see `src/` and the docs site |

Tiers compose. A Tier 2 product can drop in a Tier 3 recipe for its `/blog` route, and a Tier 1 marketing page can sit next to a Tier 4 app under the same theme file.

---

## See also

- [README.md](./README.md) — install, quick start, scripts
- [THEMING.md](./THEMING.md) — token contract, custom themes, dark mode
- [css-is-awesome.instructions.md](./css-is-awesome.instructions.md) — authoring rules in one page
