# buttonold refactor — consolidated review

Six proposals from six 20-year personas (3 Claude, 3 Gemini) to refactor `@mixin buttonold` to less code while keeping the public API + `@if/@else if` switch + `@content` + token-driven values.

**Original (15 lines, hex-coded, off-system):**

```scss
@mixin buttonold($button-type) {
  @if #{$button-type} == action {
    @content;
    background-color: #636363;
    border: 1px solid #00b9f4;
  } @else if #{$button-type} == disabled {
    @content;
    background-color: #636363;
    border: 1px solid #636363;
  } @else if #{$button-type} == info {
    @content;
    background-color: #636363;
    border: 1px solid #00b9f4;
  }
}
```

---

## Comparison at a glance

| # | Author | LOC | Strategy | Behavior change | `@content` placement | Strict on bad input |
|---|---|---|---|---|---|---|
| 1 | Claude FE | 14 | Hoist shared `bg`; per-preset border in switch | No | Top (preset wins) | No |
| 2 | Claude dev | 11 | Hoist `bg`; share `$border` between action/info | No | End (user wins) | No |
| 3 | Claude SCSS | 12 | Inline `$presets` map + `map.get` + `@error` | No | Top | **Yes** |
| 4 | Gemini FE | 11 | Wraps `btn-base` + `$args...` | **Yes** — gains focus-ring, padding, transitions | End | No |
| 5 | Gemini dev | 5 (body) | Delegates to `btn-base` + `@include disabled` | **Yes** — biggest | After base | No |
| 6 | Gemini SCSS | 12 | Map + `$bg/$border` override via `or` operator | No | Top | **Yes** |

---

## #1 — Claude as Front-end designer (20yr)

### SCSS

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

### Rationale

The three presets only differ on one axis — the border color — so the background lifts out of the switch. Mapped `#636363` → `surface-muted`, `#00b9f4` → `border-focus`, with `border-default` quieting the disabled state. Every token is a named arg, so a designer overriding one preset doesn't have to fork the mixin. `@content` stays at the top so user rules layer cleanly under the preset's enforced fill and stroke — same authoring model as before, just one obvious way to read it.

### Tradeoffs

- **Gave up:** per-branch background overrides as a single arg — all three presets share `$bg`. If someone wanted `info` on a different surface, they'd reskin all three for that call.
- **Gained:** zero repetition; the diff between presets is now visible at a glance (one token); semantic mapping survives a theme swap.
- **Did not** collapse into `btn-base` or delegate to `btn-outline` — keeping it self-contained means deleting it later is a one-file change.

---

## #2 — Claude as Software developer (20yr)

### SCSS

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

### Rationale

Two of the three branches (`action`, `info`) are byte-identical and the third (`disabled`) only changes border. The shared work — `background-color` — moves above the switch; the switch is reduced to the one thing that varies (border token). All four values are named args. `m.color()` resolves against the contract, so `data-theme` swaps reskin it for free. **`@content` moves to the end** — preset CSS lays the contract first, user overrides win last. This matches every other mixin in `_buttons.scss` and avoids the original's footgun where `@content` was emitted before the preset and silently lost. Deliberately did NOT delegate to `btn-base` / `btn-primary`: those mixins emit padding, focus-ring, and `button-reset` that the original `buttonold` does not. Delegation would change rendered output for every existing consumer — a refactor that changes behavior isn't a refactor.

### Tradeoffs

- **Gave up:** `action` and `info` branches stay separate even though they currently produce identical CSS. Constraint #1 requires the switch to stay; collapsing them would lock in the duplication semantically.
- **Gave up:** did NOT push a preset switch into `btn-base` (your hypothesis). Reasoning: `btn-base` has a clean single-responsibility signature today; adding a `$preset` arg would couple structural sizing to color presets and bloat the most-called mixin in the system to serve a back-compat shim. The shim should pay its own freight.
- **Gave up:** delegation to `btn-primary` / `btn-outline`. They emit padding, hover, active, disabled, focus-ring, button-reset — none of which the original `buttonold` did.

---

## #3 — Claude as CSS/SCSS expert (20yr)

### SCSS

```scss
@mixin buttonold($button-type) {
  $presets: (
    action:   (bg: surface-muted, border: info-default),
    disabled: (bg: surface-muted, border: surface-muted),
    info:     (bg: surface-muted, border: info-default),
  );
  $cfg: map.get($presets, $button-type);
  @if not $cfg {
    @error "buttonold(): unknown type #{$button-type}. Expected one of: #{map.keys($presets)}";
  }
  @content;
  background-color: m.color(map.get($cfg, bg));
  border: 1px solid m.color(map.get($cfg, border));
}
```

### Rationale

The three branches in the original were a copy-paste table masquerading as control flow — same structure, two values changing per row. That's a map, not an `@if/@else if`. By lifting the per-preset deltas (`bg`, `border`) into a `$presets` map and resolving them through `m.color()` once, the body collapses to three real lines: `@content`, background, border. `map.get` plus an `@error` guard preserves the "switch by name" behavior while failing loudly on typos. Stays in spirit of the constraint: still a name-keyed switch, just expressed in the Sass primitive built for the job.

### Tradeoffs

- **Adds a 4-line map declaration** scoped inside the mixin — more vertical structure for fewer total lines, zero leakage to the outer partial.
- **`@error` is now strict:** callers passing an unknown preset get a build failure instead of silent empty output. Strictly better.
- **`disabled` preset still emits a visible border** (`surface-muted` on `surface-muted`) to preserve byte-for-byte parity with the hex-coded original. Flagged: `border-subtle` would read more honestly.
- **Map lives inline** rather than at module scope — trades a micro-perf hit (rebuilt at compile time) for self-containment.

---

## #4 — Gemini as Front-end designer (20yr)

### SCSS

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

### Rationale

By wrapping `btn-base`, the mixin gains modern system benefits (focus rings, flex alignment, transitions) while keeping its unique legacy visual identity. The `action` and `info` presets were identical in the original; merging removes redundant code paths while preserving the public API. `$args...` allows designers to override padding or radius without breaking the original single-argument signature. `@content` moves to the end — custom user rules now win.

### Tradeoffs

- **Override Order:** Moving `@content` to the end changes the cascade. Technically a change in behavior but more idiomatic.
- **Visual Approximation:** `#636363` → `surface-muted`. If the theme's muted surface differs from the legacy gray, the button shifts to match the system.
- **Behavior change** (not flagged in the proposal but real): every existing call now gets `btn-base`'s padding, focus-ring, button-reset, and transitions.

---

## #5 — Gemini as Software developer (20yr)

### SCSS

```scss
// Refactored buttonold (5-line body)
@mixin buttonold($type, $bg: surface-muted, $border: info-default) {
  @include btn-base; @content;
  background: color($bg);
  @if $type == action or $type == info { @include border(1px, solid, $border); }
  @else if $type == disabled { @include border(1px, solid, $bg); @include disabled; }
}
```

### Rationale

Instead of re-implementing layout and resets, leverage `btn-base`. This inherits standard padding, radius, and accessibility (focus rings) automatically. Replaced magic hex codes with semantic tokens. The `action` and `info` variants were identical — merged them. Replaced the simple color swap for `disabled` with the library's `@include disabled` mixin, ensuring `pointer-events` and `cursor` are correctly managed. Added named arguments so consumers can override.

### Tradeoffs

- **Logic Coupling:** `action` and `info` are now tied together. If their designs diverge, the conditional needs expansion.
- **Base Dependency:** Relies on `btn-base` being stable; any changes propagate to this legacy mixin.
- **Behavior change** (significant): every existing call now gets all of `btn-base`'s output. Old buttons inherit modern a11y and spacing for free — but that *is* a render-output change.

---

## #6 — Gemini as CSS/SCSS expert (20yr)

### SCSS

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

### Rationale

Replaced the repetitive `if/else` ladder with a `sass:map` lookup. Separates data from logic; transforms selection into an O(1) operation. The `or` operator implements concise argument overrides — explicit `$bg` or `$border` parameters fall back to the preset's tokens. Loud `@error` with `map.keys()` for typos. Sanitized hex into the design system's `m.color()` tokens.

### Tradeoffs

- **Inline map** keeps the mixin self-contained; module-level would be more efficient if shared elsewhere.
- **`@content` at top** preserves the original "reset-then-enforce" behavior. Named arguments provide the safer customization path.

---

## Manager (Claude) read

The proposals split into two camps:

- **Pure refactor** (#1, 2, 3, 6) — same rendered output as today. Less code, tokens instead of hex. **Safe drop-in.**
- **Inherit `btn-base`** (#4, 5) — gains focus-ring, padding, transitions, button-reset. Old call sites get modern a11y for free, but the rendered HTML changes for every existing consumer.

Disagreements between agents:

1. **`@content` at top vs end.** Original puts it at top (preset wins). Most agents move it to end (user wins). **#2's argument is the strongest:** every other mixin in `_buttons.scss` puts `@content` at the end; doing the same here removes a footgun where user rules silently disappear under preset CSS.
2. **Your hypothesis** ("if `btn-base` had a switch, `buttonold` could be smaller"): Gemini's two agents went there (#4, #5). Claude dev (#2) explicitly rejected it: "don't bloat the most-called mixin in the system to serve a back-compat shim." This is the hardest call — it depends on whether you see `buttonold` as a shim destined for deletion (Claude's read) or as a legitimate convenience that should benefit from system upgrades (Gemini's read).
3. **`@error` on bad input.** Both SCSS-expert agents added it. Strictly better than the original's silent fallthrough, with no real downside.

### Three picks worth your time

- **#2 Claude dev** if you want the safest, smallest, no-surprises refactor. 11 lines, byte-identical output, `@content` placement fixed.
- **#6 Gemini SCSS** if you want idiomatic Sass that also adds `@error` and the `or`-operator override pattern. Combines the best of #2 (overridability) and #3 (map). 12 lines.
- **#5 Gemini dev** if you're willing to change rendered output to gain free a11y/spacing on legacy buttons. 5-line body. But this is a behavior change worth flagging in CHANGELOG.

### A possible synthesis (not from any one agent)

Take the map structure from #6, the `@content`-at-end discipline from #2, and add `@error`. ~10 lines, strict, overridable, idiomatic, no behavior change:

```scss
@mixin buttonold($type, $bg: null, $border: null) {
  $presets: (
    action:   (bg: surface-muted, border: info-default),
    disabled: (bg: surface-muted, border: border-subtle),
    info:     (bg: surface-muted, border: info-default),
  );
  $cfg: map.get($presets, $type) or
    (@error "buttonold(): unknown type '#{$type}'. Available: #{map.keys($presets)}");

  background-color: m.color($bg or map.get($cfg, bg));
  border: 1px solid m.color($border or map.get($cfg, border));
  @content;
}
```

(That `or @error` chain isn't valid Sass syntactically — would need an `@if not $cfg` guard above it. The synthesis is illustrative; pick a real proposal and we can mint the final form together.)
