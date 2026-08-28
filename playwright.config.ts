import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the css-is-awesome docs site.
 *
 * Strategy
 * --------
 * The docs site is a Next 15 static export (`output: "export"`), so we don't
 * need a Node server. We build once (`npm run build` populates `out/`) and
 * serve the static directory with `serve`. Port 4173 avoids clashing with
 * the dev-mode default (5173).
 *
 * Projects
 * --------
 * cia is a CSS library that leans on newish platform features (`light-dark()`,
 * `:has()`, `[popover]`, `<details name>`, `@container`, `mask`, `color-mix()`),
 * so cross-engine behaviour is the highest-value axis to test. The functional
 * specs (smoke / a11y / theme-editor) run on all three engines.
 *
 * `visual.spec.ts` stays chromium-only, deliberately:
 *   - 18 baselines x 3 engines = 54 PNGs to review on every styling PR, for
 *     almost no additional signal — a layout regression trips chromium too.
 *   - Font rasterisation and text metrics differ per engine, so firefox/webkit
 *     baselines would mostly encode rendering noise, not cia's CSS.
 *   - `Desktop Safari` ships deviceScaleFactor: 2, so webkit baselines would
 *     also be 2x the pixel size of the chromium set.
 * Cross-engine *rendering* differences that matter are caught by the functional
 * assertions (computed styles, ARIA state, resolved custom properties) instead.
 */
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // Stable viewport for visual snapshots.
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    // Full suite, including visual regression.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Functional specs only — see the `visual.spec.ts` note in the header.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /visual\.spec\.ts/,
    },
  ],

  // Boot the static site once for the whole suite. We assume `out/` was
  // produced by `npm run build` beforehand — CI runs `npm run build` as a
  // separate step, and the `webServer` block below fails fast if it's
  // missing.
  webServer: {
    command: `npx serve out -l ${PORT} --no-clipboard --no-port-switching`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },

  // Snapshots live alongside the tests so they're easy to review on PR.
  // {platform} is REQUIRED: font rasterisation differs between win32 and the
  // linux CI runner, so a single shared baseline set can only ever be green on
  // one of them. Without it, local runs and CI fight over the same PNGs.
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{arg}{-projectName}{-platform}{ext}",
});
