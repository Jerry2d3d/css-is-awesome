# public/themes

Runtime theme files shipped with css-is-awesome. One file per theme, no
build step. Each `theme.css` declares the full **123-token contract**
(see `scripts/theme-contract.json`) under a `[data-theme="<name>"]`
selector. Consumers swap themes at runtime by setting that attribute on
`<html>`:

```html
<html data-theme="press-dark">
```

All shipped themes pass the WCAG 2.2 AA contrast audit (17 audited pairs
per theme) as of v0.7.

## Shipped themes

8 families × light + dark = 16 blocks. All pass WCAG 2.2 AA.

| Family       | Modes         | Mood                                                              |
| ------------ | ------------- | ----------------------------------------------------------------- |
| sketchbook   | light, dark   | Warm washi paper, sumi ink, indigo accent (default light)         |
| press        | light, dark   | Editorial newsprint, Playfair serif, press-red accent             |
| graphite     | light, dark   | Space-gray aluminum, system blue (default dark)                   |
| glass        | light, dark   | visionOS glassmorphism, iOS indigo, dual-rim highlights           |
| cupertino    | light, dark   | macOS Sonoma window, SF Pro, system blue                          |
| terminal     | light, dark   | VT100 phosphor, zero radii, CRT glow                              |
| prism        | light, dark   | Brand-system showcase, vivid accents                              |
| boilerplate  | light, dark   | Neutral starter (system fonts, slate ramp) — copy and override    |

## Layout

```
public/themes/
  <family>-<mode>/theme.css   ← one selector per file
  boilerplate/theme.css       ← both modes in one file (template pattern)
```

Most families ship as **one folder per mode** (e.g.
`sketchbook-dark/theme.css` declares only
`[data-theme="sketchbook-dark"]`). `boilerplate/` is the exception: it
holds both `[data-theme="boilerplate-light"]` and
`[data-theme="boilerplate-dark"]` blocks in a single file, and is the
recommended template for new dual-mode themes.

Note: `sketchbook-light` is the default and lives in `public/theme.css`
(repo root of the package), not under `public/themes/`.

## Consolidated bundle

`public/theme.css` is the **all-in-one** bundle: every shipped theme
block in a single file, assembled by
`scripts/bundle-companion-themes.mjs`. Consumers pick:

- `<link href="/theme.css">` — one request, every theme available
- `<link href="/themes/<name>/theme.css">` — only the theme you want

Both routes produce identical behavior at the `[data-theme]` selector.

## Validator gate

Every theme MUST:

1. Declare all 123 tokens in `scripts/theme-contract.json`.
2. Pass WCAG 2.2 AA on the 17 audited token pairs (`scripts/theme-a11y.js`).

CI runs `npm run validate-themes` and fails the PR on either gap.
`--border-default` is the one decorative pair (WCAG 2.2 SC 1.4.11) and is
reported as `info`, never `fail`.

Full authoring + PR flow lives in
[`CONTRIBUTING-THEMES.md`](../../CONTRIBUTING-THEMES.md).

## Deprecated aliases

For backwards compatibility, six unsuffixed names still resolve in v0.7.x
inside the bundle: `sketchbook → sketchbook-light`, `press → press-light`,
`graphite → graphite-dark`, `glass → glass-light`,
`cupertino → cupertino-light`, `terminal → terminal-dark`. These are
**removed in v0.8** — migrate to the `-light` / `-dark` suffixed names.
