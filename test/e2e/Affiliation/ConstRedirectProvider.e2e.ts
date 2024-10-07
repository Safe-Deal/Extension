/* eslint-disable no-console */
import { test, expect } from "@playwright/test";

test.describe("Affiliates Redirect based on URL parameter", () => {
  test("should redirect to the target URL if url parameter is present", async ({ page }) => {
    const targetUrl = "https://www.google.com/";
    let redirectedUrl: string | null = null;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        redirectedUrl = frame.url();
      }
    });

    await page.goto(`https://const.joinsafedeal.com/ads/?url=${encodeURIComponent(targetUrl)}`);

    expect(redirectedUrl).toContain(targetUrl);
  });

  test("should redirect to the affiliation and wait for product URL", async ({ page }) => {
    const affUrl = "https://s.click.aliexpress.com/e/_oEztroc";
    const productUrl = "/item/33029781134.html";
    const usaProductUrl = "/item/2251832843466382.html";
    let redirectedUrl: string | null = null;

    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        redirectedUrl = frame.url();
      }
    });

    const targetUrl = `https://const.joinsafedeal.com/ads/?url=${encodeURIComponent(affUrl)}`;
    await page.goto(targetUrl);
    expect(redirectedUrl).toMatch(new RegExp(`(${productUrl}|${usaProductUrl})`));
  });

  test("should log error if url parameter is missing", async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on("console", (message) => consoleMessages.push(message.text()));

    await page.goto("https://const.joinsafedeal.com/ads/");
    await page.waitForURL("https://const.joinsafedeal.com/ads/");
    expect(consoleMessages).toContain("URL parameter is missing");
  });
});
