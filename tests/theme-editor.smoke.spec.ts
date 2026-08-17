import { test, expect } from "@playwright/test";

/**
 * Smoke test for the /themes live token editor ("theme app").
 *
 * Not a visual test — this asserts the editor actually FUNCTIONS: it opens,
 * exposes token controls, writes a custom property onto the document, and the
 * family switcher swaps the active theme. Kept separate from visual.spec.ts so
 * it stays green regardless of snapshot state.
 */

const TRIGGER = { name: "Edit theme" };

test.describe("theme editor (/themes)", () => {
  test("page renders with the editor trigger present", async ({ page }) => {
    await page.goto("/themes");
    await expect(page.getByRole("heading", { name: "Theme editor", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", TRIGGER)).toBeVisible();
  });

  test("dock opens and exposes mode + category tablists", async ({ page }) => {
    await page.goto("/themes");
    const trigger = page.getByRole("button", TRIGGER);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await expect(page.getByRole("tablist", { name: "Mode" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Token category" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close theme editor" })).toBeVisible();
  });

  test("dock closes again", async ({ page }) => {
    await page.goto("/themes");
    await page.getByRole("button", TRIGGER).click();
    await page.getByRole("button", { name: "Close theme editor" }).click();
    await expect(page.getByRole("button", TRIGGER)).toHaveAttribute("aria-expanded", "false");
  });

  test("editing a token injects a live override rule", async ({ page }) => {
    await page.goto("/themes");
    await page.getByRole("button", TRIGGER).click();

    const colorInput = page.locator('input[type="color"]').first();
    await expect(colorInput).toBeVisible();

    // fill() goes through the native value setter, so React's value tracker
    // sees the change and fires onChange. Assigning el.value directly does not.
    await colorInput.fill("#ff0000");

    // The dock applies overrides via an injected <style id="cia-theme-overrides">
    // carrying [data-theme="<family>-<mode>"] rules — not inline styles.
    await expect
      .poll(() =>
        page.evaluate(
          () => document.getElementById("cia-theme-overrides")?.textContent ?? "",
        ),
      )
      .toMatch(/\[data-theme="[a-z-]+"\]\s*\{[\s\S]*--/);
  });

  test("family switcher swaps the active theme", async ({ page }) => {
    await page.goto("/themes");
    const select = page.getByRole("combobox", { name: "Choose theme family" });
    await expect(select).toBeEnabled();

    await select.selectOption("prism");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")))
      .toMatch(/^prism-(light|dark)$/);
  });

  test("every shipped family resolves to a styled theme", async ({ page }) => {
    await page.goto("/themes");
    const select = page.getByRole("combobox", { name: "Choose theme family" });
    await expect(select).toBeEnabled();

    for (const family of [
      "boilerplate",
      "sketchbook",
      "press",
      "graphite",
      "glass",
      "cupertino",
      "terminal",
      "prism",
    ]) {
      await select.selectOption(family);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")))
        .toContain(family);

      // A resolved theme paints --paper; an unmatched data-theme leaves it empty.
      const paper = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--paper").trim(),
      );
      expect(paper, `${family} should define --paper`).not.toBe("");
    }
  });

  // prism shipped but was missing from the gallery, the ThemePicker dock, the
  // LightDarkToggle alias map and the editor dock's alias map — four separate
  // hand-maintained lists that all had to be edited by hand. This asserts the
  // user-facing pickers actually offer every family.
  test("theme picker dock offers every shipped family", async ({ page }) => {
    await page.goto("/blog");
    for (const label of [
      "Boilerplate",
      "Sketchbook",
      "Press",
      "Graphite",
      "Glass",
      "Cupertino",
      "Prism",
      "Terminal",
    ]) {
      await expect(
        page.getByRole("button", { name: label, exact: true }),
        `ThemePicker should offer ${label}`,
      ).toHaveCount(1);
    }
  });

  test("gallery lists every shipped theme family", async ({ page }) => {
    await page.goto("/themes/gallery");
    for (const name of [
      "Boilerplate",
      "Sketchbook",
      "Press",
      "Graphite",
      "Glass",
      "Cupertino",
      "Terminal",
      "Prism",
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });
});
