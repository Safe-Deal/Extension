/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

async function withContext(fn) {
  const pathToExtension = path.join(__dirname, "..", "dist");
  const args = [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`];
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args
  });
  try {
    // Determine extension id
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");
    const extensionId = background.url().split("/")[2];
    return await fn({ context, extensionId });
  } finally {
    await context.close();
  }
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function screenshotPopup(context, extensionId, theme, outPath) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  // Open Settings
  await page.getByRole("button", { name: /Settings/i }).click({ trial: false }).catch(() => {});
  // Pick theme
  await page.getByLabel(new RegExp(theme, "i")).check().catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
}

async function screenshotPanel(context, theme, outPath) {
  const page = await context.newPage();
  // Abort external API calls to keep it offline-friendly
  await page.route(/^https?:\/\/api\.joinsafedeal\.com\/(get|start)/, (route) => route.abort());
  const aliUrl = "https://www.aliexpress.com/item/3256803371913623.html";
  try {
    await page.goto(aliUrl, { timeout: 15000 });
  } catch {
    // Fallback: intercept and serve a minimal document under the same URL
    await page.route("**/*", async (route) => {
      if (route.request().url().includes("/item/")) {
        await route.fulfill({
          status: 200,
          headers: { "content-type": "text/html" },
          body: `<!doctype html><html><head><meta charset="utf-8"><title>AliExpress Fixture</title></head>
            <body><h1>AliExpress Fixture</h1></body></html>`
        });
      } else {
        await route.continue();
      }
    });
    await page.goto(aliUrl);
  }
  // Wait for injected toolbar root to appear
  await page.waitForSelector("#safe-deal-toolbar-root", { timeout: 20000 }).catch(() => {});
  // Click to expand the panel if minimal bubble shows
  const minimal = page.locator(".floating-toolbar__minimal-wrapper");
  if (await minimal.count().then((c) => c > 0)) {
    await minimal.first().click().catch(() => {});
  }
  // Wait a bit for render
  await page.waitForTimeout(800);
  // Narrow screenshot to the panel container if present
  const panel = page.locator(".sd-product-full");
  if (await panel.count().then((c) => c > 0)) {
    await panel.first().screenshot({ path: outPath });
  } else {
    await page.screenshot({ path: outPath, fullPage: true });
  }
  await page.close();
}

async function main() {
  const outDir = "/opt/cursor/artifacts/screenshots";
  await ensureDir(outDir);
  await withContext(async ({ context, extensionId }) => {
    // Popup light and dark
    await screenshotPopup(context, extensionId, "Light", path.join(outDir, "popup-light.png"));
    await screenshotPopup(context, extensionId, "Dark", path.join(outDir, "popup-dark.png"));
    // Panel light (preference already set by popup-light step), then dark
    await screenshotPanel(context, "light", path.join(outDir, "panel-light.png"));
    // Switch to dark via popup again (ensures preference persisted)
    await screenshotPopup(context, extensionId, "Dark", path.join(outDir, "popup-dark.png"));
    await screenshotPanel(context, "dark", path.join(outDir, "panel-dark.png"));
  });
  // eslint-disable-next-line no-console
  console.log("Screenshots saved to /opt/cursor/artifacts/screenshots");
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

