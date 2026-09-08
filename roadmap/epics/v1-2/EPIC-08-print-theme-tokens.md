# EPIC v1.2-08 — Print theme + print tokens

> Added 2026-09-08 (Jerry's idea, building on the external-review print work).
> Print is just another surface cia can theme. Give it real tokens with a clean
> black/white + light-gray default every theme inherits, and let a theme (or a
> consumer) *override* those tokens to restyle paper — a branded letterhead, a
> newsprint look, a grayscale draft. "Swap tokens, get a new look" — for print.

**Status:** Planned (v1.2) — architecture change, plan-first
**Effort estimate:** ~3-5 working days
**Stories:** 6

## Mission

Replace print's current three-half-mechanisms color model with **one set of
print tokens**:

```
--print-ink     black        body text, links, code text
--print-paper   white        backgrounds
--print-line    light gray   borders, rules, hairlines
--print-muted   mid gray     printed URLs, captions, secondary text
```

`print-base` emits sensible **black/white + light-gray defaults**; every print
rule reads `var(--print-ink)` etc.; overriding the tokens restyles print. No
new concepts — print is a `@media` surface and a print theme is a token
override, fully inside the locked theme architecture.

## Why now

The external-review print work exposed that print color is currently done
**three ways at once** (see `scss/_mixins.scss` `print-base`):

1. `color-scheme: light` forces paired themes to print their light branch.
2. `$legible` is a patch remapping `--ink → CanvasText` for dark-only themes
   whose literal light ink vanishes on white paper.
3. The docs site (`src/app/print.scss`) then **hardcodes** `#000/#fff/#999`
   anyway, because "a dark theme burns a whole cartridge."

One job — legible ink on paper — done three ways, one of them hardcoded.
Print tokens collapse all three into a single, overridable default.

## The per-theme decision (LOCKED 2026-09-08)

**Global default, per-theme opt-in.** Jerry's call:

- cia ships **one** global print default (B/W + light grays) that **every
  theme inherits for free** — zero per-theme authoring. This is right because
  print's job (legibility, toner economy) is the same whatever the screen
  theme was; nobody wants Neon on paper.
- A theme **may** optionally override the print tokens for a signature paper
  identity (Press → newsprint; a branded letterhead), as a `@media print`
  block in its own single theme file (locked "one theme = one file") or a
  paired `<link media="print">` — the same mechanism paired light/dark themes
  already use. **Not required for all 24 themes.**

Rejected: forcing every theme to author a print variant — huge speculative
work for a look almost nobody wants, and it re-introduces the "print derived
from the screen theme" coupling this epic removes.

## Out of scope

- Authoring print variants for all 24 themes. Global default + a single
  reference override only ([[project_ship_then_see_rule]]).
- `@layer`. Print wins by source order + `@media`; tokens need no layer
  ([[feedback_no_at_layer]]).

## Features

### F1 — Print tokens + defaults

- **US-V12.08.1.1** (M) — `print-base` emits `--print-ink/-paper/-line/-muted`
  defaults (black / white / light gray / mid gray) in its `@media print :root`.
  Acceptance: printing any theme with no override yields clean B/W + grays.
- **US-V12.08.1.2** (M) — Re-point print rules to the tokens: `print-base`'s own
  link-URL `::after` color → `--print-muted`; migrate `src/app/print.scss`'s
  literal `#000/#fff/#999` to `var(--print-*)`. `print-hidden`/`print-only`
  (display only) are untouched. Acceptance: docs-site print output is visually
  unchanged; `cia analyze` reports zero hard-coded-color there (now token-driven
  as well as inside `@media print`).

### F2 — `$legible` migration

- **US-V12.08.2.1** (M) — Because print text now reads `--print-ink` (default
  black), dark-only themes are legible **without** `$legible`. Keep `$legible`
  as a deprecated no-op alias for one minor with a docs note; remove the
  `--ink`-remap path. Acceptance: Terminal prints legibly with `$legible` unset;
  passing `$legible` still compiles and warns/notes deprecation.

### F3 — Per-theme opt-in

- **US-V12.08.3.1** (M) — Document + demonstrate the override mechanism: a theme
  overrides print tokens via a `@media print` block in its file OR a paired
  `<link media="print">`. Ship **one** reference (Press newsprint or a
  letterhead example), not 24. Acceptance: the reference theme prints with its
  own paper identity; all others inherit the global default.
- **US-V12.08.3.2** (S) — Treat `--print-*` as **optional** contract tokens with
  defaults so `theme-validator` / theme-drift don't demand them of every theme.
  Acceptance: a theme without print overrides passes; one with them validates.

### F4 — Docs + analyzer note

- **US-V12.08.4.1** (S) — Docs page + README: print is themeable; the default is
  B/W + light grays; how to restyle (override the four tokens); and that
  `cia analyze` already treats `@media print` literals as intentional (shipped
  2026-09-08) so print overrides never read as "hard-coded color." Acceptance:
  the print docs show a before/after override; the analyzer behavior is stated.

## What changes

- `scss/_mixins.scss` `print-base` gains the four token defaults and drops the
  `$legible` ink-remap; its print rules read `var(--print-*)`.
- `src/app/print.scss` literals become `var(--print-*)`.
- `scripts/theme-contract.json` gains four optional print tokens.
- New docs page + a single reference print-override theme/example.

## What we may lose

- **`$legible`'s current behavior.** Anyone who set `$legible: true` relied on
  the `--ink` remap; the token model supersedes it. Mitigation: keep it as a
  deprecated no-op for one minor + a CHANGELOG/migration note; the new default
  is *more* legible, not less.
- **The "print inherits the screen theme's colors" surprise.** Today a light
  theme's print quietly uses its own ink; the token default is now a uniform
  black. That's the intended improvement (predictable paper), but it IS a
  visible change for light themes — call it out in the changelog.

## Risks

- Getting the `color-scheme: light` + token interaction right so paired themes
  still behave and the tokens are the single source of print color. Needs a
  print snapshot across a light theme, a dark-only theme, and the reference
  override before it ships.
- Scope drift into "theme every surface." Held by: one global default, one
  reference override, four tokens.

## Definition of done

`print-base` ships `--print-ink/-paper/-line/-muted` with a B/W + light-gray
default every theme inherits; print rules and the docs-site print layer read
the tokens; `$legible` is a deprecated no-op; one reference theme demonstrates a
per-theme print override; print tokens are optional contract tokens; docs
explain themeable print and the analyzer's print-awareness; print output is
verified across a light theme, a dark-only theme, and the override.

## Related

- `scss/_mixins.scss` (`print-base`, `print-hidden`, `print-only`),
  `src/app/print.scss`, `scripts/theme-contract.json`, `scripts/theme-validator.js`.
- Builds on v1.2 EPIC-04 (print recipe, delivered early) and the 2026-09-07
  external-review print/analyzer work.
- Analyzer print-awareness (hard-coded-color skips `@media print`) shipped
  2026-09-08 on `feature/analyzer-health-report` as the interim; this epic makes
  the print layer token-driven so it's clean on every axis.
- [[project_theme_architecture_locked]], [[feedback_user_power_principle]],
  [[project_ship_then_see_rule]].
