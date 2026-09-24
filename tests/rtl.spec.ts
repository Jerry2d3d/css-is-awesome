import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getRecipeSlugs } from "../src/lib/recipes";

/**
 * RTL layout snapshots + accessibility scan (v1.2 EPIC-01 F1.4).
 *
 * Mirrors visual.spec.ts's screenshot pattern and a11y.spec.ts's AxeBuilder
 * + KNOWN_ISSUES pattern — see both files' headers for the reasoning behind
 * each. This file adds the third axis those two don't cover: direction.
 *
 * Direction is set with `page.evaluate` rather than a cookie (visual.spec.ts's
 * theme mechanism) because it isn't persisted app state — it's a plain HTML
 * attribute the app never reads at runtime, so setting it directly on
 * `<html>` after navigation is both simpler and closer to what a real
 * `dir="rtl"` consumer page does.
 */

const KEY_ROUTES = ["/", "/docs", "/themes", "/docs/rtl"] as const;
const RECIPE_ROUTES = getRecipeSlugs().map((slug) => `/docs/recipes/${slug}`);
const ALL_ROUTES = [...KEY_ROUTES, ...RECIPE_ROUTES];

async function setRtl(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
}

test.describe("RTL snapshots", () => {
  for (const route of ALL_ROUTES) {
    test(`snapshot ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");
      // Same settle window visual.spec.ts uses — LaunchGate's flags.json
      // fetch + ThemePicker render + hydration.
      await page.waitForTimeout(400);

      await setRtl(page);

      const safeRoute = route === "/" ? "root" : route.replace(/^\//, "").replace(/\//g, "-");
      await expect(page).toHaveScreenshot(`rtl-${safeRoute}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: "disabled",
      });
    });
  }
});

/**
 * Axe on a curated subset (mirrors a11y.spec.ts's own A11Y_ROUTES — a
 * representative slice, not every route) with dir="rtl" set first, so any
 * violation that only exists under RTL (a mirrored focus order, a flipped
 * icon that lost its label) is caught separately from the LTR baseline.
 */
const RTL_A11Y_ROUTES = ["/", "/docs", "/docs/rtl", "/docs/recipes/rtl-layout"] as const;
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

// Same policy as a11y.spec.ts: tracked, reviewed, tightened as fixed. Empty
// on purpose — the next regression gets a clean baseline to violate.
const KNOWN_ISSUES: Record<string, string[]> = {};

test.describe("RTL accessibility", () => {
  for (const route of RTL_A11Y_ROUTES) {
    test(`a11y (rtl): ${route} has no serious/critical violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");
      await page.waitForTimeout(250);
      await setRtl(page);

      const known = KNOWN_ISSUES[route] ?? [];
      const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]);
      if (known.length > 0) builder.disableRules(known);

      const results = await builder.analyze();
      const blocking = results.violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ""));

      if (blocking.length > 0) {
        const summary = blocking
          .map(
            (v) =>
              `  [${v.impact}] ${v.id}: ${v.help}\n    nodes: ${v.nodes
                .slice(0, 3)
                .map((n) => n.target.join(" "))
                .join(", ")}`,
          )
          .join("\n");
        throw new Error(
          `axe found ${blocking.length} serious/critical violation(s) on ${route} under dir="rtl" (new — not in KNOWN_ISSUES):\n${summary}`,
        );
      }

      expect(results).toBeTruthy();
    });
  }
});
