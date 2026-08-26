---
title: A barrel that emits nothing
slug: a-barrel-that-emits-nothing
category: architecture
tags: sass, scss, css-modules, nextjs, api-design
audience: sass authors, library authors
excerpt: Next.js CSS Modules reject a top-level :root, so cia's authoring entry point had to print zero bytes until a mixin is called. Here is how, and what it cost.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
---

The constraint came first, and it was not negotiable.

Next.js compiles `.module.css` and `.module.scss` through css-loader in **pure** mode, where every top-level selector has to contain at least one local class or id ([Next.js CSS docs](https://nextjs.org/docs/app/getting-started/css), [css-loader `modules.mode`](https://github.com/webpack-contrib/css-loader#mode)). A bare `:root { --color: … }` has no local selector in it, so the compile fails. Not a warning — a build error.

That rules out one very common library shape: the single import that gives you everything. If your entry point emits design tokens on import, it cannot be imported from a component stylesheet. And a design system whose entry point cannot be used inside a component is a design system you have to work around.

## What cia's entry point actually did before

The documented line was `@use 'css-is-awesome' as cia;`. That resolved to `scss/main.scss`, which had two problems at once:

1. It **emits CSS** — `:root`, the reset, base element rules. Dropped into a `.module.scss`, it broke pure mode.
2. It does **not** `@forward` the mixin API. So `cia.color()` and `cia.btn()` did not resolve anyway.

The symptom people actually reported was the second one — "I can't find the right token." The cause was that there was no zero-emit authoring entry at all. Both were fixed together in [`e76dede`](https://github.com/Jerry2d3d/css-is-awesome/commit/e76dede1347e61ad8c45aa2d10c9350c919bbf85) (2026-07-04), and the two-import model was written into the docs in [`b4647cc`](https://github.com/Jerry2d3d/css-is-awesome/commit/b4647cc6f2433d6d286050f0953c66d0d25d2cd6).

## Two imports, two jobs

```scss
// app/globals.scss — a GLOBAL stylesheet, allowed to emit
@use 'css-is-awesome';        // prints :root { --… } once, plus base
```

```scss
// components/Card.module.scss — scoped, pure mode, may not emit :root
@use 'css-is-awesome/api' as cia;

.product-card {
  background: cia.color(surface-default);
  padding: cia.space(4);
  border-radius: cia.radius(md);
  @include cia.card-base($shadow: 2);
}
```

Tokens are emitted once, at the root, by the bundle or by a `<link>`ed theme file. Components import `css-is-awesome/api`, which forwards the whole mixin/function/token-map surface and prints nothing until a mixin is actually called. The package export is deliberately thin:

```json
"./api": { "sass": "./scss/api.scss" }
```

And `scss/api.scss` is only `@forward` lines plus a few re-exported maps:

```scss
@forward './system' as sys-*;
@forward './theme'  as theme-*;
@forward './generator';
@forward './mixins';            // no prefix — the main API
@forward './layout';
@forward './icons' as icon-*;
@forward './animations';        // animate() / animate-on(), CSS-Modules-safe
@forward './components';
```

The interesting line is the one that is missing. `./animations-utilities` — the `@keyframes` blocks, the `.cia-anim-*` classes, the global reduced-motion safety net — is **not** forwarded here, because it emits. It lives in `scss/_index.scss`, the kitchen-sink barrel, which is now just:

```scss
@forward 'api';
@forward './animations-utilities';
```

That derivation matters more than it looks. The authoring surface is defined exactly once. The two barrels cannot drift, because one is the other plus a single emitting module.

## Zero-emit is not the same as broken-emit

Chasing zero bytes on import surfaced a real bug that had been shipping quietly. `spinner()` and `skeleton()` declared their `@keyframes` at module top level, outside the mixin. So they leaked CSS on import — and worse, under CSS Modules the top-level `@keyframes cia-spinner-rotate` gets **renamed** to a hashed local name while the `animation:` reference inside the mixin does not. Compiles clean, animates nothing.

The fix is to co-emit them, from inside the mixin, with `@at-root`:

```scss
@mixin spinner($size: 1.25em, $thickness: 2px, $color: action-primary-default) {
  // …
  animation: cia-spinner-rotate 0.7s linear infinite;

  @at-root {
    @keyframes cia-spinner-rotate { to { transform: rotate(360deg); } }
  }
}
```

Now the keyframe and its reference are emitted together, at the same time, in the same module — so CSS Modules renames both or neither.

## The invariant is tested, not hoped for

"This barrel emits no CSS" is the kind of promise that is true on the day you write it and false four commits later, when someone adds a `@forward` to a module that happens to print a `:root`. Nobody notices until a consumer's build breaks, because the library's own build still passes.

So `npm run validate-api` compiles small Sass strings with Dart Sass and asserts on the output. Five checks, in `scripts/validate-api.mjs`:

```
✓ api barrel emits zero CSS when no mixin is called
✓ api barrel emits no :root block
✓ cia.color() resolves through the api barrel
✓ cia.btn() resolves through the api barrel
✓ cia.spinner() co-emits its keyframe + reference when called
```

Concretely: compile `@use 'api' as cia;` and require the trimmed result to be the empty string; require `/:root/` not to match; compile `.x { color: cia.color(text-primary); }` and require a `var(--` in the output; compile `.y { @include cia.btn(primary); }` and require non-empty output; compile `.spin { @include cia.spinner; }` and require **both** `@keyframes cia-spinner-rotate` and `animation: cia-spinner-rotate` to appear.

The last two are the ones that keep the invariant honest. Deleting every `@forward` from `api.scss` would pass checks 1 and 2 perfectly. Checks 3 through 5 are what stop "emits nothing" from degrading into "does nothing."

When this post was first published there was an honest gap: `validate-api` was an npm script and *not* a CI step, so the invariant depended on someone remembering to run it. A test you have to remember to run is a weaker promise than a gate.

That was closed in `dfb6f20`. `.github/workflows/ci.yml` now runs `validate-api` on every pull request, alongside `validate-icons` and `validate-package` — the last of which packs the tarball, installs it into a temp project, and compiles every documented `@use` specifier. Which turned out to matter more than expected; see [The import in our README did not work](/blog/the-import-in-our-readme-did-not-work).

## The limitation: Turbopack cannot consume it

A forwarding barrel is not free. Boiler — the showcase app, Next 16.1.1 on Turbopack for both `dev` and `build` — **cannot use `/api` at all**, and cannot use any other cia forwarding barrel either.

Turbopack's Sass integration collapses the module graph. Because `_layout.scss` and every `components/*` file internally `@use './mixins'`, forwarding `./mixins` + `./layout` + `./components` from one place makes Turbopack merge them and raise cascading `Two forwarded modules both define a mixin named X` errors. Stock Dart Sass — sync, async, package importer — compiles the same file without complaint. Namespace prefixes would fix it only by destroying the flat `cia.color` / `cia.btn` surface that is the point.

So Boiler imports the **leaf**: `@use 'css-is-awesome/scss/mixins' as cia;`. Leaf modules contain no `@forward`, so Turbopack handles them. The call sites are byte-identical; only the specifier changes, and component mixins outside `_mixins.scss` need their own leaf import. Decision, 2026-07-04: document the workaround, don't chase a Turbopack fix. The two-import split still holds either way — tokens at the root, mixins per component.

## The trade-off

Two imports is more ceremony than one. Every consumer now has to know that the global stylesheet and the component stylesheet take different lines, and that mixing them up produces a build error rather than a nudge.

It is worth it because the alternative is worse in a way that compounds. One import means either the entry point emits — and is banned from every scoped stylesheet in a Next.js app — or the tokens are duplicated into every component that imports it, once per file, with no deduplication. Two imports buys the exact separation CSS already wants: values declared once at the root, consumption everywhere else.
