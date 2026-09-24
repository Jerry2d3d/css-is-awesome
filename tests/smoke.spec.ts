import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import path from "node:path";
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
const TOP_LEVEL_ROUTES = ["/", "/examples", "/themes", "/playground"] as const;

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
  // Hand-built recipe pages (no `.md` behind them — see RECIPE_ROUTES for
  // the markdown-backed ones).
  "/docs/recipes/anchor-positioning",
  "/docs/recipes/copy-button",
  "/docs/recipes/tabs-aria",
  // Individual posts are derived from disk — see BLOG_ROUTES below.
  "/blog",
] as const;

/**
 * Every markdown-backed recipe page, derived from `scss/recipes/*.md` with the
 * same skip rule as src/lib/recipes.ts (no `_` prefix, no README). This list
 * used to be hand-maintained and had silently fallen behind — none of the
 * batch-2 recipes were ever smoke-tested. Now a new recipe is covered the
 * moment its `.md` lands.
 */
const RECIPE_ROUTES = readdirSync(path.join(process.cwd(), "scss", "recipes"))
  .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
  .map((f) => `/docs/recipes/${f.replace(/\.md$/, "")}`);

/**
 * Every blog post, derived from `src/content/blog/*.md` with the same skip
 * rule as src/lib/blog.ts (no `_` prefix, no README). Same lesson as the
 * recipes above: the hand-maintained list covered 8 of 18 posts, so the three
 * Track B discovery posts (EPIC-06) were never smoke-tested. A new post is
 * now covered the moment its `.md` lands.
 */
const BLOG_ROUTES = readdirSync(path.join(process.cwd(), "src", "content", "blog"))
  .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
  .map((f) => `/blog/${f.replace(/\.md$/, "")}`);

// Dedupe and preserve order (top-level first, then docs, then the rest).
const ROUTES = Array.from(
  new Set([...TOP_LEVEL_ROUTES, ...DOCS_ROUTES, ...UNLISTED_ROUTES, ...RECIPE_ROUTES, ...BLOG_ROUTES]),
);

/**
 * Some third-party or framework errors are out of our control and would
 * make the smoke suite flaky. Keep this list *very* short and document each
 * entry — if it grows, something real is probably broken.
 */
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [];

/**
 * The browser reports a failed resource as a console error whose text never
 * names the URL ("Failed to load resource: the server responded with a status
 * of 404"). Under `npx serve out` every page fires ~17 of those for Next's
 * RSC prefetch payloads (`__next.<route>.__PAGE__.txt?_rsc=…`) — files a
 * static export never emits, so the request 404s on any static host. That is
 * a Next static-export quirk, not a broken page, and it made the suite fail
 * locally at random depending on prefetch timing (documented 2026-09-09).
 *
 * So: drop the URL-less console line and judge 404s by URL instead — any
 * 404 response that is NOT an RSC prefetch payload is still an error, which
 * keeps a genuinely missing stylesheet, font or image failing the smoke.
 */
const RSC_PREFETCH_404 = /[?&]_rsc=|\/__next\.[^/]*__PAGE__\.txt/;
const RESOURCE_404_TEXT = /status of 404/;

function attachConsoleErrorWatcher(page: Page): { errors: string[] } {
  const errors: string[] = [];
  const isIgnored = (text: string) =>
    IGNORED_CONSOLE_PATTERNS.some((rx) => rx.test(text));

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (isIgnored(text)) return;
    if (RESOURCE_404_TEXT.test(text)) return; // judged by URL below instead
    errors.push(text);
  });
  page.on("response", (res) => {
    if (res.status() !== 404) return;
    const url = res.url();
    if (RSC_PREFETCH_404.test(url)) return;
    errors.push(`[404] ${url}`);
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
