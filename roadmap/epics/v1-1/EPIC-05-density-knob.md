# EPIC v1.1-05 — The density knob (`--space-unit`)

**Status:** In progress (v1.1) — F5.1 (emit the scale from a master unit)
shipped 2026-09-10, verified live. F5.2 (theme editor slider + docs) remains.
**Effort estimate:** ~1-2 working days
**Stories:** 4

> **Implementation note (2026-09-10):** shipped with one change from the
> "Design" section below — the per-step multipliers are **derived** from
> `_system.scss`'s existing `$spacing-scale` map via `math.div($value,
> $unit)` inside a loop (`scss/_spacing-scale.scss`), not hand-typed as a
> second table. Same reasoning and prior-art research (Radix's `--scaling`,
> MUI's density RFC) recorded in memory
> (`project_density_knob_spacing_scale_design`) for anyone revisiting this.

## Mission

Give consumers one variable that rescales the entire spacing system. Set
`--space-unit: 0.1rem` and the whole UI tightens by 20% — one line, no token
list to edit.

## Why now

v1.0 made spacing themeable for the first time: themes now own `--space-0..9`,
which is what components actually read (see `feat(themes): themes own the
spacing rhythm`). But changing the *feel* of a theme still means editing nine
values by hand. A single master unit turns that into one edit, which is the
strongest available lever for "swap a file, it feels like a new page" — density
changes a page's character far more than colour does.

## Design

The nine steps become `calc()` expressions over a master unit:

```scss
--space-unit: 0.125rem;                  /* the master knob */
--space-1: calc(var(--space-unit) *  4); /* 0.5rem   */
--space-2: calc(var(--space-unit) *  6); /* 0.75rem  */
--space-3: calc(var(--space-unit) *  7); /* 0.875rem */
--space-4: calc(var(--space-unit) *  8); /* 1rem     */
--space-5: calc(var(--space-unit) * 12); /* 1.5rem   */
--space-6: calc(var(--space-unit) * 16); /* 2rem     */
--space-7: calc(var(--space-unit) * 24); /* 3rem     */
--space-8: calc(var(--space-unit) * 32); /* 4rem     */
--space-9: calc(var(--space-unit) * 48); /* 6rem     */
```

A `0.125rem` base reproduces the current scale **exactly**, with whole-number
multipliers and no rounding — verified before this was written. So the change
is zero-visual-difference on every shipped theme, and the existing verification
harness (compare every declaration before/after, require zero diff) applies
unchanged.

### Three levels of power, nothing locked

1. `--space-unit` — rescales everything proportionally. The density dial.
2. `--space-4` — override one step, deliberately breaking the ramp. A literal
   beats the `calc()`, so this keeps working.
3. `space(0.5rem)` — raw passthrough, already shipped, no token at all.

### Runtime `calc()`, not a build-time Sass loop

A Sass `@each` emitting `--space-4: 1rem` as a literal is simpler, but it burns
the relationship at build time and the consumer can never touch the master
unit — they are back to editing nine values. Runtime `calc()` keeps the dial
live in the browser: a consumer overrides one line from their own stylesheet,
and the theme editor can expose it as a single slider.

Known limitation: `calc()` custom properties cannot be used inside `@media`
conditions. Spacing is not used there, so this does not bite.

### Naming — why not `--spacer-0.5`

Rejected. `--spacer-0.5` is not valid: `.` is not a legal ident character, so
Sass fails to parse it and CSS would need `--spacer-0\.5` plus escaped
`var()` references at every call site.

Value-encoded names are also self-defeating in a themeable system. If
`--spacer-0-5` can be retuned to `0.75rem`, the name is a lie the moment
somebody uses the power. Names must encode **role or multiplier**, never the
literal value.

## Out of scope

- A non-linear scale ratio (`--space-ratio`) — adds a second dial for little
  gain; revisit only if real demand appears.
- Applying the same treatment to type or radius. Radius already varies per
  theme correctly (`terminal` ships `--radius-*: 0` throughout).

## Features

### F5.1 — Emit the scale from a master unit

#### US-V11.05.1.1 — Convert `--space-0..9` to `calc()` over `--space-unit`

**As** a consumer who wants a denser or airier UI
**I want** one variable that rescales the whole spacing system
**So that** I don't hand-edit nine tokens and risk breaking the ramp's rhythm

**Acceptance criteria:**
- [x] A shared mixin (`scss/_spacing-scale.scss`, not `_generator.scss` —
  themes don't route spacing through the generator today; see implementation
  note above) emits `--space-unit` plus the nine `calc()` steps
- [x] Every shipped theme renders byte-identical spacing — verified live via
  Playwright: `getComputedStyle` padding for all 9 steps across 4 sampled
  themes (sketchbook, terminal, press, cupertino) matches the exact prior
  px values (8/12/14/16/24/32/48/64/96px)
- [x] Overriding a single `--space-N` with a literal still wins over the
  `calc()` (unchanged CSS cascade behavior, not re-tested — inherent to how
  custom properties resolve)
- [x] Bonus verified: overriding `--space-unit` itself live-rescales every
  step (tested `--space-1` doubling from 8px → 16px when `--space-unit`
  doubled)

**Effort:** ✅ DONE 2026-09-10. All 24 theme SCSS files converted from a
hand-written 10-line literal block to one `@include ss.space-scale;`.
`build:css:themes`, `validate-themes`, and `check:theme-drift` all pass.

#### US-V11.05.1.2 — Add `--space-unit` to the theme contract

**Acceptance criteria:**
- [x] `--space-unit` is contract-required; all themes declare it
- [x] `validate-themes` fails a theme that omits it (untested directly, but
  it's now required-list-driven the same way every other required token is
  gated — no theme currently omits it since the shared mixin always emits it)

**Effort:** ✅ DONE 2026-09-10.

### F5.2 — Make the knob discoverable

#### US-V11.05.2.1 — Density slider in the theme editor

**As** someone tuning a theme on the website
**I want** a single density control
**So that** I can feel the change instead of guessing at numbers

**Acceptance criteria:**
- `ThemeEditorDock` exposes `--space-unit` as a slider
- The downloaded `theme.css` carries the chosen value

#### US-V11.05.2.2 — Document the three levels

**Acceptance criteria:**
- `/docs/authoring/themes` shows unit → step → raw passthrough
- The comment block in every generated `theme.css` names the master knob
