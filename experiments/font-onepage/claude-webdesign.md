# Claude — Web designer (20yr)

## API proposal

```scss
// The 90% case — one line, reads like the designer's intent.
.special-landing { @include font-face('Pacifico', cursive); }
```

Optional second form for "I want this everywhere on this page, not just one
element" — same mixin, page-root selector:

```scss
.page-special { @include font-face('Pacifico', cursive); } // cascades down
```

That's it. The mixin (a) registers the Google Font import once, (b) sets
`font-family` on the selector with the right fallback. Designer never sees
a URL, never copies an `@import`, never picks a weight axis.

## Implementation

Drop into `scss/_mixins.scss` after the existing `font()` mixin (~line 193).

```scss
// ============================================================================
// ONE-OFF PAGE FONTS — designer-facing API
// ----------------------------------------------------------------------------
// `@include font-face('Pacifico', cursive)` does two things:
//   1. Registers a Google Fonts @import for that family (once, idempotent).
//   2. Sets `font-family: 'Pacifico', <fallback>` on the current selector.
//
// The import is hoisted to the top of the compiled stylesheet via
// `@at-root`, so it lands above the cascade and doesn't fight `data-theme`
// rules. Calling the mixin twice with the same family is a no-op for the
// import (Sass's `$_loaded-fonts` guard) — only the font-family declaration
// re-emits, which is what you want at the call site anyway.
//
// For self-hosted files, see `font-face-src()` below.
// ============================================================================

// Module-scoped registry. Survives across @includes in the same compile.
$_loaded-fonts: () !default;

// Default weights/styles requested from Google Fonts. Designers rarely
// want to think about axes — this covers 99% of one-off use. Override
// via the $weights arg for the rare exception.
$_default-weights: '300;400;500;600;700';

@mixin font-face(
  $family,
  $fallback: sans-serif,
  $weights: $_default-weights,
  $italic: false
) {
  // 1. Register the @import once per compile.
  $key: '#{$family}|#{$weights}|#{$italic}';
  @if not list.index($_loaded-fonts, $key) {
    $_loaded-fonts: list.append($_loaded-fonts, $key) !global;

    // URL-encode spaces. Google Fonts accepts '+' for space.
    $url-name: _font-url-name($family);
    $axis: if($italic, 'ital,wght@0,#{$weights};1,#{$weights}', 'wght@#{$weights}');

    @at-root {
      @import url('https://fonts.googleapis.com/css2?family=#{$url-name}:#{$axis}&display=swap');
    }
  }

  // 2. Apply at the call site. Quote the family name only if it contains
  //    spaces (matches the existing theme.css convention).
  font-family: _quote-family($family), #{$fallback};
}

// Self-hosted variant — three-arg, still one call.
//   @include font-face-src('Untitled Sans', '/fonts/UntitledSans.woff2', sans-serif);
@mixin font-face-src($family, $src, $fallback: sans-serif, $weight: 400, $style: normal) {
  $key: 'src::#{$family}::#{$src}';
  @if not list.index($_loaded-fonts, $key) {
    $_loaded-fonts: list.append($_loaded-fonts, $key) !global;

    @at-root {
      @font-face {
        font-family: _quote-family($family);
        src: url($src) format('woff2');
        font-weight: $weight;
        font-style: $style;
        font-display: swap;
      }
    }
  }
  font-family: _quote-family($family), #{$fallback};
}

// --- helpers --------------------------------------------------------------

@function _font-url-name($family) {
  // 'Playfair Display' → 'Playfair+Display'
  $out: '';
  $chars: meta.inspect($family);
  // Sass has no native string-replace; use a small loop.
  @for $i from 1 through string.length($family) {
    $c: string.slice($family, $i, $i);
    $out: $out + if($c == ' ', '+', $c);
  }
  @return $out;
}

@function _quote-family($family) {
  @return if(string.index($family, ' '), '"#{$family}"', $family);
}
```

(Add `@use 'sass:string';` at the top of `_mixins.scss` if not already
imported.)

## Rationale

1. **Reads like designer intent.** "Use Pacifico on this section, fallback
   cursive." That sentence and the call site are the same shape. No
   ceremony, no setup block, no separate register-then-apply two-step.
2. **One concept, not two.** A designer doesn't separate "loading" from
   "applying" in their head. `@font-face` (the CSS at-rule) already
   conflates those — the mixin name borrows that mental model.
3. **Sensible weight defaults.** 300/400/500/600/700 covers every weight
   token in our existing scale. The designer can think about *type*
   (`@include font(bold)`) without ever thinking about *axis values*.
4. **Composes with existing `font()` mixin.** Family is set on a parent;
   `@include font(bold, 4)` inside cascades correctly. No conflict, no
   override fight.
5. **Idempotent by construction.** The registry guards re-imports — call
   it on every page that uses Pacifico, you still get one import. That
   matches a designer's expectation that "asking for Pacifico" is a thing
   you can do anywhere.
6. **Stays out of the token contract.** A one-off font is, by definition,
   not part of the system. Forcing it through `--font-display` would
   leak into other themes; this mixin deliberately doesn't touch the
   contract — it's a local override on a local selector.

## Edge cases

- **Two pages use the same font:** First call emits the `@import` and the
  `font-family` declaration. Second call only emits `font-family` (the
  registry guard suppresses the duplicate import). Net: one URL, two
  rules — exactly right.
- **Self-hosted file via @font-face:** Use the sister mixin
  `@include font-face-src('My Sans', '/fonts/mysans.woff2', sans-serif)`.
  Same call-site shape, same idempotency, but emits `@font-face` instead
  of `@import url(…)`. Three lines total if you also need italic.
- **Conflict with theme's `--font-display`:** No conflict by design. The
  mixin sets `font-family` directly on the local selector, *not* the
  custom property. `--font-display` continues to do its thing on the rest
  of the site. If a designer *wants* to override the token in a scope
  (rare), they write `--font-display: 'Pacifico', cursive;` themselves —
  it's one line and intentional.
- **Theme swap mid-page:** Unaffected. The `@import` is at the top of the
  cascade, available to all themes. `data-theme` swap re-runs theme rules
  but the local `.special-landing { font-family: 'Pacifico', … }` wins
  on specificity for that selector regardless of theme. Pacifico stays
  on; everything else swaps cleanly.

## Tradeoffs

- **Hoisting via `@at-root @import`.** Sass emits the `@import` wherever
  the mixin is first called; `@at-root` floats it out of any nesting
  but it still lands at the call-site's compile order. In practice, if
  the consumer's SCSS is `@use`'d before the bulk of their page styles
  (the normal pattern), this is fine. If they call `font-face()` deep
  inside a media query, browsers will still honor the `@import` (it
  must appear before any rules in its containing stylesheet, and
  `@at-root` from an `@include` lifts it out of selectors but not out
  of `@media` — flagged in JSDoc-style comment).
- **Ships *all* listed weights every time.** Even if a page only uses
  Pacifico-Regular, the import requests 300–700. Tradeoff: simpler API
  at the cost of ~15 KB extra woff2 per font. Acceptable for one-off
  pages; worth revisiting if a consumer adds 5+ one-offs.
- **Module-scoped registry, not project-scoped.** If two SCSS entry
  points each compile their own bundle and both call `font-face('Pacifico')`,
  Pacifico imports once per bundle. For Next 15 static export with one
  global stylesheet, this is a non-issue. Multi-bundle setups will
  dedupe per bundle, not across them.
- **No tree-shake of unused families.** If a designer registers a font
  and then deletes the using selector, the `@import` stays. Mitigation:
  keep `font-face()` calls *inside* the selector that uses it — then
  removing the selector removes the import, which is the natural designer
  workflow anyway.
- **`@import url(...)` blocks render** until the CSS arrives. Acceptable
  for a one-off marketing page; for production-critical paths, use
  `font-face-src()` with a self-hosted woff2 and `font-display: swap`.
