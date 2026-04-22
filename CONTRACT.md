# css-is-awesome — Token Contract

Every theme declares these tokens. The [theme validator](./scripts/theme-validator.js) enforces completeness on every PR against the machine-readable companion at [`scripts/theme-contract.json`](./scripts/theme-contract.json).

- **Source of truth:** this document.
- **Reference implementation:** [`public/theme.css`](./public/theme.css) (Sketchbook).
- **Validate a theme:** `node scripts/theme-validator.js <path-to-theme.css>`
- **Validate every theme in the repo:** `npm run validate-themes`

A theme file is a single `:root { … }` block plus (optionally) an `@import` for fonts. No component CSS lives in a theme file. Tokens only.

---

## How tokens reach the library

Library mixins resolve every token through a `var(--token, fallback)` pattern, so:

| Mixin call                       | Emitted CSS                              | Required token       |
| -------------------------------- | ---------------------------------------- | -------------------- |
| `m.color(surface-default)`       | `var(--surface-default, #fff)`           | `--surface-default`  |
| `m.space(md)`                    | `var(--space-md, 1rem)`                  | `--space-md`         |
| `m.radius(lg)`                   | `var(--radius-lg, 0.5rem)`               | `--radius-lg`        |
| `m.shadow(md)`                   | `var(--shadow-md, …)`                    | `--shadow-md`        |
| `m.font-family(primary)`         | `var(--font-primary, sans-serif)`        | `--font-primary`     |
| `m.font-size(base)`              | `var(--font-size-base, 1rem)`            | `--font-size-base`   |
| `m.line-height(normal)`          | `var(--line-height-normal, 1.5)`         | `--line-height-normal` |
| `m.font-weight(medium)`          | `var(--font-weight-medium, 500)`         | `--font-weight-medium` |
| `m.z(modal)`                     | `var(--z-modal, 0)`                      | `--z-modal`          |

If a token is missing from a theme the mixin silently falls back to a sensible SCSS default — which means the theme swap is no longer lossless. That is what the contract prevents.

---

## Native Sketchbook palette

These are the raw pigment tokens. Semantic aliases below reference them. In other themes (Press, Graphite, Glass, …) the native names change; the aliases do not.

### Paper (surfaces)

| Token           | Type  | Example                         | Purpose                            |
| --------------- | ----- | ------------------------------- | ---------------------------------- |
| `--paper`       | color | `#F7F3EA`                       | Page background — the "paper"      |
| `--paper-raised`| color | `#FDFAF2`                       | Lifted panel / card background     |
| `--paper-sunk`  | color | `#ECE5D3`                       | Pressed / recessed surface         |
| `--paper-glass` | color | `rgba(253, 250, 242, 0.75)`     | Translucent surface (glass themes) |

### Ink (text hierarchy)

| Token         | Type  | Example   | Purpose                            |
| ------------- | ----- | --------- | ---------------------------------- |
| `--ink`       | color | `#2A241E` | Primary type — body copy, headings |
| `--ink-soft`  | color | `#4A4037` | Secondary type                     |
| `--ink-faint` | color | `#726858` | Muted / hint type                  |
| `--graphite`  | color | `#3A332B` | Emphasis stroke / chart ink        |
| `--muted`     | color | `#948977` | Captions, low-emphasis metadata    |

### Construction lines

| Token          | Type  | Example   | Purpose                |
| -------------- | ----- | --------- | ---------------------- |
| `--guide`      | color | `#C9BDA5` | Layout guide / grid line |
| `--guide-soft` | color | `#DDD4C0` | Secondary guide        |
| `--hair`       | color | `#D4CCBB` | Default border         |
| `--hair-soft`  | color | `#E8E2D4` | Subtle divider         |

### Primary accent (indigo)

| Token        | Type  | Example   | Purpose                            |
| ------------ | ----- | --------- | ---------------------------------- |
| `--ai`       | color | `#1F3A5F` | Primary action / link / focus ring |
| `--ai-ink`   | color | `#14263F` | Hover / active darker variant      |
| `--ai-wash`  | color | `#E5EBF1` | Wash tint for backgrounds          |

### Seal (vermilion)

| Token       | Type  | Example   | Purpose                       |
| ----------- | ----- | --------- | ----------------------------- |
| `--shu`     | color | `#C1272D` | Secondary / editorial emphasis |
| `--shu-wash`| color | `#F6E3E1` | Wash tint                     |

### Draft / marginalia (ochre)

| Token         | Type  | Example   | Purpose                   |
| ------------- | ----- | --------- | ------------------------- |
| `--ochre`     | color | `#A37B30` | Tertiary / warning accent |
| `--ochre-wash`| color | `#F0E5CC` | Wash tint                 |

### Code panel

| Token           | Type  | Example   | Purpose                       |
| --------------- | ----- | --------- | ----------------------------- |
| `--code-bg`     | color | `#2B2420` | Code block background         |
| `--code-ink`    | color | `#F7F3EA` | Code body text                |
| `--code-muted`  | color | `#A39787` | Code comments                 |
| `--code-accent` | color | `#E5B660` | Literals / values             |
| `--code-green`  | color | `#A8B86C` | Keywords / properties         |
| `--code-blue`   | color | `#94AFC9` | Selectors / tags              |

---

## Semantic aliases (library mixins read these)

### Backgrounds (page-level)

| Token                  | Type  | Purpose                              |
| ---------------------- | ----- | ------------------------------------ |
| `--background-default` | color | Default page background              |
| `--background-subtle`  | color | Alternate / striped section          |
| `--background-navbar`  | color | Dedicated navbar background          |

### Surfaces (panel-level)

| Token                | Type  | Purpose                           |
| -------------------- | ----- | --------------------------------- |
| `--surface-default`  | color | Card / panel default              |
| `--surface-raised`   | color | Lifted card (elevation)           |
| `--surface-sunk`     | color | Pressed / recessed                |
| `--surface-muted`    | color | Muted field / disabled panel      |
| `--surface-subtle`   | color | Subtle highlight                  |
| `--surface-emphasis` | color | Inverse / emphasis surface        |
| `--surface-glass`    | color | Translucent (glass themes)        |

### Text

| Token                | Type  | Purpose                           |
| -------------------- | ----- | --------------------------------- |
| `--text-primary`     | color | Body copy, headings               |
| `--text-secondary`   | color | Supporting copy                   |
| `--text-muted`       | color | Hint / help / placeholder         |
| `--text-tertiary`    | color | Low-emphasis metadata             |
| `--text-inverse`     | color | Text on dark / colored surface    |
| `--text-link`        | color | Default anchor color              |
| `--text-link-hover`  | color | Anchor hover color                |

### Borders

| Token                | Type  | Purpose                          |
| -------------------- | ----- | -------------------------------- |
| `--border-default`   | color | Default border                   |
| `--border-subtle`    | color | Subtle divider                   |
| `--border-emphasis`  | color | Emphasized border                |
| `--border-focus`     | color | Focus ring color                 |

### Interactive (hover / active wash)

| Token                 | Type  | Purpose                            |
| --------------------- | ----- | ---------------------------------- |
| `--interactive-hover` | color | Wash applied to interactive hover  |
| `--interactive-active`| color | Wash applied to interactive active |

### Brand

| Token                  | Type  | Purpose                           |
| ---------------------- | ----- | --------------------------------- |
| `--brand-primary`      | color | Brand identity color              |
| `--brand-primary-hover`| color | Brand hover color                 |

### Action — primary / secondary / tertiary

| Token                         | Type  | Purpose                     |
| ----------------------------- | ----- | --------------------------- |
| `--action-primary-default`    | color | Primary button / CTA        |
| `--action-primary-hover`      | color | Primary hover               |
| `--action-primary-active`     | color | Primary pressed             |
| `--action-primary-wash`       | color | Primary subtle background   |
| `--action-secondary-default`  | color | Secondary button            |
| `--action-secondary-hover`    | color | Secondary hover             |
| `--action-secondary-active`   | color | Secondary pressed           |
| `--action-secondary-wash`     | color | Secondary subtle background |
| `--action-tertiary-default`   | color | Tertiary button             |
| `--action-tertiary-hover`     | color | Tertiary hover              |
| `--action-tertiary-active`    | color | Tertiary pressed            |
| `--action-tertiary-wash`      | color | Tertiary subtle background  |

### Feedback (high-level semantic)

| Token                | Type  | Purpose              |
| -------------------- | ----- | -------------------- |
| `--feedback-info`    | color | Info / neutral cue   |
| `--feedback-success` | color | Success cue          |
| `--feedback-warning` | color | Warning cue          |
| `--feedback-error`   | color | Error / destructive  |

### Status (three-part: default / subtle / text)

| Token                | Type  | Purpose                                      |
| -------------------- | ----- | -------------------------------------------- |
| `--info-default`     | color | Alert / badge strong tone                    |
| `--info-subtle`      | color | Alert / badge wash background                |
| `--info-text`        | color | Alert / badge body copy                      |
| `--success-default`  | color | Success alert strong tone                    |
| `--success-subtle`   | color | Success wash                                 |
| `--success-text`     | color | Success body copy                            |
| `--warning-default`  | color | Warning strong tone                          |
| `--warning-subtle`   | color | Warning wash                                 |
| `--warning-text`     | color | Warning body copy                            |
| `--error-default`    | color | Error strong tone                            |
| `--error-subtle`     | color | Error wash                                   |
| `--error-text`       | color | Error body copy                              |

---

## Typography

| Token                | Type         | Example                           | Purpose                        |
| -------------------- | ------------ | --------------------------------- | ------------------------------ |
| `--font-display`     | font-family  | `'DM Serif Display', …, serif`    | Large display / hero type      |
| `--font-serif`       | font-family  | `'Noto Serif JP', …, serif`       | Body serif                     |
| `--font-sans`        | font-family  | `'Noto Sans JP', …, sans-serif`   | Body sans                      |
| `--font-script`      | font-family  | `'Caveat', …, cursive`            | Handwriting / marginalia       |
| `--font-mono`        | font-family  | `'JetBrains Mono', …, monospace`  | Code                           |
| `--font-primary`     | font-family  | `var(--font-sans)`                | Default body — emitted by `m.font-family(primary)` |
| `--font-size-base`   | length       | `1rem`                            | Base body size                 |
| `--line-height-normal` | number     | `1.5`                             | Default line-height            |
| `--font-weight-medium` | number     | `500`                             | Medium weight (used by buttons) |

---

## Space scale

| Token         | Type   | Example   | Purpose                     |
| ------------- | ------ | --------- | --------------------------- |
| `--space-2xs` | length | `0.25rem` | Hairline gap / 2xs padding  |
| `--space-xs`  | length | `0.5rem`  | Tight gap / xs padding      |
| `--space-sm`  | length | `0.75rem` | Compact gap / sm padding    |
| `--space-md`  | length | `1rem`    | Default gap / md padding    |
| `--space-lg`  | length | `1.5rem`  | Comfortable gap / lg padding |
| `--space-xl`  | length | `2rem`    | Section gap / xl padding    |

---

## Radius

Sketchbook keeps native `--r-*` (drawn-on-paper feel) plus an alias set `--radius-*` that the library mixins emit. Other themes may set both to the same value.

| Token         | Type   | Example       | Purpose                         |
| ------------- | ------ | ------------- | ------------------------------- |
| `--r-sm`      | length | `2px`         | Native small radius (Sketchbook) |
| `--r-md`      | length | `3px`         | Native medium radius             |
| `--r-lg`      | length | `6px`         | Native large radius              |
| `--radius-sm` | length | `var(--r-sm)` | Library alias (mixins emit this) |
| `--radius-md` | length | `var(--r-md)` | Library alias                    |
| `--radius-lg` | length | `var(--r-lg)` | Library alias                    |
| `--radius-xl` | length | `0.75rem`     | Modals / large panels            |
| `--radius-full` | length | `9999px`    | Pills, avatars, circles          |

---

## Shadow

| Token         | Type       | Example                                 | Purpose                      |
| ------------- | ---------- | --------------------------------------- | ---------------------------- |
| `--shadow-sm` | box-shadow | `0 1px 2px rgba(…, .06)`                | Card-level lift              |
| `--shadow-md` | box-shadow | `0 4px 18px rgba(…, .08)`               | Dropdowns, popovers          |
| `--shadow-lg` | box-shadow | `0 12px 40px rgba(…, .12)`              | Toasts, floating panels      |
| `--shadow-xl` | box-shadow | `0 20px 50px rgba(…, .16)`              | High-elevation surfaces      |
| `--shadow-2xl`| box-shadow | `0 28px 70px rgba(…, .22)`              | Modal backdrops              |

---

## Blur / Glow

Paper themes declare these as `none` / `transparent` so a swap to a glass or phosphor theme is lossless.

| Token        | Type   | Example             | Purpose                                |
| ------------ | ------ | ------------------- | -------------------------------------- |
| `--blur-sm`  | length | `none`              | Glass surface subtle blur              |
| `--blur-md`  | length | `none`              | Glass medium blur                      |
| `--blur-lg`  | length | `none`              | Glass heavy blur                       |
| `--glow-sm`  | shadow | `0 0 0 transparent` | Subtle glow (phosphor / emphasis themes) |
| `--glow-md`  | shadow | `0 0 0 transparent` | Medium glow                            |
| `--glow-lg`  | shadow | `0 0 0 transparent` | Heavy glow                             |

---

## Motion

| Token               | Type     | Example                        | Purpose                   |
| ------------------- | -------- | ------------------------------ | ------------------------- |
| `--duration-fast`   | duration | `180ms`                        | Fast interactions (hover) |
| `--duration-normal` | duration | `240ms`                        | Default transitions       |
| `--duration-slow`   | duration | `380ms`                        | Deliberate motion         |
| `--ease`            | timing   | `cubic-bezier(.33,.66,.33,1)`  | Default easing curve      |

---

## Z-index layers

| Token          | Type   | Example | Purpose                |
| -------------- | ------ | ------- | ---------------------- |
| `--z-sticky`   | number | `1020`  | Sticky headers         |
| `--z-dropdown` | number | `1030`  | Dropdown menus         |
| `--z-backdrop` | number | `1040`  | Modal backdrop         |
| `--z-modal`    | number | `1050`  | Modal surface          |
| `--z-popover`  | number | `1060`  | Popover / detached panel |
| `--z-tooltip`  | number | `1070`  | Tooltips (always top)  |

---

## Versioning

The contract is versioned via `scripts/theme-contract.json` (`version: "1"`).

- **Minor bump** (`"1" → "1.1"`): adds OPTIONAL tokens. Existing themes remain valid.
- **Major bump** (`"1" → "2"`): renames or removes REQUIRED tokens. Existing themes must migrate.

Any PR that adds a new `m.color(X)` / `m.space(X)` / `m.radius(X)` reference in the library must add `--X` to both this document and `scripts/theme-contract.json`, and add a declaration to every theme in `public/theme.css` and `public/themes/*/theme.css`. The `npm run validate-themes` check in CI will block the merge otherwise.
