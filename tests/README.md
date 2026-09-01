# tests

Playwright end-to-end + visual regression specs for the docs site. Not shipped in the npm package (not listed in `package.json#files`). Config lives at `playwright.config.ts`; suite boots the Next 15 static export (`out/`) on port 4173 via `serve`.

## Specs

| File                          | Scope                                                                                                                                              | Engines |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `smoke.spec.ts`               | Smoke. Every built route (docs sidebar via `nav.config`, plus the component / recipe / blog / marketing routes) returns 200, renders an `<h1>`, emits no console errors. | all 3   |
| `a11y.spec.ts`                | A11y. axe-core (WCAG 2.0 A/AA + 2.1 AA) on five key routes; fails on any *new* serious/critical violation.                                          | all 3   |
| `theme-editor.smoke.spec.ts`  | The `/themes` live token editor actually functions: dock opens, tokens write overrides, family switcher swaps themes.                               | all 3   |
| `platform-features.spec.ts`   | Cross-engine platform contract: `light-dark()` in every shipped theme, plus `:has()`, `[popover]`, `<details name>`, `@container`, `mask-image`, `color-mix()`, anchor positioning. | all 3   |
| `visual.spec.ts`              | Visual regression. Full-page screenshots for the six locked themes x `/`, `/docs`, `/docs/tokens` (18 baselines).                                    | chromium |

## Engines

cia is a CSS library that leans on newish platform features, so the functional specs run on **chromium, firefox and webkit**.

`visual.spec.ts` is deliberately **chromium-only**:

- 18 baselines x 3 engines = 54 PNGs to review on every styling PR, for almost no extra signal — a layout regression trips chromium too.
- Font rasterisation and text metrics differ per engine, so firefox/webkit baselines would encode rendering noise rather than cia's CSS.
- Playwright's `Desktop Safari` device ships `deviceScaleFactor: 2`, so webkit baselines would also be 2x the pixel size of the chromium set.

Cross-engine *rendering* differences that actually matter are caught by `platform-features.spec.ts`, which asserts computed styles and resolved tokens rather than pixels.

### Why `platform-features.spec.ts` exists

The docs site renders `[popover]`, `<details name>` and friends only as **code samples** — there is no live instance of any of them in the rendered DOM. A green docs-site run across three engines therefore proves nothing about the features cia actually ships. That spec tests the real artifacts instead: cia's shipped `public/themes/<family>/theme.css` served over HTTP, and the platform features themselves using the markup cia's docs prescribe. It uses a synthetic same-origin fixture (via `page.route()`) so the docs site's own CSS cannot contribute to a result.

Note: custom properties are substitution-only — reading `--paper` back returns the literal `light-dark(...)` text in every engine. Resolution is only observable once the token is used by a real property, which is why the fixture probes it through `background-color`.

## Run

```bash
npm run build          # required first — Playwright serves out/
npm test               # all projects
npm test -- --project=firefox
```

First-time only: `npm run playwright:install`.

## Update snapshots

```bash
npm run test:update-snapshots   # playwright test --update-snapshots
```

Commit the regenerated PNGs under `tests/__screenshots__/visual.spec.ts/`.

## Gold images

`__screenshots__/` **is checked in**. Snapshots are the visual contract — review the PR diff before approving. Tolerance is `maxDiffPixelRatio: 0.01` to absorb sub-pixel font drift; layout changes still trip. The `snapshotPathTemplate` carries `{projectName}` and `{platform}`, so baselines never collide across engines or between a local win32 run and the linux CI runner.

## CI

`.github/workflows/ci.yml` runs `npm test` in the `playwright` job. HTML report uploaded as the `playwright-report` artifact. No local pre-push hook.
