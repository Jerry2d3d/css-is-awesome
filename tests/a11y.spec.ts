import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core accessibility scan.
 *
 * Runs axe on a representative slice of the docs site and fails the build
 * on any *new* violation with impact "serious" or "critical". Moderate /
 * minor issues are surfaced in the HTML report but do not gate CI — we want
 * this to catch regressions, not become a churn-factory.
 *
 * Ruleset: axe's default WCAG 2.0 A + AA + WCAG 2.1 AA tags, which aligns
 * with the docs' published accessibility claims.
 *
 * Known pre-existing violations (tracked outside this suite — do not expand
 * without filing an issue) are disabled via `.disableRules(...)` below.
 * When a source fix lands, remove the rule ID from KNOWN_ISSUES and the
 * guard rail tightens automatically.
 */

const A11Y_ROUTES = [
  "/",
  "/docs",
  "/docs/install",
  "/docs/tokens",
  "/docs/recipes",
] as const;

const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/**
 * Pre-existing axe rule IDs we currently accept, per-route. Tracked for
 * follow-up; the test continues to fail on any *other* serious/critical
 * rule, including any new occurrence of a rule not listed here.
 *
 * Policy: tighten these as issues are fixed. Do not add new entries without
 * a linked bug.
 *
 * The seven serious-impact violations that originally populated this list
 * (color-contrast on /, link-in-text-block on /docs|install|tokens,
 * scrollable-region-focusable on /docs, aria-prohibited-attr on tokens,
 * aria-hidden-focus on recipes) were fixed at source and removed on the
 * pre-launch a11y pass. The map is intentionally left as `{}` so the next
 * regression has a clear, empty baseline to violate.
 */
const KNOWN_ISSUES: Record<string, string[]> = {};

for (const route of A11Y_ROUTES) {
  test(`a11y: ${route} has no serious/critical violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    // Give LaunchGate a beat to finish its flags.json fetch and render the
    // theme picker so axe scans the real DOM users see.
    await page.waitForLoadState("load");
    await page.waitForTimeout(250);

    const known = KNOWN_ISSUES[route] ?? [];
    const builder = new AxeBuilder({ page }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21aa",
    ]);
    if (known.length > 0) builder.disableRules(known);

    const results = await builder.analyze();

    const blocking = results.violations.filter((v) =>
      BLOCKING_IMPACTS.has(v.impact ?? ""),
    );

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
        `axe found ${blocking.length} serious/critical violation(s) on ${route} (new — not in KNOWN_ISSUES):\n${summary}`,
      );
    }

    // Soft-assert that the scan ran — never blocks, just proves it exercised.
    expect(results).toBeTruthy();
  });
}
