# path-a-gut-check — bare-tag styling decision

## Premise

Mid-v1.0, the question came up: should css-is-awesome ship a global
**bare-tag styling layer** (cascade layers + `:where()` pre-styling
`<button>`, `<h1>`, `<table>`, etc.) so the library lives up to
"drop the CSS file and it looks decent" — Pico.css territory?

That option was named **Path A**. Jerry counter-proposed a non-invasive
alternative: library ships tokens + mixins + components + utilities,
consumer writes `button { @include cia.btn(primary); }` themselves —
**library = vocabulary, consumer = composition** — with an optional
recipe file as a one-line opt-in for the Pico-style experience.

This folder captures the two gut-check prompts sent to Gemini
(20yr-web-designer persona, no diplomatic hedging) to pressure-test both
paths before committing.

## Files

| File | Probes |
|------|--------|
| `gemini-prompt.txt` | Path A on its own — does `@layer` + `:where()` bare-tag styling serve the drop-in promise, or contradict it? Ship it or skip it? |
| `gemini-prompt-2.txt` | Jerry's counter-approach — vocabulary/composition split with optional `_bare-tags.scss` recipe. Better fit than Path A, or worse? |

Both prompts capped at 250 words, no hedging, designer POV (not dev).
Responses themselves aren't archived here — they fed directly into the
decision below.

## Outcome

**Jerry's approach won, with the recipe as the escape hatch.**

Shipped 2026-04-26 (commit `b64d8d6`) as `scss/recipes/_bare-tags.scss`.
Default install stays non-invasive; consumers who want Pico-mode opt in
via one line:

```scss
@use 'css-is-awesome/scss/recipes/bare-tags';
```

Recipe uses normal selectors (specificity `0,0,1`) — no `@layer` or
`:where()` machinery in the library. Class-based overrides win
automatically. Mixin-first stays the focus.

---

*Archived — not load-bearing. Reference material for the bare-tag
decision; the actual implementation lives in `scss/recipes/_bare-tags.scss`.*
