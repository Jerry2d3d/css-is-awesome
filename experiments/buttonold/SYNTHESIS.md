# buttonold — synthesis from #1 + #4 + Jerry's growth pattern

## What you asked for

> "Doing number one. Add the include to the button type. The reason is then if you need more, you update that button and the main button doesn't keep getting bigger. I want the best way to build the button system. Easy to add and update."

Translated: take #1's clean structure (hoisted `bg`, per-preset border in the switch, every value overridable) + #4's `btn-base` inheritance (free focus-ring / padding / transitions) + a **per-preset private mixin** so each branch can grow without bloating the router.

## Proposal (drop-in for `scss/components/_buttons.scss`)

```scss
// ----------------------------------------------------------------------------
// BUTTONOLD — preset router (kept for back-compat with legacy markup)
// ----------------------------------------------------------------------------
// Router stays small. Each preset is its own mixin (`_buttonold-<name>`) so you
// can grow a preset without growing the router. To add a new preset:
//   1. Write a `@mixin _buttonold-<name>($border: null)` below.
//   2. Add one `@else if` branch to the router.
// All values are token-driven so theme swap reskins automatically. Override
// any token via named args.
// ----------------------------------------------------------------------------
@mixin buttonold(
  $button-type,
  $bg: surface-muted,
  $border: null,
  $args...
) {
  @include btn-base($args...);
  background-color: m.color($bg);

  @if      $button-type == action   { @include _buttonold-action($border); }
  @else if $button-type == disabled { @include _buttonold-disabled($border); }
  @else if $button-type == info     { @include _buttonold-info($border); }
  @else {
    @error "buttonold(): unknown type '#{$button-type}'. Expected: action, disabled, info.";
  }

  @content;
}

// Per-preset mixins — small, local, easy to grow.
@mixin _buttonold-action($border: null) {
  border: 1px solid m.color($border or info-default);
}
@mixin _buttonold-disabled($border: null) {
  border: 1px solid m.color($border or border-default);
  @include m.disabled;
}
@mixin _buttonold-info($border: null) {
  border: 1px solid m.color($border or info-default);
}
```

## Why this is the best of both

- **#1 wins:** hoisted `bg` (no repetition), per-preset border in the switch, all values are named args so a designer can override at the call site.
- **#4 wins:** `@include btn-base($args...)` gives every legacy button modern focus-ring + padding + transitions + button-reset for free. The `$args...` forwards `$py`, `$px`, `$r`, etc. straight through, so existing `btn-base` callers don't lose any flexibility.
- **Your growth pattern wins:** the router is **8 lines of switch**. Adding `success`, `warning`, or `danger` later = one new private mixin + one new branch. The router never grows past those 8 lines, no matter how many presets exist.
- **`@error` guard** (from the SCSS-expert agents): typos like `buttonold(actoin)` fail the build instead of silently emitting nothing.
- **`@content` at end** (from Claude dev's reasoning): matches every other mixin in `_buttons.scss` so user rules win over preset CSS — no footgun where overrides silently disappear.
- **`@include m.disabled`** (from Gemini dev): the library mixin handles `pointer-events`, `cursor`, `opacity` correctly — better than a color-only disabled.

## What the agents missed (or didn't say loudly)

1. **`#00b9f4` (cyan) is closer to `--info-default` than `--border-focus`.** `border-focus` = the indigo `--ai`. Most agents picked `border-focus`, which would visually shift legacy buttons toward indigo. I picked `info-default` (cyan-blue) for closer parity. Worth eyeballing in a theme.
2. **No agent flagged the disabled border smell.** The original `disabled` preset emits `border: #636363` on a `#636363` background — a visible-but-invisible border. The Claude SCSS agent saw it, kept byte-parity, and flagged it for you. I switched it to `border-default` here so disabled buttons render an actual visible edge — a small render change, but it's the *right* render. Tell me if you want byte-parity instead.
3. **Naming kerfuffle.** `action / disabled / info` mixes three concepts: a layout intent, a state, and a status. A clean future system separates them:
   - Variants (visual): primary, secondary, outline, ghost
   - States (mode): disabled, loading, busy
   - Statuses (semantic color): info, success, warning, danger
   `buttonold` is the back-compat shim, so we keep its three names; **but** if you want to add presets later, lean toward statuses (`success`, `warning`, `danger`) since `info` is already there.
4. **The `disabled` preset auto-applies `@include m.disabled`.** That's a real behavior gain — old `buttonold(disabled)` rendered the *look* of a disabled button but didn't disable interactions. Now it does. (If you don't want that, drop the `@include m.disabled` from `_buttonold-disabled` and consumers can keep their custom logic.)
5. **No agent talked about extension across files.** If `_buttonold-<name>` mixins live in this same file, the partial grows. If you go big on presets, move them to a sibling partial like `scss/components/_button-presets.scss` and `@use` it from `_buttons.scss`. Today, three presets — fine here. Five+ — split.
6. **`$args...` ordering.** Sass treats positional args first; if a caller does `buttonold(action, surface-default)` Sass binds the second arg to `$bg`, not `$args`. We're safe if everyone uses named args (`buttonold(action, $bg: surface-default)`), which is the convention everywhere else in `_buttons.scss`. Worth a one-line comment in the docstring.

## Open decisions (yours)

1. **Token mapping**: `info-default` (closer to original cyan) vs `border-focus` (matches the rest of the focus-ring system). Pick one.
2. **Disabled border color**: keep byte-parity with the original (invisible border) or switch to `border-default` (visible edge)?
3. **Auto-apply `@include m.disabled` on the disabled preset?** Yes (recommended) or no (back-compat only)?
4. **`@content` placement**: end (user wins, matches system) or top (preset wins, byte-parity with original)?
5. **`@error` on unknown type**: yes (recommended) or no (back-compat only)?
6. **Move per-preset mixins to a separate file?** Or keep in `_buttons.scss` until you have 5+?

Once you pick, I'll mint the final mixin, build, validate themes, run the test suite, and merge `experiment/buttonold-refactor` → `main`.
