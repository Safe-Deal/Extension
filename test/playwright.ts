import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

import { IS_DEBUG } from "../src/utils/analytics/logger";
import { MAX_TIMEOUT_IN_MS } from "./playwright.config";

export const IS_HEADLESS = process.env.HEADLESS === undefined || process.env.HEADLESS === "true";

const pathToExtension = path.join(__dirname, "../dist");
const args = [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`];
if (IS_HEADLESS) {
  args.push(`--headless=new`);
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args,
      timeout: MAX_TIMEOUT_IN_MS
    });
    await context.route(/^https:\/\/api\.joinsafedeal\.com\/(get|start)/, (route) => route.abort());
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  }
});

export const { expect } = test;
export const echo = (message: string) => {
  if (IS_HEADLESS && !IS_DEBUG) {
    return;
  }
  console.log(message);
};
