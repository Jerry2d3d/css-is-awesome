# Claude — CSS/SCSS expert (20yr)

## Proposed SCSS

```scss
@mixin buttonold($button-type) {
  $presets: (
    action:   (bg: surface-muted, border: info-default),
    disabled: (bg: surface-muted, border: surface-muted),
    info:     (bg: surface-muted, border: info-default),
  );
  $cfg: map.get($presets, $button-type);
  @if not $cfg { @error "buttonold(): unknown type #{$button-type}. Expected one of: #{map.keys($presets)}"; }
  @content;
  background-color: m.color(map.get($cfg, bg));
  border: 1px solid m.color(map.get($cfg, border));
}
```

Drop-in compatible with the existing partial: `_buttons.scss` already imports `sass:map` and `../mixins as m` at the top of the file, so no new `@use` is required.

## Rationale

The three branches in the original were a copy-paste table masquerading as control flow — same structure, two values changing per row. That's a map, not an `@if/@else if`. By lifting the per-preset deltas (`bg`, `border`) into a `$presets` map and resolving them through `m.color()` once, the body collapses to three real lines: `@content`, background, border. `map.get` plus an `@error` guard preserves the "switch by name" behaviour while failing loudly on typos — which the original silently swallowed (an unknown `$button-type` previously produced an empty rule). All hex values are now semantic tokens (`surface-muted`, `info-default`) drawn from `theme-contract.json`, so a `data-theme` swap reskins it for free. Stays in spirit of the constraint: it's still a name-keyed switch, just expressed in the Sass primitive built for the job.

## LOC comparison

- Old: 15 lines
- New: 12 lines (counting the map declaration, the `@error` guard, and the closing brace)

## Tradeoffs

- Adds a 4-line map declaration scoped inside the mixin — more vertical structure for fewer total lines, and zero leakage to the outer partial.
- `@error` is now strict: callers passing an unknown preset get a build failure instead of silent emptiness. Strictly better, but it *is* a behaviour change for any caller currently relying on the no-op fallthrough (none should be).
- The `disabled` preset still emits a visible border (`surface-muted` on `surface-muted`) to preserve byte-for-byte parity with the hex-coded original. If we wanted the cleaner semantic, `border: border-subtle` would read better — flagged for Jerry, not changed here.
- Doesn't try to delegate to `btn-base` / `btn-ghost`. Those mixins set padding, radius, focus-ring, transitions — none of which the original `buttonold` emitted. Folding them in would change the rendered output, which violates the "keep API" constraint more than it helps.
- Map lives inline inside the mixin rather than at module scope. Trades a micro-perf hit (rebuilt per call site at compile time, not runtime) for self-containment — the proposal is one block you can read top-to-bottom.
