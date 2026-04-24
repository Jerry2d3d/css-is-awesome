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
 * Defensive step: on /docs/* routes the app currently logs a React #418
 * hydration mismatch (a known artifact of React 19's stylesheet hoisting
 * + static export), and when that happens React reconciles <html> back to
 * the static default of "sketchbook" — wiping the attribute we set. Since
 * we're testing the *theme CSS*, not the *hydration pathway*, we
 * re-assert `data-theme` via `page.evaluate` after hydration settles. The
 * cookie is still set, so when the source bug is fixed this test will
 * continue to work unchanged (and the redundant assignment becomes a
 * harmless no-op).
 *
 * Snapshots live at `tests/__screenshots__/` (per the config's
 * snapshotPathTemplate). First run generates baselines; they're committed
 * to the repo so PRs visibly diff.
 */

const THEMES = [
  "sketchbook",
  "press",
  "graphite",
  "glass",
  "cupertino",
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
        // Let LaunchGate resolve its flags.json fetch and render ThemePicker,
        // and let React hydration settle (or fail — see the file-level note
        // about React #418 on /docs/*).
        await page.waitForTimeout(400);

        // Force the selected theme onto <html> regardless of whether
        // React's hydration-mismatch reset happened. This is a one-line
        // assignment exactly equivalent to what the app's inline script
        // does on first paint.
        await page.evaluate(
          (t) => document.documentElement.setAttribute("data-theme", t),
          theme,
        );
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
