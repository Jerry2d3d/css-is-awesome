# Gemini — Software developer (20yr)

## API proposal
```scss
// The One-Liner: Load from Google Fonts/CDN and apply immediately
.hero-title {
  @include m.font('Pacifico', $url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', $size: 8);
}

// Alternative: Register once at top of file, use by name (symmetric with 'bold', 'reg')
@include m.font-load('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
.subtitle { @include m.font('Pacifico', $size: 4); }
```

## Implementation
```scss
@use 'sass:string';

// Module-level state for compile-time idempotency
$_loaded-fonts: () !default;

/// Registers an external font exactly once.
/// Supports CSS URLs (Google Fonts) and direct font files.
@mixin font-load($family, $url) {
  @if map.has-key($_loaded-fonts, $family) { @return; }
  $_loaded-fonts: map.merge($_loaded-fonts, ($family: $url)) !global;

  @at-root {
    // Detect if URL is a CSS stylesheet (Google Fonts) vs a raw font file
    $is-css: string.index($url, "css") != null;
    
    @if $is-css {
      @import url("#{$url}");
    } @else {
      @font-face {
        font-family: "#{$family}";
        src: url("#{$url}");
        font-display: swap;
      }
    }
  }
}

/// Enhanced font mixin with on-the-fly loading and signature symmetry.
@mixin font($type: reg, $size: null, $lh: null, $ls: null, $family: null, $url: null) {
  // 1. Signature Symmetry: If $type is not a recognized weight/style, treat as family
  @if not map.has-key($_font-types, $type) and $type != null {
    // Guard: Fail loudly if it's not a theme font, loaded font, or being loaded now
    $is-theme: map.has-key(t.$theme-fonts, $type);
    $is-loaded: map.has-key($_loaded-fonts, $type);
    
    @if not ($is-theme or $is-loaded or $url) {
      @error "Unknown font '#{$type}'. Register it via $url or font-load(). Available types: #{map.keys($_font-types)}";
    }
    
    $family: $type;
    $type: reg;
  }

  // 2. Handle On-the-fly Loading
  @if $url {
    $family-to-load: if($family, $family, $type);
    @include font-load($family-to-load, $url);
    @if not $family { $family: $type; $type: reg; }
  }

  // 3. Apply styles
  $cfg: map.get($_font-types, $type) or map.get($_font-types, reg);
  font-weight: font-weight(map.get($cfg, weight));
  font-style: map.get($cfg, style);
  
  @if $family { font-family: $family; }
  
  @if $size {
    $size-val: map.get(s.$font-sizes, $size);
    font-size: if($size-val, $size-val, $size);
  }
  
  @if $lh {
    $lh-val: map.get(s.$line-heights, $lh);
    line-height: if($lh-val, $lh-val, $lh);
  }
  
  @if $ls {
    $ls-val: map.get(s.$letter-spacings, $ls);
    letter-spacing: if($ls-val, $ls-val, $ls);
  }
}
```

## Rationale
- **API Contract:** The `font` mixin is now polymorphic. If the first argument isn't a known weight/style (like `bold`), it's treated as the `font-family`. This matches how developers think ("I want the Pacifico font").
- **State Management:** Uses a module-level variable `$_loaded-fonts` to track registrations. Since Sass modules are singleton-like within a compilation context, this ensures `@import` is only emitted once even if multiple components call it.
- **Fail Loudly:** If a user calls `@include font('ComicSans')` without a URL or registration, the compiler throws an `@error`. This prevents silent fallbacks to browser default fonts that break designs.
- **Minimal Surface:** No new complex objects. Just one optional parameter and one helper mixin.

## Edge cases
- **Two pages use the same font:** If they are compiled in the same entry point (e.g., a global `main.scss`), the map prevents duplicates. If compiled as separate files, CSS naturally isolates them.
- **Self-hosted file:** Handled by the same `font-load` mixin. It detects the absence of "css" in the URL and generates a standard `@font-face` block instead of an `@import`.
- **Typo in font name:** Throws `@error` during compilation because the name won't be in `$_font-types`, `theme-fonts`, or `$_loaded-fonts`.
- **State carried between compiles:** Sass module state is reset per compilation. No stale state issues in Dev mode or Next.js HMR.

## Tradeoffs
- **Heuristic Detection:** Checking for "css" in the URL to decide between `@import` and `@font-face` is a heuristic, but it accurately differentiates between Google Fonts (which return CSS) and direct binary assets.
- **Positional Ambiguity:** If someone named a font "bold", it would conflict with the weight key. This is a "don't do that" edge case that is acceptable for the benefit of the symmetric API.
