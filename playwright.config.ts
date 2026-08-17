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
 * Single project (chromium) to keep CI time + baseline-image count small.
 * Firefox / webkit can be added later once the chromium baseline is solid.
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
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
