# figma-tokens

Design-token exports for design-tool sync. Ships in the npm package (whitelisted
under `files` in `package.json`), so consumers can read it at
`node_modules/css-is-awesome/figma-tokens/`.

This folder is the deliverable from **Phase 3** of the roadmap — *"Export Figma
Tokens JSON alongside SCSS (for design-tool sync)"*. The canonical token source
for code remains `scss/theme/` (see `CONTRACT.md`); this folder mirrors that
source in a format design tools can consume.

## Files

| File                     | What it owns                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `tokens.json`            | Full token set in [Tokens Studio for Figma](https://github.com/tokens-studio/figma-plugin) format (`{ value, type }` per token). Groups: `brand`, `color-light`, `color-dark`, `spacing`, `font-size`, `font-weight`, `line-height`, `border-radius`, `shadow`. |
| `primitives-brand.scss`  | Brand primitives + global primitives — space, font-size/weight/family, line-height, letter-spacing, border-radius, duration, easing, opacity, breakpoint, container, brand color ramp. |
| `semantic-light.scss`    | Semantic light-mode color tokens — backgrounds, surfaces, text, borders, action-primary/secondary, status (success/warning/error/info). |
| `semantic-dark.scss`     | Semantic dark-mode color tokens — same shape as `semantic-light.scss`, with dark-mode values. |

The `.scss` siblings exist for consumers who want to `@import` Figma-exported
tokens directly without going through `tokens.json`. They are not consumed by
the main `scss/` build — `scss/main.scss` pulls from `scss/theme/`.

## Direction of truth

**Hand-maintained.** Keep in sync with `scss/theme/` when tokens change.

The `.scss` files carry a header that reads *"DO NOT EDIT — run `npm run
tokens:convert`"*. That script no longer exists (no entry in `package.json`,
no source under `scripts/`) — the header is a stale artifact from an earlier
tooling iteration. Drift between this folder and `scss/theme/` is therefore
real and possible; treat both halves as hand-edited until the auto-generator
lands.

Roadmap item `roadmap/epics/06-ai-integration.md` **Feature 6.3 — JSON token
export** (P1, not yet done) tracks the work to auto-regenerate `tokens.json`
from the SCSS source maps on every build, with stale output failing CI. Once
that ships, this folder becomes generated and the README will be updated.

## Importing into Figma

1. Install [Tokens Studio for Figma](https://tokens.studio/).
2. In the plugin, **Tools → Import → JSON file** and select
   `node_modules/css-is-awesome/figma-tokens/tokens.json`.
3. Map `color-light` / `color-dark` to Tokens Studio *themes* so dark mode
   swaps cleanly inside Figma.

## When you change a token

Until Feature 6.3 lands, every token change is a two-step edit:

1. Update the SCSS source under `scss/theme/` (the canonical contract).
2. Mirror the same change in this folder — `tokens.json` plus the matching
   `.scss` file (primitives vs semantic light vs semantic dark).
3. Run `npm run validate-themes` to confirm the SCSS contract still holds.
   (The validator does not currently diff `figma-tokens/` against `scss/theme/`.)
