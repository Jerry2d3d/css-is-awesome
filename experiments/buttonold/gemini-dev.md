# Gemini — Software developer (20yr)

## Proposed SCSS
```scss
// Refactored btn-base (added $font-size for parity with legacy needs)
@mixin btn-base($py: 1, $px: 4, $r: md, $font-weight: medium, $font-size: null) {
  @include button-reset;
  @include inline(2);
  font-weight: var(--btn-font-weight, #{font-weight($font-weight)});
  padding: var(--btn-padding-y, #{space($py)}) var(--btn-padding-x, #{space($px)});
  border-radius: var(--btn-radius, #{radius($r)});
  @include transition(background-color, border-color, color, box-shadow, fast);
  @include focus-ring;
  @if $font-size { font-size: var(--btn-font-size, #{font-size($font-size)}); }
}

// Refactored buttonold
@mixin buttonold($type, $bg: surface-muted, $border: info-default) {
  @include btn-base; @content;
  background: color($bg);
  @if $type == action or $type == info { @include border(1px, solid, $border); }
  @else if $type == disabled { @include border(1px, solid, $bg); @include disabled; }
}
```

## Rationale
- **Delegation**: Instead of re-implementing layout and resets, we leverage `btn-base`. This inherits standard padding, radius, and accessibility (focus rings) automatically.
- **Tokenization**: Replaced magic hex codes (`#636363`, `#00b9f4`) with semantic tokens (`surface-muted`, `info-default`). This ensures the button respects theme swaps (Dark/Light/High Contrast).
- **Consolidation**: The `action` and `info` variants were identical. Merging their logic paths reduces maintenance surface without breaking the API.
- **Proper State Handling**: Replaced a simple color swap for `disabled` with the library's `@include disabled` mixin, ensuring `pointer-events` and `cursor` are correctly managed.
- **API Flexibility**: Added named arguments (`$bg`, `$border`) so consumers can override the "old" button's look while staying within the legacy signature.

## LOC comparison
- Old: 15 lines
- New: 5 lines (logic only)

## Tradeoffs
- **Logic Coupling**: `action` and `info` are now tied together. If their designs diverge in the future, the conditional logic will need to be expanded back out.
- **Base Dependency**: Relies on `btn-base` being stable; any changes there now propagate to this legacy mixin (which is usually desired for consistency).
