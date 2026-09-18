import { test, expect, type Page } from "@playwright/test";
import { gunzipSync } from "node:zlib";

/**
 * /playground — in-browser Sass compile, theme swap, share links, and the
 * "Try in playground" hand-off from recipe pages.
 *
 * chromium-only (excluded in the firefox/webkit projects like rtl.spec.ts):
 * the compiler is dart-sass's JS build running in a worker — engine
 * differences would only surface as timing noise, and CompressionStream /
 * DecompressionStream are supported everywhere the site targets.
 *
 * The preview iframe is sandboxed with no same-origin, so assertions read
 * its `srcdoc` attribute (the exact document the page injects) rather than
 * reaching into the frame.
 */

const SCSS_EDITOR = { role: "textbox" as const, name: "SCSS" };

async function waitForCompile(page: Page) {
  // The meta line shows "compiled in N ms" after the first successful compile.
  await expect(page.getByText(/compiled in \d+ ms/)).toBeVisible({ timeout: 30_000 });
}

async function userCss(page: Page): Promise<string> {
  const srcdoc = (await page.getByTestId("preview").getAttribute("srcdoc")) ?? "";
  const m = /<style data-role="user">([\s\S]*?)<\/style>/.exec(srcdoc);
  return m ? m[1] : "";
}

async function themeCss(page: Page): Promise<string> {
  const srcdoc = (await page.getByTestId("preview").getAttribute("srcdoc")) ?? "";
  const m = /<style data-role="theme">([\s\S]*?)<\/style>/.exec(srcdoc);
  return m ? m[1] : "";
}

async function setScss(page: Page, value: string) {
  const editor = page.getByRole(SCSS_EDITOR.role, { name: SCSS_EDITOR.name });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(value);
}

test("renders and compiles the starter", async ({ page }) => {
  await page.goto("/playground/");
  await expect(page.getByRole("heading", { level: 1, name: "Playground" })).toBeVisible();
  await expect(page.getByRole(SCSS_EDITOR.role, { name: SCSS_EDITOR.name })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "HTML" })).toBeVisible();
  await waitForCompile(page);
  const css = await userCss(page);
  expect(css.length).toBeGreaterThan(50);
  expect(css).toContain(".my-btn");
  // The default theme is injected too.
  expect(await themeCss(page)).toContain("--paper");
});

test("a compile error shows the pane and keeps the last good CSS", async ({ page }) => {
  await page.goto("/playground/");
  await waitForCompile(page);
  const before = await userCss(page);
  expect(before).toContain(".my-btn");

  await setScss(page, `@use 'css-is-awesome/api' as cia;\n.x { @include cia.not-a-mixin; }\n`);
  const pane = page.getByTestId("compile-error");
  await expect(pane).toBeVisible({ timeout: 15_000 });
  await expect(pane).toContainText(/Line 2/);
  await expect(pane).toContainText(/not-a-mixin|Undefined mixin/i);
  // Preview still shows the last good output.
  expect(await userCss(page)).toBe(before);

  // Click-to-jump moves the cursor into the editor.
  await pane.getByRole("button", { name: /Line 2/ }).click();
  await expect(page.getByRole(SCSS_EDITOR.role, { name: SCSS_EDITOR.name })).toBeFocused();

  // Fixing it clears the pane.
  await setScss(page, `@use 'css-is-awesome/api' as cia;\n.x { @include cia.btn(ghost); }\n`);
  await expect(pane).toBeHidden({ timeout: 15_000 });
  await expect.poll(() => userCss(page)).toContain(".x");
});

test("theme picker swaps the injected theme", async ({ page }) => {
  await page.goto("/playground/");
  await waitForCompile(page);
  const select = page.getByRole("combobox", { name: "Preview theme" });
  await expect(select).toHaveValue("sketchbook");
  const sketchbook = await themeCss(page);
  const urlBefore = page.url();
  await select.selectOption("terminal-dark");
  await expect.poll(() => themeCss(page)).not.toBe(sketchbook);
  await expect.poll(() => page.getByTestId("preview").getAttribute("srcdoc")).toContain('data-theme="terminal-dark"');
  // The hash follows the theme at once, and the choice is remembered per browser.
  await expect.poll(() => page.url()).not.toBe(urlBefore);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Preview theme" })).toHaveValue("terminal-dark", { timeout: 15_000 });
});

test("share link round-trips into a fresh page", async ({ page, context }) => {
  await page.goto("/playground/");
  await waitForCompile(page);
  const marker = `.shared-${Date.now()} { @include cia.btn(outline); }`;
  await setScss(page, `@use 'css-is-awesome/api' as cia;\n${marker}\n`);
  // Wait until the edit has gone through state -> worker -> preview before
  // copying, so the link carries the new SCSS and not the starter.
  await expect.poll(() => userCss(page), { timeout: 15_000 }).toContain(marker.split(" ")[0]);
  await page.getByRole("combobox", { name: "Preview theme" }).selectOption("press-light");
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  // Decode the payload Node-side (same gzip+base64url the build uses) and
  // wait until the URL carries exactly what we set — the hash write is
  // debounced, so poll rather than read once.
  const decode = () => {
    const payload = page.url().split("#code=")[1];
    if (!payload) return null;
    return JSON.parse(gunzipSync(Buffer.from(payload, "base64url")).toString("utf8")) as { s: string; t: string };
  };
  await expect.poll(() => decode()?.t).toBe("press-light");
  expect(decode()?.s).toContain(marker);
  const url = page.url();

  const fresh = await context.newPage();
  await fresh.goto(url);
  await expect(fresh.getByRole(SCSS_EDITOR.role, { name: SCSS_EDITOR.name })).toContainText(marker.split(" ")[0], {
    timeout: 15_000,
  });
  await expect(fresh.getByRole("combobox", { name: "Preview theme" })).toHaveValue("press-light");
  await waitForCompile(fresh);
  expect(await userCss(fresh)).toContain(marker.split(" ")[0]);
});

test("a corrupt share link falls back to the starter with a notice", async ({ page }) => {
  await page.goto("/playground/#code=not-a-real-payload");
  await expect(page.getByRole("status")).toContainText(/couldn't be read/i, { timeout: 15_000 });
  await waitForCompile(page);
  expect(await userCss(page)).toContain(".my-btn");
});

test("recipe pages hand off to the playground with their SCSS loaded", async ({ page }) => {
  await page.goto("/docs/recipes/breadcrumb/");
  const link = page.getByRole("link", { name: /Try in playground/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/playground\/#code=/);
  await expect(page.getByRole(SCSS_EDITOR.role, { name: SCSS_EDITOR.name })).toContainText("cia.breadcrumb", {
    timeout: 15_000,
  });
  await expect(page.getByRole("textbox", { name: "HTML" })).toContainText('aria-label="Breadcrumb"');
  await waitForCompile(page);
  expect(await userCss(page)).toContain("li + li::before");
});
