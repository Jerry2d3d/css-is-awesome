# Claude — Software developer (20yr)

## Proposed SCSS

```scss
@mixin buttonold(
  $button-type,
  $bg: surface-emphasis,
  $border: border-focus,
  $disabled-border: surface-emphasis
) {
  background-color: m.color($bg);

  @if      $button-type == action   { border: 1px solid m.color($border); }
  @else if $button-type == info     { border: 1px solid m.color($border); }
  @else if $button-type == disabled { border: 1px solid m.color($disabled-border); }

  @content;
}
```

## Rationale

The original is 15 lines of hex-coded copy-paste where two of the three branches (`action`, `info`) are byte-identical and the third (`disabled`) only changes border color. The shared work — `background-color` — moves above the switch; the switch is now reduced to the one thing that actually varies (border token). All four values are named args, so a consumer can swap any token without forking the mixin: `@include buttonold(action, $border: action-primary-default) { ... }`. `m.color()` resolves against the token contract, so `data-theme` swaps reskin it for free. `@content` moves to the end of the cascade — preset CSS lays the contract first, user overrides win last, which matches every other mixin in `_buttons.scss` and avoids the original's footgun where `@content` was emitted before the preset and silently lost. I deliberately did NOT delegate to `btn-base` / `btn-primary`: `buttonold` is a back-compat shim for legacy markup that only sets bg+border, and inheriting `btn-base`'s padding, focus-ring, and reset would be a behavior change, not a refactor.

## LOC comparison

- Old: 15 lines
- New: 11 lines (8 if you count only the body; declaration spans 6)

## Tradeoffs

- **Gained:** zero hex, zero duplication, every value overridable by name, `@content` placement now matches the rest of the system, theme-swap-safe by construction.
- **Gained:** the switch reads as data — "what changes between these three presets is exactly the border token."
- **Gave up:** I kept `action` and `info` as separate `@else if` branches even though they currently resolve to identical CSS. Constraint #1 requires the switch to stay; collapsing them to `@if $button-type == action or $button-type == info` would save one line but locks in the duplication semantically. Keeping them separate means a future consumer can override `info`'s border without touching `action`.
- **Gave up:** I did not have `btn-base` absorb a preset switch (Jerry's hypothesis). Reasoning: `btn-base` has a clean, single-responsibility signature today (`$py, $px, $r, $font-weight, $font-size`). Adding a `$preset` arg would couple structural sizing to color presets and bloat the most-called mixin in the system to serve a back-compat shim. The shim should pay its own freight.
- **Gave up:** delegation to `btn-primary` / `btn-outline`. Tempting, but those mixins emit padding, hover, active, disabled, focus-ring, and `button-reset` — none of which the original `buttonold` did. Delegating would change the rendered output for every existing consumer. A refactor that changes behavior isn't a refactor.
