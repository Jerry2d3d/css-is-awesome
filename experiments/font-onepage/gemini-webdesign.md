# Gemini — Web designer (20yr)

## API proposal
```scss
// At the top of your page SCSS
@include m.google-font('Pacifico', $alias: 'display');

// Use it anywhere—it now overrides the theme's "display" font for this scope
h1 { @include m.font(reg, 8, $family: font-family(display)); }
```

## Implementation
```scss
// Add to scss/_mixins.scss

$__loaded-google-fonts: () !default;

/// Injects a Google Font and optionally aliases it to a theme token
/// @param {String} $family - The font name (e.g., "Pacifico" or "Playfair Display")
/// @param {String} $alias - Optional theme token to override (e.g., "display", "serif")
/// @param {List} $weights - List of weights to load
@mixin google-font($family, $alias: null, $weights: (400, 700)) {
  $family-quoted: quote($family);
  
  // 1. Idempotent injection of the @import rule
  @if not index($__loaded-google-fonts, $family-quoted) {
    $__loaded-google-fonts: list.append($__loaded-google-fonts, $family-quoted) !global;
    
    // URL Encoding: Space to +
    $query: $family;
    $space: ' ';
    $at: str-index($query, $space);
    @while $at {
      $query: str-slice($query, 1, $at - 1) + '+' + str-slice($query, $at + 1);
      $at: str-index($query, $space);
    }
    
    $url: "https://fonts.googleapis.com/css2?family=#{$query}:wght@#{list.join($weights, ';')}&display=swap";
    
    @at-root {
      @import url("#{$url}");
    }
  }

  // 2. Map to theme token if alias provided
  @if $alias {
    $fallback: if($alias == 'mono', monospace, sans-serif);
    @if $alias == 'serif' or $alias == 'display' { $fallback: serif; }
    
    // Sets the local CSS variable so font-family($alias) resolves to this new font
    --font-#{$alias}: "#{$family}", #{$fallback};
  }
}
```

## Rationale
This API follows the "Mental Model of Intent." As a designer, I don't want to manage URLs or `link` tags in a header; I want to declare a dependency and use it. By providing the `$alias` parameter, we hook directly into the system's existing `font-family()` logic. Instead of hardcoding `'Pacifico'` everywhere, you simply tell the page: "For this page, 'display' means 'Pacifico'." It keeps the call site clean and preserves the abstraction of the design system.

## Edge cases
- **Two pages use the same font:** The `$__loaded-google-fonts` global list prevents Sass from emitting the `@import` twice in the same compilation unit, and browsers deduplicate identical URL imports anyway.
- **Self-hosted file via @font-face:** The designer would use a standard `@font-face` block. To integrate with the system, they'd simply manually set `--font-display: 'MyLocalFont', sans-serif;`.
- **Conflict with theme's --font-display:** Because the mixin sets the variable on the scope it's called in (e.g., `:root` if called at top-level, or a specific class), the CSS Cascade handles resolution perfectly. The "closest" definition wins.
- **Theme swap mid-page:** Since we are overriding the CSS variable (`--font-display`), the font persists even if the colors/shadows change via `[data-theme]`, because the page-level variable has higher specificity than the theme's default.

## Tradeoffs
- **CSS Spec Strictness:** `@import` rules technically should be at the very top of a CSS file. While modern browsers and Next.js loaders are extremely lenient, calling this mixin deep inside nested selectors might trigger a console warning in some environments.
- **Weights:** To keep it a "one-liner," we default to 400/700. For hyper-optimized loading, a designer might want to be more surgical with weight strings.
