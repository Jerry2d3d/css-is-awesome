# Gemini — Front-end developer (20yr)

## API proposal
```scss
// page.module.scss
@use 'mixins' as m;

@include m.load-external-font('Bungee', (400));

.specialHeadline {
  @include m.font($type: regular, $size: 7, $family: 'Bungee');
}
```

## Implementation
```scss
@use 'sass:map';
@use 'sass:list';
@use 'sass:string';

// Internal registry to ensure idempotency within a single compilation unit
$loaded-fonts: () !default;

/// Loads an external Google Font and registers it.
/// @param {String} $family - The font family name (e.g., "Playfair Display")
/// @param {List} $weights - List of numeric weights (e.g., (400, 700))
/// @param {String} $display - font-display strategy (default: swap)
@mixin load-external-font($family, $weights: (400), $display: swap) {
  $registry-key: "google-#{$family}-#{list.join($weights, '-')}";

  @if not map.get($loaded-fonts, $registry-key) {
    $loaded-fonts: map.merge($loaded-fonts, ($registry-key: true)) !global;

    // URL Encode: Replace spaces with '+' for Google Fonts API
    $url-family: $family;
    @while string.index($url-family, " ") != null {
      $index: string.index($url-family, " ");
      $url-family: "#{string.slice($url-family, 1, $index - 1)}+#{string.slice($url-family, $index + 1)}";
    }

    $url-weights: "";
    @each $w in $weights {
      $url-weights: if($url-weights == "", "#{$w}", "#{$url-weights};#{$w}");
    }

    $url: "https://fonts.googleapis.com/css2?family=#{$url-family}:wght@#{$url-weights}&display=#{$display}";

    // Lift @import to the top of the CSS chunk (required by CSS spec)
    @at-root {
      @import url("#{$url}");
    }
  }
}

/// Extension for self-hosted files (local assets in /public)
@mixin load-local-font($family, $filename, $weight: 400, $style: normal) {
  @at-root {
    @font-face {
      font-family: '#{$family}';
      src: url('/fonts/#{$filename}.woff2') format('woff2');
      font-weight: $weight;
      font-style: $style;
      font-display: swap;
    }
  }
}
```

## Rationale
In **Next 15 static export**, we lose the ability to use `next/font` for dynamic runtime injection. However, **React 19** automatically hoists `<link>` tags and stylesheets with `precedence`. When a consumer includes `load-external-font` in a `.module.scss` file:
1. Next.js creates a page-specific CSS chunk.
2. The `@import` is lifted to the top of that chunk.
3. The browser only initiates the network request for that font when that specific page's chunk is loaded.
4. This preserves the **Zero-JS** requirement for styling while ensuring the global `theme.css` remains untouched and lean.

## Edge cases
- **Two pages use the same font:** The `@import` rule will appear in both page CSS chunks. Browsers will handle this via standard cache hits; the network penalty is only paid once per session.
- **Self-hosted file via @font-face:** Handled by `load-local-font`. Files placed in `/public/fonts/` are served correctly by Next.js static export.
- **Conflict with theme's --font-display:** The existing `font()` mixin prioritizes the explicit `$family` argument over the theme's CSS variables, ensuring the override wins locally.
- **Theme swap mid-page:** Since the font is loaded via `@import` and applied via a local class override, it remains stable even if `--font-primary` changes on `<html>`. The page-specific branding is "locked."
- **Network:** Scoped to the route. Users navigating to other pages never see or download this specific override font.

## Tradeoffs
- **Render Blocking:** `@import` inside a CSS file is slightly slower than a `<link>` in `<head>` because the browser must parse the CSS before finding the font URL. In a static export, this is acceptable for a "one-line" DX.
- **SCSS Global State:** The `$loaded-fonts` registry works within a single SASS compilation. If multiple CSS modules load the same font, the deduplication relies on the bundler/minifier (Lightning CSS) or browser caching.
