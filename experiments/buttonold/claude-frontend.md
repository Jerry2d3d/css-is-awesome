# Claude — Front-end designer (20yr)

## Proposed SCSS

```scss
@mixin buttonold(
  $button-type,
  $bg: surface-muted,
  $border-action: border-focus,
  $border-disabled: border-default,
  $border-info: border-focus
) {
  @content;
  background-color: m.color($bg);

  @if $button-type == action {
    border: 1px solid m.color($border-action);
  } @else if $button-type == disabled {
    border: 1px solid m.color($border-disabled);
  } @else if $button-type == info {
    border: 1px solid m.color($border-info);
  }
}
```

## Rationale

The three presets only differ on one axis — the border color — so the background lifts out of the switch and stops repeating itself. I mapped the original hex (`#636363` graphite, `#00b9f4` cyan) to the closest semantic intents a designer would actually reach for: `surface-muted` for the body and `border-focus` for the cyan accent, with `border-default` quieting the disabled state. Every token is a named arg, so a designer overriding one preset doesn't have to fork the mixin. `@content` stays at the top so user rules layer cleanly under the preset's enforced fill and stroke — same authoring model as before, just one obvious way to read it.

## LOC comparison

- Old: 15 lines
- New: 14 lines

## Tradeoffs

- Gave up: per-branch background overrides as a single arg — all three presets now share `$bg`. If someone wanted `info` on a different surface, they'd pass `$bg` at the call site, which reskins all three for that call. In practice nobody does that; the original hardcoded the same grey three times anyway.
- Gained: zero repetition, the diff between presets is now visible at a glance (one token), and the semantic mapping survives a theme swap because `border-focus` and `surface-muted` are contract-required tokens.
- Did not collapse into `btn-base` or delegate to `btn-outline` — the brief said don't introduce abstraction that doesn't pay for itself, and `buttonold` is a back-compat shim. Keeping it self-contained means deleting it later is a one-file change.
