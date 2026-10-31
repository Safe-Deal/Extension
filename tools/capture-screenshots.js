/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

async function withContext(fn, { deviceScaleFactor } = {}) {
  const pathToExtension = path.join(__dirname, "..", "dist");
  const args = [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`];
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args,
    deviceScaleFactor: deviceScaleFactor || 1
  });
  try {
    // Determine extension id
    let sw = context.serviceWorkers().find((w) => w.url().includes("/scripts/service_worker.js"));
    if (!sw) {
      // wait for the right one
      sw = await context.waitForEvent("serviceworker", {
        predicate: (w) => w.url().includes("/scripts/service_worker.js"),
        timeout: 30000
      });
    }
    const extensionId = sw.url().split("/")[2];
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
  page.on("console", (msg) => console.log("popup:", msg.type(), msg.text()));
  const url = `chrome-extension://${extensionId}/popup.html`;
  console.log("Opening popup:", url);
  await page.goto(url);
  const html = await page.content();
  console.log("popup html length:", html?.length || 0);
  const scripts = await page.evaluate(() => Array.from(document.scripts).map((s) => s.src));
  console.log("popup scripts:", scripts);
  const popupInner = await page.evaluate(() => document.getElementById("popup")?.innerHTML || "");
  console.log("popup #popup inner length:", popupInner.length);
  // Wait for popup root render
  const root = page.locator(".safe-deal-popup");
  await root.waitFor({ state: "visible", timeout: 45000 });
  // Open Settings
  const settingsBtn = page.locator(".safe-deal-popup__navigation__link", { hasText: /Settings/i });
  await settingsBtn.first().click().catch(() => {});
  // Pick theme by id
  const input = page.locator(`input#sd-theme-${theme.toLowerCase()}`);
  await input.check().catch(() => {});
  // Wait for theme to apply on root
  await page.waitForFunction(
    (expected) => document.querySelector(".safe-deal-popup")?.getAttribute("data-theme") === expected,
    theme.toLowerCase(),
    { timeout: 5000 }
  );
  // Crop to popup container
  const box = await root.boundingBox();
  await page.screenshot({ path: outPath, clip: box });
  await page.close();
}

async function screenshotPanel(context, extensionId, theme, outPath) {
  // Context-level routes (cover background/service worker too)
  await context.route("https://api.joinsafedeal.com/product", (route) => route.fulfill({ status: 200, body: "{}" }));
  await context.route("https://api.joinsafedeal.com/price", async (route) => {
    const json = [
      {
        currency: "USD",
        price: [
          { minPrice: 12, maxPrice: 15, date: "2024-08-01T00:00:00.000Z" },
          { minPrice: 13, maxPrice: 16, date: "2024-09-01T00:00:00.000Z" },
          { minPrice: 14, maxPrice: 18, date: "2024-10-01T00:00:00.000Z" }
        ]
      }
    ];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(json)
    });
  });
  const aliUrl = "https://www.aliexpress.com/item/3256803371913623.html";
  const fixturePath = path.join(__dirname, "fixtures", "aliexpress-item.html");
  const fixtureHtml = fs.readFileSync(fixturePath, "utf8");
  await context.route(/https:\/\/www\.aliexpress\.com\/item\/\d+\.html.*/, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/html" },
      body: fixtureHtml
    });
  });
  await context.route(/https?:\/\/(www\.)?(google|gstatic|youtube|facebook|reddit)\./, (route) => route.abort());

  const page = await context.newPage();
  page.on("console", (msg) => console.log("panel:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("panel pageerror:", err.message));
  // Set color scheme by emulation (System default in app is 'system')
  await page.emulateMedia({ colorScheme: theme.toLowerCase() });
  // Force full panel for screenshots
  await page.addInitScript(() => {
    try {
      localStorage.setItem("sd_force_full", "1");
    } catch {}
  });
  // Mock all needed network
  // Provide a fixture product for the content script to render
  const fixtureProduct = {
    productConclusion: "RECOMMENDED",
    product: { id: "3256803371913623", domain: "www.aliexpress.com", url: aliUrl },
    rules: [
      {
        name: "Pricing Item Details",
        isValidRule: true,
        weight: 1,
        value: 1,
        tooltipSummary: {
          type: "SAFE",
          description: "Price trend looks stable",
          i18n: "price_trend_stable",
          ruleExplanation: "Recent prices are consistent",
          i18nExplanation: "price_trend_stable_expl"
        },
        dataset: {
          currency: "USD",
          price: [
            { date: "2024-08-01T00:00:00.000Z", price: 12.5 },
            { date: "2024-09-01T00:00:00.000Z", price: 14.0 },
            { date: "2024-10-01T00:00:00.000Z", price: 15.2 }
          ]
        }
      },
      {
        name: "Store positive feedback",
        isValidRule: true,
        weight: 1,
        value: 1,
        tooltipSummary: {
          type: "SAFE",
          description: "Store has high positive feedback",
          i18n: "store_positive",
          ruleExplanation: "Positive rate above threshold",
          i18nExplanation: "store_positive_expl"
        }
      }
    ]
  };
  await page.addInitScript((p) => {
    try {
      localStorage.setItem("sd_fixture_product", JSON.stringify(p));
    } catch {}
  }, fixtureProduct);
  // (Context-level routes above already intercept all network)
  // Go to fixture URL
  await page.goto(aliUrl, { waitUntil: "domcontentloaded" });
  // Wait for injected toolbar root to appear
  await page.waitForSelector("#safe-deal-toolbar-root", { timeout: 30000 });
  const hasToolbar = await page.locator(".floating-toolbar").count();
  console.log("floating-toolbar count:", hasToolbar);
  const rootInner = await page.evaluate(
    () => document.querySelector("#safe-deal-toolbar-root")?.outerHTML?.slice(0, 500) || ""
  );
  console.log("root snippet:", rootInner);
  const contentSnippet = await page.evaluate(
    () => document.querySelector(".floating-toolbar__content")?.outerHTML?.slice(0, 500) || ""
  );
  console.log("content snippet:", contentSnippet);
  // Emit synthetic conclusion event via Pegasus window bridge (repeat to ensure listener ready)
  await page.waitForTimeout(500);
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await page.evaluate(
      (payload) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => {
          if (e.data === "port-accepted") {
            const event = {
              messageType: "broadcastEvent",
              id: "ecommerce:conclusionResponse",
              data: payload,
              timestamp: Date.now(),
              hops: [],
              transactionId: String(Date.now())
            };
            channel.port1.postMessage(event);
          }
        };
        window.postMessage(
          { cmd: "webext-port-offer", context: "window", scope: "CONTENT_SCRIPT_ECOMMERCE" },
          "*",
          [channel.port2]
        );
      },
      {
        conclusionProductEntity: [
          {
            productConclusion: "RECOMMENDED",
            product: { id: "3256803371913623", domain: "www.aliexpress.com", url: aliUrl },
            rules: [
              {
                name: "Pricing Item Details",
                isValidRule: true,
                weight: 1,
                value: 1,
                tooltipSummary: {
                  type: "SAFE",
                  description: "Price trend looks stable",
                  i18n: "price_trend_stable",
                  ruleExplanation: "Recent prices are consistent",
                  i18nExplanation: "price_trend_stable_expl"
                },
                dataset: {
                  currency: "USD",
                  price: [
                    { date: "2024-08-01T00:00:00.000Z", price: 12.5 },
                    { date: "2024-09-01T00:00:00.000Z", price: 14.0 },
                    { date: "2024-10-01T00:00:00.000Z", price: 15.2 }
                  ]
                }
              },
              {
                name: "Store positive feedback",
                isValidRule: true,
                weight: 1,
                value: 1,
                tooltipSummary: {
                  type: "SAFE",
                  description: "Store has high positive feedback",
                  i18n: "store_positive",
                  ruleExplanation: "Positive rate above threshold",
                  i18nExplanation: "store_positive_expl"
                }
              }
            ]
          }
        ],
        site: {
          url: aliUrl,
          domain: "www.aliexpress.com",
          domainURL: "https://www.aliexpress.com",
          pathName: new URL(aliUrl).pathname,
          queryParams: "",
          siteDomSelector: { displayDomSelector: {} }
        },
        productId: "3256803371913623"
      }
    );
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(300);
  }
  // Try to toggle to maximal view via keyboard shortcut (Alt+D)
  await page.locator(".floating-toolbar").first().click({ trial: false }).catch(() => {});
  await page.keyboard.press("Alt+D").catch(() => {});
  await page.evaluate(() => {
    const e = new KeyboardEvent("keydown", { altKey: true, code: "KeyD", key: "d", bubbles: true, cancelable: true });
    window.dispatchEvent(e);
  });
  // Click to expand the panel if minimal bubble shows
  const minimal = page.locator(".floating-toolbar__minimal-wrapper");
  const minCount = await minimal.count();
  console.log("minimal wrapper count:", minCount);
  if (minCount > 0) {
    const boxMin = await minimal.first().boundingBox().catch(() => null);
    console.log("minimal bbox:", boxMin);
    await minimal.first().click({ force: true }).catch(() => {});
  }
  // Wait for render (allow generous time for worker + rules)
  await page.waitForSelector(".sd-product-full", { timeout: 60000 });
  await page.waitForSelector(".sd-price_chart__apexchart svg", { timeout: 60000 });
  const fullCount = await page.locator(".sd-product-full").count();
  console.log("sd-product-full count:", fullCount);
  // Narrow screenshot to the panel container root
  let box = null;
  try {
    const panelRoot = page.locator("#safe-deal-react-toolbar");
    box = await panelRoot.first().boundingBox({ timeout: 3000 });
  } catch {}
  if (!box) {
    // fallback to inner floating toolbar container
    box = await page.locator(".floating-toolbar").nth(1).boundingBox();
  }
  await page.screenshot({ path: outPath, clip: box });
  await page.close();
}

async function main() {
  const outArtifacts = "/opt/cursor/artifacts/screenshots";
  const outRepo = path.join(process.cwd(), "docs", "screenshots");
  await ensureDir(outArtifacts);
  await ensureDir(outRepo);
  await withContext(async ({ context, extensionId }) => {
    // Popup light and dark
    const popupLight = path.join(outArtifacts, "popup-light.png");
    const popupDark = path.join(outArtifacts, "popup-dark.png");
    await screenshotPopup(context, extensionId, "Light", popupLight);
    await screenshotPopup(context, extensionId, "Dark", popupDark);
    if (!process.env.ONLY_POPUP) {
      // Panel light and dark (use system emulation)
      const panelLight = path.join(outArtifacts, "panel-light.png");
      const panelDark = path.join(outArtifacts, "panel-dark.png");
      await screenshotPanel(context, extensionId, "light", panelLight);
      await screenshotPanel(context, extensionId, "dark", panelDark);
      await fs.promises.copyFile(panelLight, path.join(outRepo, "panel-light.png"));
      await fs.promises.copyFile(panelDark, path.join(outRepo, "panel-dark.png"));
    }
    // Copy into repo docs
    await fs.promises.copyFile(popupLight, path.join(outRepo, "popup-light.png"));
    await fs.promises.copyFile(popupDark, path.join(outRepo, "popup-dark.png"));
  });
  // Dark-mode 2x detail shots
  await withContext(async ({ context, extensionId }) => {
    // Popup dark detail with MUI menu open
    const page = await context.newPage();
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    const root = page.locator(".safe-deal-popup");
    await root.waitFor({ state: "visible", timeout: 20000 });
    // Ensure Dark selected via Settings
    const settingsBtn = page.locator(".safe-deal-popup__navigation__link", { hasText: /Settings/i });
    await settingsBtn.first().click().catch(() => {});
    const darkRadio = page.locator("#sd-theme-dark");
    await darkRadio.check().catch(() => {});
    await page.waitForFunction(() => document.querySelector(".safe-deal-popup")?.getAttribute("data-theme") === "dark");
    // Navigate back to Home
    const homeBtn = page.locator(".safe-deal-popup__navigation__link", { hasText: /Home/i });
    await homeBtn.first().click().catch(() => {});
    // Open user menu (avatar)
    const avatarBtn = page.locator('button[aria-haspopup="true"]').first();
    await avatarBtn.click().catch(() => {});
    const darkDetailPopup = path.join(outArtifacts, "dark-detail-popup.png");
    const box = await root.boundingBox();
    await page.screenshot({ path: darkDetailPopup, clip: box });
    await fs.promises.copyFile(darkDetailPopup, path.join(outRepo, "dark-detail-popup.png"));
    await page.close();
  }, { deviceScaleFactor: 2 });
  console.log("Screenshots saved to /opt/cursor/artifacts/screenshots and docs/screenshots");
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

