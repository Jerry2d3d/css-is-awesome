# buttonold refactor — design exercise

## Premise

`@mixin buttonold($button-type)` in `scss/components/_buttons.scss` is a preset dispatcher kept for back-compat. Today it's hex-coded, off-system, and duplicates work that `btn-base` already does:

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

## Goal

Refactor to **less code, cleaner**, while satisfying the constraints below.

Jerry's hypothesis: if `btn-base` itself absorbed a preset switch (or `buttonold` delegated cleanly to existing variant mixins), the whole system gets smaller.

## Constraints (non-negotiable)

1. Keep the public API: `@include buttonold(action) { ... }` must still work.
2. Keep the `@if / @else if` switch — three presets: `action`, `disabled`, `info`.
3. Keep `@content` so users can layer custom rules.
4. **Token-driven** values — no hex colors. Use `m.color(token-name)` against the semantic token contract (see `scripts/theme-contract.json`).
5. Variables stay overridable — users should be able to swap any token via named args.
6. Theme-swap-safe: switching `<html data-theme>` reskins it.

## Targets (soft)

- Less LOC than the current 15-line scratch.
- Reuse `btn-base` and the existing `btn-*` variants where it makes sense.
- Don't introduce a new abstraction unless it pays for itself in clarity.

## How this exercise works

Six independent proposals — three from Claude personas, three from Gemini personas:

```
experiments/buttonold/
├── README.md              ← this file
├── claude-frontend.md     ← Claude as 20yr front-end web designer
├── claude-dev.md          ← Claude as 20yr software dev
├── claude-scss.md         ← Claude as 20yr CSS/SCSS expert
├── gemini-frontend.md     ← Gemini as 20yr front-end web designer
├── gemini-dev.md          ← Gemini as 20yr software dev
└── gemini-scss.md         ← Gemini as 20yr CSS/SCSS expert
```

Each file:
1. **Proposed SCSS** — full code block, drop-in replacement for the current `buttonold`.
2. **Rationale** — 5–10 lines on what they changed and why.
3. **LOC comparison** — old vs new.
4. **Tradeoffs** — what they gave up to gain what.

After all 6 land, the manager (Claude) picks the strongest 2–3 ideas and presents to Jerry for the final pick.

## Reference

- Existing button mixins for context: `scss/components/_buttons.scss` (`btn-base`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-icon`).
- Token system: `scss/_mixins.scss` (`m.color`, `m.space`, `m.radius`), `scripts/theme-contract.json`.
- Live theme: `public/theme.css` (Sketchbook + 5 others as `[data-theme="…"]` blocks).
