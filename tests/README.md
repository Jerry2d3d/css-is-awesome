# tests

Playwright end-to-end + visual regression specs for the docs site. Not shipped in the npm package (not listed in `package.json#files`). Config lives at `playwright.config.ts`; suite boots the Next 15 static export (`out/`) on port 4173 via `serve`.

## Specs

| File             | Scope                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `smoke.spec.ts`  | Smoke. Every top-level + docs route (pulled from `nav.config`) returns 200, renders an `<h1>`, emits no console errors. |
| `a11y.spec.ts`   | A11y. axe-core (WCAG 2.0 A/AA + 2.1 AA) on five key routes; fails on any *new* serious/critical violation.            |
| `visual.spec.ts` | Visual regression. Full-page screenshots for the six locked themes x `/`, `/docs`, `/docs/tokens` (18 baselines).      |

## Run

```bash
npm run build          # required first — Playwright serves out/
npm test               # playwright test
```

First-time only: `npm run playwright:install` (chromium + deps).

## Update snapshots

```bash
npm run test:update-snapshots   # playwright test --update-snapshots
```

Commit the regenerated PNGs under `tests/__screenshots__/visual.spec.ts/`.

## Gold images

`__screenshots__/` **is checked in**. Snapshots are the visual contract — review the PR diff before approving. Tolerance is `maxDiffPixelRatio: 0.01` to absorb sub-pixel font drift; layout changes still trip.

## CI

`.github/workflows/ci.yml` runs `npm test` in the `playwright` job (smoke + a11y + visual). HTML report uploaded as the `playwright-report` artifact. No local pre-push hook.
