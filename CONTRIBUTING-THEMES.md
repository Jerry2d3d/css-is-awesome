# Contributing a theme

Themes are first-class citizens in css-is-awesome. Anyone can ship one.

This guide walks you through authoring a new theme, validating it locally,
and submitting it via PR. If you're just swapping between shipped themes
(Sketchbook, Press, Graphite, Glass, Cupertino, Terminal), see
[THEMING.md](./THEMING.md) instead.

## The model

- A theme is a single CSS file that declares every token in the
  [token contract](./CONTRACT.md).
- No SCSS, no build step, no JavaScript. Just CSS custom properties on
  `:root`.
- Swap the file, the whole system re-skins. The library reads every
  visual value through `var(--token, fallback)`; themes provide the
  values.
- One `:root { … }` block plus (optionally) an `@import` for fonts. No
  component CSS lives in a theme file. Tokens only.

## Quickstart

1. Copy `public/theme.css` to `public/themes/my-theme/theme.css`.
2. Open it and replace token values with your own palette. Keep every
   token name — delete none.
3. Register your theme in the docs picker by adding one line to
   `src/components/ThemePicker/ThemePicker.tsx` (see the `THEMES` array).
4. Run the validator:
   ```bash
   node scripts/theme-validator.js public/themes/my-theme/theme.css
   ```
5. Open the docs site (`npm run dev`), switch to your theme via the
   picker, verify it re-skins end-to-end.
6. `npm run validate-themes` (runs against every theme) and
   `npm run build` (Next.js docs site) must both exit 0.
7. Screenshot `/` and `/showcase` in your theme, open a PR.

That's the whole loop. Most authors land in under an hour once the
palette is chosen.

## The token contract

See [CONTRACT.md](./CONTRACT.md) for the authoritative list. As of
contract v1 it covers **123 required tokens** across 16 categories:

| Category      | Example tokens                                             |
| ------------- | ---------------------------------------------------------- |
| Surfaces      | `--paper`, `--paper-raised`, `--paper-sunk`, `--paper-glass` |
| Ink           | `--ink`, `--ink-soft`, `--ink-faint`, `--graphite`, `--muted` |
| Lines         | `--guide`, `--guide-soft`, `--hair`, `--hair-soft`         |
| Primary accent| `--ai`, `--ai-ink`, `--ai-wash`                            |
| Seal          | `--shu`, `--shu-wash`                                      |
| Marginalia    | `--ochre`, `--ochre-wash`                                  |
| Code panel    | `--code-bg`, `--code-ink`, `--code-muted`, `--code-accent`, `--code-green`, `--code-blue` |
| Semantic bg   | `--background-default`, `--background-subtle`, `--background-navbar` |
| Surfaces (alias) | `--surface-default`, `--surface-raised`, `--surface-sunk`, `--surface-muted`, `--surface-subtle`, `--surface-emphasis`, `--surface-glass` |
| Text          | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-tertiary`, `--text-inverse`, `--text-link`, `--text-link-hover` |
| Borders       | `--border-default`, `--border-subtle`, `--border-emphasis`, `--border-focus` |
| Interactive   | `--interactive-hover`, `--interactive-active`              |
| Brand + action | `--brand-primary*`, `--action-primary/secondary/tertiary-*` |
| Feedback + status | `--feedback-*`, `--info/success/warning/error-{default,subtle,text}` |
| Typography    | `--font-display`, `--font-sans`, `--font-serif`, `--font-script`, `--font-mono`, `--font-primary`, `--font-size-base`, `--line-height-normal`, `--font-weight-medium` |
| Scale + shape | `--space-*`, `--r-*`, `--radius-*`, `--shadow-*`, `--blur-*`, `--glow-*`, `--duration-*`, `--ease`, `--z-*` |

Every theme MUST declare every required token. The validator will fail
PRs that miss anything.

## Author checklist

Copy this into your PR description and tick as you go.

```
- [ ] Theme folder exists: public/themes/{slug}/theme.css
- [ ] File starts with a header comment (2-4 lines, describes mood)
- [ ] Single :root { ... } block declares all 123 required tokens
- [ ] Font @import (if any) sits at the top of the file
- [ ] Theme registered in src/components/ThemePicker/ThemePicker.tsx
- [ ] Optional: per-theme icon pack at public/themes/{slug}/icons/
- [ ] node scripts/theme-validator.js public/themes/{slug}/theme.css  exits 0
- [ ] npm run validate-themes  exits 0 (all themes)
- [ ] npm run build  exits 0 (Next.js docs site)
- [ ] npm run build:css  exits 0 (library)
- [ ] Screenshots of /showcase and / attached to PR
- [ ] WCAG AA verified for body text over --background-default
```

## Palette choices

Color choices matter. Every semantic slot has a job; picking the right
pigment for the right slot is what makes a theme feel coherent rather
than arbitrary.

| Token                 | Purpose                                | Contrast target                      |
| --------------------- | -------------------------------------- | ------------------------------------ |
| `--paper`             | Page background                        | n/a (it's the floor)                 |
| `--paper-raised`      | Lifted card / panel                    | readable below `--ink`               |
| `--paper-sunk`        | Pressed / recessed surface             | readable below `--ink`               |
| `--ink`               | Body text, headings                    | WCAG AA 4.5:1 vs `--paper`           |
| `--ink-soft`          | Supporting copy                        | WCAG AA 4.5:1 vs `--paper`           |
| `--ink-faint`         | Hint / placeholder / captions          | 3:1 acceptable for non-essential     |
| `--ai`                | Primary action, links, focus ring      | AA 4.5:1 vs `--paper-raised`         |
| `--shu`               | Secondary / editorial accent; error    | AA 3:1 vs `--paper` (large UI)       |
| `--ochre`             | Tertiary; warning                      | AA 3:1 vs `--paper` (large UI)       |
| `--hair`              | Default border                         | perceptible against `--paper`        |
| `--border-focus`      | Keyboard focus ring                    | AA 3:1 vs adjacent surface           |
| `--code-ink` on `--code-bg` | Code body over code surface      | AA 4.5:1                             |

Rule of thumb: pick the three accent hues (`--ai`, `--shu`, `--ochre`)
first, then build paper/ink around them. A theme fails the "mood test"
when the accents don't have a reason to be together.

## Light / dark mode

Themes are swappable at runtime via a single `<link>` tag. Dark themes
(Graphite, Terminal) are **their own files**, not a mode of a light
theme. Trying to bolt dark mode onto a light file means fighting the
one-file-swap guarantee.

On first page load the docs app checks `prefers-color-scheme`. If the
user has never picked manually, dark systems get **Graphite** by default
and light systems get **Sketchbook**. Any manual choice in the
ThemePicker, the header dropdown, or the light/dark toggle persists in
a `cia-theme` cookie (read by the inline pre-hydration script in
`src/app/layout.tsx`) and overrides the OS from then on.

If your theme is a dark theme:

- Pick translucent-**white** overlays for `--interactive-hover` and
  `--interactive-active` (e.g. `rgba(255,255,255,0.08)`). Translucent-ink
  is invisible on dark.
- Keep `--shadow-*` subtle — in dark themes, shadows read as "halos" of
  lifted light rather than cast shadows.
- `--border-default` usually wants `rgba(255,255,255,~0.1)`, not a
  discrete gray — it holds up across gradient surfaces.

## Sizing scale — t-shirt vs numbered

The library's sizing scale is numbered (`1..9` for space, `1..10` for
font size) with t-shirt aliases (`xs / sm / md / lg / xl / …`) layered
on top. Both call styles produce identical output — `m.space(4)` and
`m.space(md)` both resolve to `1rem`, and the generator emits
`--space-4` **and** `--space-md` at `:root`.

Theme files declare the t-shirt slots the contract requires
(`--space-2xs` through `--space-xl`); the numeric aliases are emitted by
the library generator. Copy the space / radius / shadow / motion / z
blocks from `public/theme.css` verbatim unless your theme has a reason
to change the rhythm (Terminal, for example, zeroes all radii). These
scales are universal by design.

For the full t-shirt ↔ numeric mapping tables, see the Epic 1.1 note in
[CHANGELOG.md](./CHANGELOG.md).

## Per-theme icon packs (optional)

A theme can ship its own icon set at `public/themes/{slug}/icons/`.
Icons are drop-in SVG files — no registration, the folder *is* the
library. Use `currentColor` inside the SVGs so they reskin with the
surrounding text color automatically. See
[public/icons/README.md](./public/icons/README.md) for the default pack
convention.

If you omit a per-theme icon folder, the theme falls back to the shared
pack at `public/icons/`.

## Component overrides (optional)

Theme files (`theme.css`) are tokens-only. If you want to push a theme's
identity into component defaults (a press-serif button radius, a
terminal-square input radius), the library exposes an SCSS-level
`$components` map in
[`scss/theme/_components.scss`](./scss/theme/_components.scss). Consumers
who build the library from source can override this map.

For PR'd themes that ship in this repo, keep overrides restrained:
4-6 component tokens at most. The point of a theme is to re-skin via
tokens, not to rewrite components. If your theme needs heavy component
customization, that's a signal the contract is missing a token — open
an issue before opening the PR.

## Running the validator

The validator compares declared `--foo:` declarations in each theme's
`:root` block against the required list in
[`scripts/theme-contract.json`](./scripts/theme-contract.json). It is
zero-dependency Node and fast.

Validate every shipped theme (what CI runs):

```bash
npm run validate-themes
```

Validate a single file:

```bash
node scripts/theme-validator.js public/themes/my-theme/theme.css
```

Validate several:

```bash
node scripts/theme-validator.js public/theme.css public/themes/press-light/theme.css
```

Sample **success** output:

```
theme-validator — contract v1 (123 required tokens)

✓ public/theme.css passes (123 tokens declared)
✓ public/themes/press-light/theme.css passes (123 tokens declared)

OK — 2 theme file(s) validated
```

Sample **failure** output (missing two tokens):

```
theme-validator — contract v1 (123 required tokens)

x public/themes/my-theme/theme.css — 2 missing:
     --glow-md
     --surface-glass

FAIL — one or more theme files are incomplete
```

Exit codes: `0` all good, `1` missing tokens, `2` usage error (file not
found, etc.).

## Submitting a PR

1. **Branch name:** `theme/{your-theme-slug}` (e.g.
   `theme/indigo-warehouse`).
2. **Commit message:** `Theme: add {Name} ({short mood description})`.
3. **PR description** includes:
   - Mood / inspiration in one paragraph.
   - Screenshots of `/showcase` and `/` in your theme (light and dark
     OS preference if it affects first-load default).
   - Any component overrides you added and why.
   - Any known a11y caveats (color-blind pairings, low-contrast edges).
4. **The PR must pass:**
   - `npm run validate-themes` (all themes, not just yours).
   - `npm run build` (Next.js docs site).
   - `npm run build:css` (library).
5. **A maintainer reviews for:**
   - Contract completeness (validator catches this).
   - WCAG AA contrast on body text and primary actions (verify
     manually or via a tool like WebAIM's contrast checker).
   - **Mood distinctness** — a new theme should feel genuinely
     different from the six shipped ones. Another warm-paper variant
     gets rejected; a pastel bauhaus, a brutalist mono, or a
     synthwave-pink gets in.
   - Commit hygiene (one clean commit per theme where possible).

## Updating the contract

The contract version lives in
[`scripts/theme-contract.json`](./scripts/theme-contract.json) as
`"version"`. The rules:

- **Minor bump** (`"1" → "1.1"`): adds OPTIONAL tokens. Existing themes
  remain valid.
- **Major bump** (`"1" → "2"`): renames or removes REQUIRED tokens.
  Existing themes must migrate; migration note lands in
  [CHANGELOG.md](./CHANGELOG.md).

Any PR that introduces a new `m.color(X)` / `m.space(X)` / `m.radius(X)`
reference in the library must also add `--X` to
[CONTRACT.md](./CONTRACT.md), to `scripts/theme-contract.json`, and to
every theme under `public/theme.css` and `public/themes/*/theme.css`. CI
blocks the merge otherwise.

Contract changes are rare and always maintainer-driven, not
contributor-driven. If you think you need a new token, open an issue
first.

## Reference — the six shipped themes

| Theme            | File                                          | Mood                                                                 |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| sketchbook-light | `public/theme.css`                            | Warm washi paper, sumi ink, indigo accent (default light)            |
| press-light      | `public/themes/press-light/theme.css`         | Editorial newsprint, Playfair serif, single press-red accent         |
| graphite-dark    | `public/themes/graphite-dark/theme.css`       | Space-gray aluminum dark mode, system blue (default dark)            |
| glass-light      | `public/themes/glass-light/theme.css`         | visionOS glassmorphism, iOS indigo, dual-rim highlights              |
| cupertino-light  | `public/themes/cupertino-light/theme.css`     | macOS Sonoma window, SF Pro, system blue                             |
| terminal         | `public/themes/terminal/theme.css`            | VT100 phosphor green, zero radii, CRT glow (single-mode by design)   |

Each ships under `public/themes/{slug}/theme.css` (or `public/theme.css`
for the default). Read them as references — they demonstrate six
genuinely different ways to satisfy the same 123-token contract. If you
get stuck, the closest-mood shipped theme is usually the best starting
skeleton to copy.
