# EPIC v1.4-01 — Page surfaces (`hero` + `band`)

**Status:** 📐 Planned — design locked with Jerry 2026-09-19, not started. Four open questions below block the first commit.
**Effort estimate:** ~2-3 working days
**Stories:** 8

## Mission

Give every theme two page-level backgrounds it can own outright — a **hero** surface for the front page and a **band** surface for section stripes and the footer — each with a colour, an optional gradient or image, an ink colour that is guaranteed legible on it, and a scrim that makes text over images safe by default. Applied with one include or one body attribute. Editable in the theme editor. Dogfooded on the docs site's own home page.

## Why now

Themes today reskin *components*; the page behind them is one flat `--paper`. The first thing a real consumer (Gremlin Forge's theme step, 2026-09-18) wants from a theme is "the front page looks different from the inside pages" — and cia has an optional `--background-hero` token in the contract that nothing reads, nothing documents and the editor cannot set. This epic makes that slot real instead of dead, and adds the second slot most sites need.

## Design (locked 2026-09-19)

### Tokens — contract 1.3, optional feature `page-surfaces`

| Token | Type | Default when absent |
|---|---|---|
| `--page-hero-bg` | colour (light/dark paired) | the inside background (`--paper`) |
| `--page-hero-image` | `linear-gradient(…)` or `url()` the consumer hosts | `none` |
| `--page-hero-ink` | colour | `--text-primary` |
| `--page-hero-scrim` | colour with alpha | `rgb(0 0 0 / 0.5)` when an image is set, otherwise `none` |
| `--page-band-*` | same four | same fallbacks |

- The **inside** surface is not a new token: it is the theme's existing `--paper` / `--surface-default`.
- The dead optional `--background-hero` becomes an alias of `--page-hero-bg` (kept valid, no rename for consumers).
- All colours are `light-dark()` paired like every other colour token; images are shared across modes unless the theme sets a paired value.
- Optional with fallback → contract **1.3** (minor). Making them required would be a 2.0; decided against for now.

### One include, one attribute, same tokens

```scss
.landing { @include cia.surface(hero); }   // colour + image + scrim + ink, together
```

```html
<body data-surface="hero">…</body>          <!-- whole page, no SCSS -->
```

Both paths read the same custom properties, so there is one place to maintain. The scrim is layered as a gradient in the same `background-image` as the image — no extra element, so it works on `body` and on a section alike.

### Contrast

Two new audit pairs — `--page-hero-ink` on `--page-hero-bg`, `--page-band-ink` on `--page-band-bg` — graded only when the slot is declared. Images cannot be audited automatically; the default scrim is the safety net (40-60 % black is the working standard for light text over photos, WCAG targets unchanged at 4.5:1 body / 3:1 large).

### Theme editor

A "Page surfaces" section with, per slot: colour (light + dark), image (URL field — a theme is one CSS file, so images are hosted by the consumer), ink, scrim strength. Live preview on the home page.

### Docs site

Home page = `hero`. Band on the home feature stripe and the site footer. Every other page = inside. This is the dogfood and the editor's preview target.

## Open questions (Jerry, 2026-09-19)

1. Confirm the `--page-*` naming (recommended) over extending the `--background-*` alias family.
2. Band placement on the site: home feature stripe + footer, as above?
3. Image input in the editor: URL field only (honest for a one-file theme), or also an upload that inlines a data URI?
4. Scrim default strength: 50 %?

## Features

### F1.1 — Contract 1.3: the eight tokens + feature group

#### US-V14.01.1.1 — Add the `page-surfaces` optional feature

**As** a theme author
**I want** eight optional tokens grouped as one feature
**So that** the validator can say "missing the tokens for page surfaces" and nothing breaks when I omit them

**Acceptance criteria:**
- [ ] `scripts/theme-contract.json`: eight tokens in `optional`, one `features.page-surfaces` entry, `version` `"1.2"` → `"1.3"`
- [ ] `npm run check:contract` passes (optional added + minor bump) and still fails if a token is orphaned
- [ ] `--background-hero` documented as an alias of `--page-hero-bg` in CONTRACT.md; the generator emits the alias
- [ ] CONTRACT.md feature table updated; MIGRATION.md gets a one-paragraph note

**Effort:** S (≤4 hrs)

### F1.2 — The mixin and the body attribute

#### US-V14.01.2.1 — `cia.surface($slot)` + `[data-surface]`

**Acceptance criteria:**
- [ ] `cia.surface(hero|band)` sets `background-color`, `background-image` (scrim gradient layered over the image, `background-size: cover`), and `color` from the slot's tokens with the fallbacks above
- [ ] `body[data-surface="hero"]` / `"band"` emitted once from the base layer, reading the same tokens
- [ ] Unknown slot → `@error` naming the two valid slots
- [ ] `validate-api` / `coverage:api` see the new mixin; the theme validator's audit gains the two pairs, skipped when undeclared

**Effort:** M (4-8 hrs)

### F1.3 — Theme editor "Page surfaces" section

#### US-V14.01.3.1 — Edit both slots live

**Acceptance criteria:**
- [ ] Per slot: colour (light/dark), image URL, ink, scrim strength; rows apply live via the same override `<style>` path as every other row (selector shape `:root[data-theme="x"]`)
- [ ] Preview target is the home page; the downloaded `theme.css` carries the tokens
- [ ] Optional rows are pre-filled with the fallback and clearly marked optional

**Effort:** M (4-8 hrs)

### F1.4 — Dogfood + docs

#### US-V14.01.4.1 — Home page hero, band stripe + footer, docs

**Acceptance criteria:**
- [ ] `/` uses `cia.surface(hero)`; the feature stripe and the site footer use `band`; no other page changes
- [ ] All 24 shipped themes define at least `--page-hero-bg` (a designed value, not the fallback) — the sketchbook one first
- [ ] `/docs/authoring/themes` section "Page surfaces"; `/docs/tokens` rows; llm.txt + AGENTS.md mention the mixin and the attribute
- [ ] Visual + RTL baselines regenerated (linux via the CI report artifact); axe clean on `/`

**Effort:** M (4-8 hrs)

## Definition of done

- [ ] All 8 stories accepted; contract 1.3 released as a library MINOR
- [ ] A consumer theme that declares none of the eight tokens renders and validates exactly as before
- [ ] A consumer theme that declares an image gets legible text without touching the scrim
- [ ] Gremlin Forge / boilerplate told the eight token names and the feature name

## Risks

- **Images in a one-file theme.** A `url()` the consumer hosts is the only honest path; the editor must not pretend to store files.
- **Audit blind spot.** Contrast over an image is not measurable; the default scrim and the docs have to carry that weight. Say so in CONTRACT.md.
- **Scope creep into layout.** `cia.surface` sets surface, image, scrim and ink — not padding, min-height or typography. Those stay with the layout mixins.

## Related

- [v1-1/EPIC-05-density-knob.md](../v1-1/EPIC-05-density-knob.md) — the last "one theme knob changes the whole page" feature; same shape of change
- [`../../../CONTRACT.md`](../../../CONTRACT.md) — "Optional tokens by feature" table this extends
- [`../../handoffs/2026-09-18-gremlin-forge-boilerplate.md`](../../handoffs/2026-09-18-gremlin-forge-boilerplate.md) — the consumer this is sequenced for
