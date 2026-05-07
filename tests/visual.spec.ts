import { test, expect } from "@playwright/test";

/**
 * Visual regression snapshots.
 *
 * For each of the six locked themes we screenshot a small, stable set of
 * pages: the home page, the docs index, and the tokens page (the one most
 * likely to expose typography / color regressions).
 *
 * Theme selection
 * ---------------
 * The docs site selects a theme at runtime via the `cia-theme` cookie + an
 * inline pre-hydration script that writes `data-theme` on <html> before
 * first paint. We set the cookie via `context.addCookies` so the script
 * picks it up on the initial SSR pass.
 *
 * Snapshots live at `tests/__screenshots__/` (per the config's
 * snapshotPathTemplate). First run generates baselines; they're committed
 * to the repo so PRs visibly diff.
 */

// Theme IDs use the v0.7 `-light`/`-dark` suffix convention. The old
// unsuffixed names continue to resolve via alias selectors in
// public/theme.css through 0.7.x; visual snapshots track the new names.
const THEMES = [
  "sketchbook-light",
  "press-light",
  "graphite-dark",
  "glass-light",
  "cupertino-light",
  "terminal",
] as const;

const VISUAL_ROUTES = ["/", "/docs", "/docs/tokens"] as const;

// `serve` binds to 127.0.0.1; use that as the cookie domain to match what
// the browser will use. "localhost" would work too but we want exact parity.
const COOKIE_DOMAIN = "localhost";

for (const theme of THEMES) {
  test.describe(`theme: ${theme}`, () => {
    test.beforeEach(async ({ context }) => {
      await context.addCookies([
        {
          name: "cia-theme",
          value: theme,
          domain: COOKIE_DOMAIN,
          path: "/",
        },
      ]);
    });

    for (const route of VISUAL_ROUTES) {
      test(`snapshot ${route}`, async ({ page, context }) => {
        // Sanity: prove the cookie is actually set at the browser level
        // for this route. Cheap compared to the screenshot below.
        const cookies = await context.cookies();
        const themeCookie = cookies.find((c) => c.name === "cia-theme");
        expect(themeCookie?.value, "cia-theme cookie must be set").toBe(
          theme,
        );

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");
        // Let LaunchGate resolve its flags.json fetch and render
        // ThemePicker, and let hydration settle.
        await page.waitForTimeout(400);

        // Sanity-check: the pre-paint script has applied the cookie's
        // theme to <html data-theme>. If this fails the screenshot below
        // would silently capture the wrong theme.
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          theme,
        );

        // Mask anything inherently non-deterministic here if it appears.
        const safeRoute = route === "/" ? "root" : route.replace(/^\//, "").replace(/\//g, "-");
        await expect(page).toHaveScreenshot(`${theme}-${safeRoute}.png`, {
          fullPage: true,
          // A small per-pixel tolerance keeps the suite sane against
          // sub-pixel font rendering and antialiasing drift. Large layout
          // changes will still trip the diff.
          maxDiffPixelRatio: 0.01,
          animations: "disabled",
        });
      });
    }
  });
}
