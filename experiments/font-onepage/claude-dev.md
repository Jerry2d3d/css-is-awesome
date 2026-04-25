# claude-dev — One-off page font (20yr software developer)

> Persona bias: minimal API surface, single responsibility, predictable
> signatures, no hidden state, fail loudly on bad input. Two functions
> max. `@error` on misuse. Idempotency without runtime tricks.

## API proposal

Two mixins. Two responsibilities. No magic.

```scss
// 1. Register the font. Idempotent. Emits @import once per compile.
@include font-load('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

// 2. Apply the registered font. @error if not loaded.
.special-landing { @include font-family('Pacifico'); }
```

That is the consumer-facing surface. Two calls, two arguments each. The
registration is the only thing that touches global CSS; `font-family`
is a scoped property write.

The existing `@mixin font($type, $size, $lh, $ls, $family)` is extended
so its `$family` argument also accepts a registered name — making the
combined case symmetric:

```scss
.special-landing h1 { @include font(bold, 7, $family: 'Pacifico'); }
```

That is it. No new tokens. No generated classes. No build step.

## Implementation

```scss
// scss/_fonts.scss
@use "sass:map";
@use "sass:meta";
@use "sass:list";

// Module-level state. Lives for the duration of one Sass compile.
// Resets to () on every fresh build — there is no cross-compile state.
$_loaded-fonts: () !default;

// Internal: register a (name → url) pair, deduped.
@function _font-register($name, $url) {
  @if not meta.type-of($name) == 'string' {
    @error "font-load: name must be a string, got #{meta.type-of($name)} (#{$name}).";
  }
  @if not meta.type-of($url) == 'string' or list.length($url) == 0 {
    @error "font-load: url must be a non-empty string for `#{$name}`.";
  }
  $_loaded-fonts: map.set($_loaded-fonts, $name, $url) !global;
  @return $_loaded-fonts;
}

// Public: load a Google Font (or any @import-able stylesheet).
//   @include font-load('Pacifico',
//     'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
//
// Idempotent: calling twice with the same ($name, $url) emits one @import.
// Calling twice with the same $name and a *different* $url is an @error.
@mixin font-load($name, $url) {
  $existing: map.get($_loaded-fonts, $name);
  @if $existing and $existing != $url {
    @error "font-load: `#{$name}` already registered with a different URL. "
         + "Existing: #{$existing}. New: #{$url}. "
         + "Pick one URL per font name.";
  }
  @if not $existing {
    $_dummy: _font-register($name, $url);
    // Emit the @import exactly once, the first time this name is loaded.
    @at-root {
      @import url(#{$url});
    }
  }
}

// Public: apply a registered font. Hard fail if not loaded.
//   .x { @include font-family('Pacifico'); }
@mixin font-family($name, $fallback: sans-serif) {
  @if not map.has-key($_loaded-fonts, $name) {
    @error "font-family: `#{$name}` is not loaded. "
         + "Call @include font-load('#{$name}', '<url>') first. "
         + "Loaded fonts: #{map.keys($_loaded-fonts)}.";
  }
  font-family: '#{$name}', #{$fallback};
}

// Public helper for theme tokens — explicitly distinct from font-family().
// Use this when a one-off page wants to *override* a theme token in scope,
// without registering a new global font.
//   .special-landing { @include font-token-override(display, 'Pacifico'); }
@mixin font-token-override($token, $name) {
  @if not map.has-key($_loaded-fonts, $name) {
    @error "font-token-override: `#{$name}` is not loaded.";
  }
  --font-#{$token}: '#{$name}';
}
```

The existing `@mixin font($type, $size, $lh, $ls, $family)` is patched
in one place so that a string `$family` argument is validated against
the registry:

```scss
// scss/_mixins.scss — replace the `@if $family` line
@if $family {
  @if meta.type-of($family) == 'string' and not map.has-key(fonts.$_loaded-fonts, $family) {
    @error "font(): family `#{$family}` is not loaded. "
         + "Call @include font-load('#{$family}', '<url>') first.";
  }
  font-family: $family;
}
```

That is the entire proposal: ~50 lines, two public mixins, one
opt-in helper for theme override.

## Rationale

**Why two mixins, not one.** `font-load` has a side effect (emits
`@import`). `font-family` does not. Folding them together would mean
every apply-site has the URL hardcoded — every page would re-declare
the same font URL, and a typo in one URL would silently emit a second
`@import`. Splitting load from apply makes the side effect explicit and
the apply site cheap.

**Why a module-level map, not a CSS custom property.** The theme
contract (`scripts/theme-contract.json`) declares `--font-display`,
`--font-script`, `--font-sans`, `--font-serif`, `--font-mono`,
`--font-primary` as required tokens. A one-off page font is by
definition *outside* the contract — promoting it to `--font-onepage-*`
would either (a) require a contract amendment for every novel font, or
(b) leak custom properties that aren't validated. Both are wrong. The
font's identity stays in Sass, where it belongs to the consumer's page,
not to the theme.

**Why `@error` and not `@warn`.** A typo'd font name silently falling
back to `sans-serif` is the worst possible failure: the page ships, looks
slightly wrong, nobody notices for three weeks. Hard fail at compile.
Sass `@error` aborts the build with the typo and the list of loaded
fonts in the message — the consumer sees the fix in their terminal.

**Why composition with the existing `font()` mixin.** The user already
knows `@include font(bold, 7)`. Adding a third concept ("you must use
`font-family` for one-off, but `font` for everything else") is a tax.
Letting `$family` consume a registered name keeps one entry point.

**Why no generated classes.** `cia-font-pacifico` would mean
*everyone* who loads Pacifico gets a class in the bundle whether they
need it or not. The consumer scoping the rule themselves
(`.special-landing { @include font-family(…) }`) keeps the bundle
honest.

## Edge cases

**Two pages using the same font.** Both call
`@include font-load('Pacifico', '<url>')`. The map check sees the name
is already registered with the same URL — the `@import` is skipped on
the second call. Output contains exactly one `@import`. Idempotent.

**Two pages using the same font with different URLs.** A typo, or one
page picking `&display=swap` and the other `&display=block`. The map
check sees a URL mismatch and `@error`s with both URLs visible. Build
fails until the consumer picks one. This is correct behaviour: one
name, one URL — anything else is a bug waiting to happen.

**Self-hosted (`@font-face`) font.** Different mixin, on purpose.
`font-load` takes a URL and emits `@import` — that is its single
responsibility. A self-hosted file needs a `src: url(…) format(…)`,
weight, style, unicode-range, font-display — five more arguments. Cramming
that into `font-load` triples the API surface for the 5% case. The
right answer is a sibling mixin:

```scss
@mixin font-face($name, $src, $weight: normal, $style: normal, $display: swap) {
  // emits @font-face block, then registers the name in $_loaded-fonts
}
```

Same registry, same `font-family('Name')` apply step. The consumer's
mental model doesn't change; only the loader does. Argued: yes, separate
mixin. Single responsibility wins.

**Conflict with a theme's `--font-display`.** The theme sets
`--font-display: 'Inter'` at `[data-theme]`. The one-off page does
`.special-landing { @include font-family('Pacifico') }` — this writes
`font-family: 'Pacifico', sans-serif` directly, *not* the token. The
token is untouched, theme swap on the rest of the site is unaffected.

If the consumer explicitly wants to override the token in a scope,
`font-token-override(display, 'Pacifico')` writes `--font-display`
locally — the cascade contains the override to that subtree. Either
way, no global side effect on `data-theme`.

**Theme swap mid-page.** `data-theme` toggling re-cascades `--font-*`
tokens. The one-off page's `font-family: 'Pacifico'` is a direct
property, not a `var()` reference, so the swap doesn't touch it. The
font stays. Correct.

**Typo in the font name when applying.** `font-family('Pasifico')`.
Map lookup misses. `@error` fires:

```
font-family: `Pasifico` is not loaded. Call @include font-load('Pasifico', '<url>') first.
Loaded fonts: ('Pacifico', 'Inter Tight').
```

The consumer sees the typo and the list of valid names in one line.
Build does not produce broken CSS.

**Typo in the font name when loading.** `font-load('Pasifico', '<url>')`
succeeds — Sass cannot validate that a Google Fonts URL exists. The
typo surfaces at apply time when the consumer writes
`font-family('Pacifico')` and gets the @error above. Two-step misuse
caught at the second step. Acceptable.

## Tradeoffs

**Two mixins instead of one.** The shortest possible API would be a
single `@include font-family('Pacifico', $url: '…')` that loads on
first call. That's tempting but wrong: the URL parameter would
either be required on every call (verbose) or stored statefully and
re-used (the exact hidden state I'm trying to avoid). Splitting load
from apply is a one-line tax for a clean mental model.

**Sass module-level state.** `$_loaded-fonts` is mutated via `!global`.
That's pre-build state and resets every compile, but a strict reading
of "no hidden state" would say even a compile-scoped map is state.
Accepted, because the alternative (the consumer threads the map through
every call) is a worse API. The state is internal, single-source,
deterministic, and never crosses a compile boundary — it's a
build-time deduplication ledger, not runtime state.

**No auto-generated utility class.** `.cia-font-pacifico` would make
`<h1 class="cia-font-pacifico">` a one-line markup-only solution. I
gave that up because (a) it pollutes the bundle for every consumer who
loads the font, and (b) it puts apply logic in HTML, which the rest of
the system avoids. A consumer who really wants a class can write it
themselves in one line.

**`@error` is loud.** A consumer who wants a "soft" override will be
annoyed that a typo fails the build. I think that's the right
trade — the alternative is silently shipping wrong fonts, which is the
single worst outcome for a font system. Loud is correct.

**Self-hosted is a separate mixin.** Slightly more to learn. But the
load mechanism (`@import url` vs `@font-face`) is genuinely different,
and trying to overload one mixin with a `$type: 'google' | 'local'`
flag is the API smell I'm explicitly avoiding.

## State carried between compiles

**None.** `$_loaded-fonts` is a Sass module variable. It exists for
the duration of one `sass` invocation and is garbage-collected when
the compiler exits. A fresh build starts with `$_loaded-fonts: ()`.
There is no cache file, no JSON manifest, no `.sass-cache` interaction.

This is the correct trade for idempotency: idempotent *within* a
compile (the only place it matters, because that is where the
`@import` is emitted) and stateless *across* compiles (so two builds
never disagree about what is loaded).
