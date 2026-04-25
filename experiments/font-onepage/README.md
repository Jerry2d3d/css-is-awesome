# One-off page font — design exercise

## The problem

A consumer of css-is-awesome has a single page (e.g., `/special-landing`,
a marketing splash, a blog post, a 404 page with a fun handwritten
headline) that needs a different font from the theme. They don't want to:

- Fork the theme.
- Edit `public/theme.css`.
- Write a whole new theme just for one page.
- Touch any token contract.

They want **one line** of SCSS (or one component prop) that drops a
new font in for that page only.

## What we already have

Our font system today (in `scss/_mixins.scss`):

```scss
$_font-types: (reg, italic, light, medium, semibold, bold, black, …);

@mixin font($type: reg, $size: null, $lh: null, $ls: null, $family: null) {
  // map.get($_font-types, $type) → weight + style
  // optional family override via $family
}
```

Plus theme tokens: `--font-display`, `--font-script`, `--font-serif`,
`--font-sans`, `--font-mono` — set per theme in
`public/theme.css [data-theme="…"]`.

**Today's gap:** there's no ergonomic way to add a font that isn't already
in the theme. To use Pacifico for a single page, a user has to:
1. Add a `@import url('https://fonts.googleapis.com/...')` somewhere global.
2. Apply `font-family: 'Pacifico', cursive` via raw CSS or a custom mixin.
3. Hope the import doesn't conflict with the theme's `@import` rule.

That's three mental steps and a global edit for one page.

## Goal

Design the **one-line API** that makes adding a one-off font frictionless,
without breaking the theme system.

Examples of what the API might look like (don't pick yet — that's the
exercise):

```scss
// option A — single mixin
.special-landing { @include font-family('Pacifico', cursive); }

// option B — load + apply
@include load-font('Pacifico');
.special-landing { font-family: 'Pacifico', cursive; }

// option C — auto-applied via a class
.cia-font-pacifico { /* generated when you @include load-font('Pacifico') */ }

// option D — scoped CSS variable override
.special-landing { @include override-font-display('Pacifico'); }
```

## Constraints (non-negotiable)

1. Must work in Next 15 static export (no runtime-only tricks).
2. Must NOT break theme swap — applying a one-off font on `/special-landing`
   shouldn't poison the rest of the site or interact with `data-theme`.
3. Token-driven where it makes sense — but a one-off font is by definition
   *outside* the contract, so don't try to cram it in.
4. Should support at least Google Fonts URL imports. Self-hosted (`@font-face`)
   is a stretch goal.
5. Should compose with our existing `@mixin font($type, $size, …)` —
   ideally a user can do both (`font(bold, 4)` for weight/size + the new
   API for family) without conflict.
6. No new dependencies. No build-step injection. Pure SCSS / CSS.
7. Idempotent — if two pages call `@include load-font('Pacifico')`, the
   font URL appears once, not twice.

## Targets

- Make the common case **one line** in the consumer's SCSS.
- Make the uncommon case (self-hosted file) at most three lines.
- Don't introduce a global side-effect that consumers can't see.

## How this exercise works

Six independent proposals — three from Claude, three from Gemini, all
20yr-experience personas:

```
experiments/font-onepage/
├── README.md                ← this file
├── claude-webdesign.md      ← Claude as 20yr web designer
├── claude-frontend.md       ← Claude as 20yr front-end dev
├── claude-dev.md            ← Claude as 20yr software dev
├── gemini-webdesign.md      ← Gemini as 20yr web designer
├── gemini-frontend.md       ← Gemini as 20yr front-end dev
└── gemini-dev.md            ← Gemini as 20yr software dev
```

Each file:

1. **API proposal** — what the consumer writes (one or two SCSS lines,
   ideally one).
2. **Implementation** — the mixin(s) that make it work, full code block.
3. **Rationale** — 5–10 lines on why this is the right shape.
4. **Edge cases** — what happens with: two pages using the same font;
   a self-hosted font file; a font that conflicts with the theme's
   `--font-display`; a theme swap mid-page.
5. **Tradeoffs** — what they gave up to get it.

After all 6 land, the manager picks the strongest 2–3 ideas and
presents to Jerry for the final pick.

## Reference

- Existing font mixin: `scss/_mixins.scss:160`
- Theme font tokens: `--font-display`, `--font-script`, `--font-serif`,
  `--font-sans`, `--font-mono` in `public/theme.css [data-theme="…"]`
- Today's `@import url(…)` lives at the top of `public/theme.css` and
  combines all six themes' Google Font families into one URL.
