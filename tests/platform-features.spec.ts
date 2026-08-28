import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-engine platform-feature contract.
 *
 * cia is a CSS library. Its public docs tell consumers to build on a specific
 * set of modern platform features — `light-dark()`, `:has()`, `[popover]` +
 * `:popover-open`, `<details name>`, `@container`, `mask-image`, `color-mix()`
 * and CSS anchor positioning. If any engine drops or lacks one of those, cia's
 * documentation is wrong and consumers ship broken UI.
 *
 * Nothing else in this suite covers that. `smoke` / `a11y` / `theme-editor`
 * exercise the docs site, and the docs site renders these features only as
 * *code samples* — there is no live `[popover]` or `<details name>` anywhere in
 * the rendered DOM. So a green docs-site run across three engines proves
 * nothing about the features cia actually ships.
 *
 * This spec closes that gap by testing the two things that matter:
 *
 *   1. cia's own shipped theme CSS (`public/themes/<family>/theme.css`, served
 *      from the static export) resolving `light-dark()` per engine. Every color
 *      token in every paired theme is a `light-dark()` call, so this is the
 *      single highest-blast-radius cross-engine dependency in the system.
 *   2. The platform features themselves, using the markup cia's docs prescribe.
 *
 * Fixture strategy
 * ----------------
 * Tests run against a synthetic same-origin page served via `page.route()`
 * rather than a docs route, so the docs site's own CSS cannot mask or
 * contribute to a result. Relative URLs still resolve against the real static
 * server, so the theme `<link>` fetches cia's genuinely shipped CSS.
 */

const FIXTURE_URL = "/__cia_platform_fixture__";

/** Families shipping `color-scheme: light dark` — every token is light-dark(). */
const PAIRED_THEMES = [
  "boilerplate",
  "sketchbook",
  "press",
  "graphite",
  "glass",
  "cupertino",
  "prism",
] as const;

/** terminal is intentionally single-scheme (dark only) and uses no light-dark(). */
const SINGLE_SCHEME_THEME = "terminal";

function themeFixture(family: string): string {
  return `<!doctype html><html><head>
<link rel="stylesheet" href="/themes/${family}/theme.css">
<style>
  /* Custom properties are substitution-only: reading --paper back gives the
     literal "light-dark(...)" text in every engine. Resolution is only
     observable once the token is used by a real property, so probe it here. */
  #paper { background-color: var(--paper); color: var(--ink); }
</style></head><body><div id="paper">probe</div></body></html>`;
}

const FEATURE_FIXTURE = `<!doctype html><html><head><style>
  /* :has() — cia's tabs component styles the container off its selected child */
  .panel { outline-style: none; }
  .panel:has(> [aria-selected="true"]) { outline: 3px solid rgb(1, 2, 3); }

  /* @container — cia's mixin API exposes container queries */
  #container { container-type: inline-size; width: 240px; }
  #contained { color: rgb(10, 20, 30); }
  @container (min-width: 200px) { #contained { color: rgb(40, 50, 60); } }

  /* color-mix() — used by cia's button + stepper components */
  #mix { background-color: color-mix(in srgb, #ff0000 50%, #0000ff); }

  /* mask-image — cia's icon system renders icons as masks so they inherit color */
  #masked {
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E");
  }

  /* [popover] — cia's tooltip / dropdown / overlay mixins style :popover-open.
     Deliberately does NOT override the UA's "margin: auto": with "inset: 0"
     that centres the popover, keeping the top-left corner free for the
     outside-click that exercises light dismiss below. */
  #pop { border: 0; padding: 8px; }
  #pop:popover-open { background-color: rgb(7, 7, 7); }
</style></head><body>
  <div class="panel"><button aria-selected="true">tab</button></div>
  <div class="panel" id="panel-unselected"><button aria-selected="false">tab</button></div>
  <div id="container"><span id="contained">contained</span></div>
  <div id="mix">mix</div>
  <div id="masked">masked</div>
  <button id="popbtn" popovertarget="pop" type="button">open</button>
  <div id="pop" popover="auto">popover body</div>
  <details name="cia-group" id="d1"><summary>one</summary><p>first</p></details>
  <details name="cia-group" id="d2"><summary>two</summary><p>second</p></details>
</body></html>`;

async function serveFixture(page: Page, html: string) {
  await page.route(`**${FIXTURE_URL}`, (route) =>
    route.fulfill({ contentType: "text/html", body: html }),
  );
  await page.goto(FIXTURE_URL, { waitUntil: "load" });
}

/** Resolved background/color of the probe div under an emulated color scheme. */
async function readProbe(page: Page, scheme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: scheme });
  return page.evaluate(() => {
    const el = document.getElementById("paper")!;
    const cs = getComputedStyle(el);
    return {
      paper: cs.backgroundColor,
      ink: cs.color,
      // Proves the theme stylesheet actually loaded, so a 404 can't masquerade
      // as a passing "both schemes agree" result.
      rawToken: getComputedStyle(document.documentElement)
        .getPropertyValue("--paper")
        .trim(),
    };
  });
}

/** rgb()/rgba()/color() strings that mean "nothing was painted". */
const EMPTY_PAINT = new Set(["", "rgba(0, 0, 0, 0)", "transparent"]);

test.describe("shipped themes: light-dark() resolution", () => {
  for (const family of PAIRED_THEMES) {
    test(`${family} resolves distinct light and dark colors`, async ({
      page,
    }) => {
      await serveFixture(page, themeFixture(family));
      await page.evaluate(
        (f) => document.documentElement.setAttribute("data-theme", f),
        family,
      );

      const light = await readProbe(page, "light");
      const dark = await readProbe(page, "dark");

      // The theme stylesheet loaded and defines --paper as a light-dark() call.
      expect(
        light.rawToken,
        `${family}/theme.css did not load or does not define --paper`,
      ).not.toBe("");
      expect(
        light.rawToken,
        `${family} --paper should be authored as light-dark()`,
      ).toContain("light-dark(");

      // Both schemes paint something real.
      expect(EMPTY_PAINT.has(light.paper), `${family} light --paper unpainted`).toBe(
        false,
      );
      expect(EMPTY_PAINT.has(dark.paper), `${family} dark --paper unpainted`).toBe(
        false,
      );

      // The whole point of light-dark(): the two schemes differ. If an engine
      // ignored light-dark() it would fall back to the same value for both,
      // and every paired cia theme would render mode-blind.
      expect(
        dark.paper,
        `${family}: light-dark() did not switch --paper between schemes`,
      ).not.toBe(light.paper);
      expect(
        dark.ink,
        `${family}: light-dark() did not switch --ink between schemes`,
      ).not.toBe(light.ink);
    });
  }

  test(`${SINGLE_SCHEME_THEME} is single-scheme and stays stable`, async ({
    page,
  }) => {
    await serveFixture(page, themeFixture(SINGLE_SCHEME_THEME));
    await page.evaluate(
      (f) => document.documentElement.setAttribute("data-theme", f),
      SINGLE_SCHEME_THEME,
    );

    const light = await readProbe(page, "light");
    const dark = await readProbe(page, "dark");

    expect(light.rawToken, "terminal/theme.css did not load").not.toBe("");
    expect(EMPTY_PAINT.has(light.paper), "terminal --paper unpainted").toBe(false);
    // terminal declares `color-scheme: dark` and uses no light-dark(), so it
    // must look identical regardless of the user's OS preference.
    expect(dark.paper, "terminal must not vary by color scheme").toBe(light.paper);
  });
});

test.describe("platform features cia's docs depend on", () => {
  test.beforeEach(async ({ page }) => {
    await serveFixture(page, FEATURE_FIXTURE);
  });

  test(":has() matches on a child's ARIA state", async ({ page }) => {
    // cia styles semantic state off ARIA attributes, and its tabs component
    // uses :has() to react to the selected child.
    const selected = page.locator(".panel").first();
    await expect(selected).toHaveCSS("outline-color", "rgb(1, 2, 3)");
    await expect(selected).toHaveCSS("outline-style", "solid");
    // Negative control: :has() must not match when the state is absent.
    await expect(page.locator("#panel-unselected")).toHaveCSS(
      "outline-style",
      "none",
    );
  });

  test("@container queries apply", async ({ page }) => {
    await expect(page.locator("#contained")).toHaveCSS("color", "rgb(40, 50, 60)");
  });

  test("color-mix() resolves", async ({ page }) => {
    // 50/50 red+blue in sRGB. Engines serialize this as either a legacy rgb()
    // or a color(srgb ...) tuple, so compare parsed channels, not the string.
    const channels = await page.evaluate(() => {
      const bg = getComputedStyle(document.getElementById("mix")!).backgroundColor;
      const nums = bg.match(/[\d.]+/g)?.map(Number) ?? [];
      return { bg, nums };
    });
    expect(channels.nums.length, `unparseable color-mix result: ${channels.bg}`)
      .toBeGreaterThanOrEqual(3);
    const [r, g, b] = channels.nums;
    // color(srgb ...) is 0-1, rgb() is 0-255 — normalize before asserting.
    const scale = r <= 1 && g <= 1 && b <= 1 ? 255 : 1;
    expect(r * scale, `red channel of ${channels.bg}`).toBeGreaterThan(100);
    expect(g * scale, `green channel of ${channels.bg}`).toBeLessThan(20);
    expect(b * scale, `blue channel of ${channels.bg}`).toBeGreaterThan(100);
  });

  test("mask-image applies (cia's icon system)", async ({ page }) => {
    const mask = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("masked")!);
      return cs.maskImage || cs.getPropertyValue("-webkit-mask-image");
    });
    expect(mask, "mask-image was dropped by this engine").not.toBe("none");
    expect(mask).toContain("data:image/svg+xml");
  });

  test("[popover] opens, matches :popover-open and takes its styles", async ({
    page,
  }) => {
    const pop = page.locator("#pop");
    await expect(pop).toBeHidden();

    // Open via the declarative popovertarget button — the API cia's docs show.
    await page.locator("#popbtn").click();
    await expect(pop).toBeVisible();

    // The :popover-open selector must actually style the element — cia's
    // tooltip / dropdown / overlay mixins hang their open state off it.
    await expect(pop).toHaveCSS("background-color", "rgb(7, 7, 7)");
    expect(
      await pop.evaluate((el) => el.matches(":popover-open")),
      ":popover-open selector did not match an open popover",
    ).toBe(true);

    // Light dismiss: popover="auto" closes on an outside click.
    await page.mouse.click(5, 5);
    await expect(pop).toBeHidden();
  });

  test("<details name> gives exclusive-accordion behaviour", async ({ page }) => {
    const d1 = page.locator("#d1");
    const d2 = page.locator("#d2");

    await d1.locator("summary").click();
    await expect(d1).toHaveAttribute("open", "");

    // Opening a sibling in the same group must close the first one. Without
    // this, cia's zero-JS accordion silently degrades to independent toggles.
    await d2.locator("summary").click();
    await expect(d2).toHaveAttribute("open", "");
    await expect(d1).not.toHaveAttribute("open", "");
  });

  test("CSS anchor positioning is supported", async ({ page }) => {
    // cia documents anchor() + position-area as the way to place dropdowns and
    // tooltips (scss/components/_overlay.scss, /docs/recipes/anchor-positioning).
    // This was Chromium-only for most of 2024-25; assert it so the docs' claim
    // stays honest per engine.
    const support = await page.evaluate(() => ({
      anchorName: CSS.supports("anchor-name: --x"),
      positionAnchor: CSS.supports("position-anchor: --x"),
      positionArea: CSS.supports("position-area: bottom"),
      anchorFn: CSS.supports("top: anchor(bottom)"),
    }));
    expect(support).toEqual({
      anchorName: true,
      positionAnchor: true,
      positionArea: true,
      anchorFn: true,
    });
  });
});
