# Gemini — Front-end designer (20yr)

## Proposed SCSS
```scss
@mixin buttonold($type, $args...) {
  @include btn-base($args...);
  background: color(surface-muted);
  @if $type == action or $type == info {
    border: 1px solid color(info-default);
  } @else if $type == disabled {
    border: 1px solid color(surface-muted);
    @include disabled;
  }
  @content;
}
```

## Rationale
- **Inherited Foundations**: By wrapping `btn-base`, the mixin gains modern system benefits (focus rings, flex alignment, and standard transitions) while keeping its unique legacy visual identity.
- **Logical Consolidation**: The `action` and `info` presets were identical in the original source; merging them removes redundant code paths while preserving the Public API.
- **Token Alignment**: Replaced brittle hex codes with semantic tokens (`surface-muted`, `info-default`) that respond to theme swaps via CSS variables.
- **Argument Forwarding**: Using `$args...` allows designers to override padding or radius (e.g., `@include buttonold(action, $r: full)`) without breaking the original single-argument signature.
- **Ergonomics**: Moved `@content` to the end of the block. This ensures custom user rules can override the mixin's defaults, which is the "designer-expected" behavior for CSS composition.

## LOC comparison
- Old: 15 lines
- New: 11 lines

## Tradeoffs
- **Override Order**: Moving `@content` to the end changes the cascade (custom rules now win over mixin defaults). This is technically a change in behavior but is significantly "cleaner" and more idiomatic for a modern design system.
- **Visual Approximation**: `#636363` was mapped to `surface-muted`. If the theme's muted surface differs slightly from the legacy gray, the button will shift to match the new system's harmony.
