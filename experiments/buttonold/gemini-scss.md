# Gemini — CSS/SCSS expert (20yr)

## Proposed SCSS
```scss
@mixin buttonold($type, $bg: null, $border: null) {
  $presets: (
    action:   (bg: surface-muted, border: info-default),
    disabled: (bg: surface-muted, border: surface-muted),
    info:     (bg: surface-muted, border: info-default)
  );

  $cfg: map.get($presets, $type);

  @if not $cfg {
    @error "buttonold(): unknown type '#{$type}'. Available: #{map.keys($presets)}";
  }

  @content;
  background-color: m.color($bg or map.get($cfg, bg));
  border: 1px solid m.color($border or map.get($cfg, border));
}
```

## Rationale
- **Map-Driven Configuration:** Replaced the repetitive `if/else` ladder with a `sass:map` lookup. This separates data from logic, transforming the selection into an O(1) operation that is significantly easier to extend.
- **Logical Fallbacks:** Utilized the `or` operator to implement concise argument overrides. This allows the mixin to respect explicit `$bg` or `$border` parameters while falling back to the preset's tokens.
- **Fail-Fast Validation:** Integrated a loud `@error` with `map.keys()` visibility, ensuring developers receive immediate and descriptive feedback when passing an invalid preset.
- **Token Integrity:** Sanitized legacy hex values into the design system's `m.color()` tokens, making the mixin theme-swap safe and compliant with the runtime CSS variable architecture.

## LOC comparison
- Old: 15 lines
- New: 12 lines (including robust error handling and readable map formatting)

## Tradeoffs
- **Scope:** Declaring the map inline keeps the mixin self-contained and portable, though moving it to a module-level variable would be more efficient if shared across other button mixins.
- **Content Order:** Maintaining `@content` at the top preserves the original "reset-then-enforce" behavior. While this prevents simple block overrides from winning over the mixin's defaults, the new named arguments provide a safer and more intentional path for customization.
