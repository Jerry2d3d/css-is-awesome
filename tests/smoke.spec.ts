import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";
import { flatNav } from "../src/app/docs/nav.config";

/**
 * Component smoke tests.
 *
 * Not unit tests — these are browser-level "does the page render without
 * exploding" checks. Each route in the list must:
 *
 *   1. respond 200
 *   2. render a visible <h1>
 *   3. emit no `console.error` during load (warnings are fine)
 *
 * The docs routes are pulled from the app's own nav config so new docs pages
 * are covered automatically.
 */

// Top-level routes we always want smoke-tested. The `/docs` route is also in
// flatNav (as "Introduction") so we avoid double-counting below.
const TOP_LEVEL_ROUTES = ["/", "/examples", "/themes"] as const;

const DOCS_ROUTES = flatNav().map((item) => item.href);

/**
 * Routes that exist in the static export but are NOT in `flatNav` — the nav
 * config only describes the docs sidebar, so component pages, recipe pages,
 * blog posts and the marketing routes were previously never smoke-tested on
 * any engine.
 *
 * These matter disproportionately: `/docs/components/*` and `/docs/recipes/*`
 * are the pages documenting cia's `[popover]`, `<details name>`, `:has()` and
 * anchor-positioning stories. Keep this list in sync when adding a route
 * outside the docs sidebar.
 */
const UNLISTED_ROUTES = [
  "/about",
  "/compare",
  "/showcase",
  "/themes/gallery",
  "/docs/themes/pairing",
  "/docs/components/accordion",
  "/docs/components/copy-button",
  "/docs/components/dropdown",
  "/docs/components/modal",
  "/docs/components/tabs",
  "/docs/components/tooltip",
  "/docs/recipes/anchor-positioning",
  "/docs/recipes/combobox",
  "/docs/recipes/copy-button",
  "/docs/recipes/dialog",
  "/docs/recipes/print-to-pdf",
  "/docs/recipes/tabs-aria",
  "/blog",
  "/blog/a-barrel-that-emits-nothing",
  "/blog/an-mcp-server-for-a-css-library",
  "/blog/from-0-8-to-1-0",
  "/blog/print-to-pdf-with-zero-javascript",
  "/blog/recipes-not-components",
  "/blog/the-import-in-our-readme-did-not-work",
  "/blog/the-validator-that-wasnt-looking",
  "/blog/your-brand-comes-with-you",
] as const;

// Dedupe and preserve order (top-level first, then docs, then the rest).
const ROUTES = Array.from(
  new Set([...TOP_LEVEL_ROUTES, ...DOCS_ROUTES, ...UNLISTED_ROUTES]),
);

/**
 * Some third-party or framework errors are out of our control and would
 * make the smoke suite flaky. Keep this list *very* short and document each
 * entry — if it grows, something real is probably broken.
 */
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [];

function attachConsoleErrorWatcher(page: Page): { errors: string[] } {
  const errors: string[] = [];
  const isIgnored = (text: string) =>
    IGNORED_CONSOLE_PATTERNS.some((rx) => rx.test(text));

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (isIgnored(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => {
    const text = `[pageerror] ${err.message}`;
    if (isIgnored(text)) return;
    errors.push(text);
  });
  return { errors };
}

for (const route of ROUTES) {
  test(`smoke: ${route} renders`, async ({ page }) => {
    const { errors } = attachConsoleErrorWatcher(page);

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `bad status for ${route}`).toBe(200);

    // Every page in the docs site renders a single h1.
    await expect(page.locator("h1").first()).toBeVisible();

    // Let the LaunchGate's flags.json fetch settle before asserting.
    // networkidle would be nicer, but that can hang on keep-alive connections
    // in `serve` — a short post-load yield is plenty for our purposes.
    await page.waitForLoadState("load");
    await page.waitForTimeout(200);

    expect(
      errors,
      `console errors on ${route}:\n${errors.join("\n")}`,
    ).toHaveLength(0);
  });
}
