import { Page } from "@playwright/test";
import { DONE_PRODUCT_CONTAINER_CSS_CLASS, DONE_PRODUCT_CSS_CLASS } from "../../../src/constants/display";
import { IS_DEBUG } from "../../../src/utils/analytics/logger";

export const SAFE_DEAL_BOX = `.${DONE_PRODUCT_CONTAINER_CSS_CLASS}`;
export const SAFE_DEAL_WHOLESALE = `.safe-deal-image-wholesale-product`;
export const SAFE_DEAL_WORK_DONE = `.${DONE_PRODUCT_CSS_CLASS}`;
export const LOADER_ELEMENT = `#safe-deal-loader-element`;
export const ALI_EXPRESS_WEBSITES = [
  "aliexpress.com"
  // ,"he.aliexpress.com"
];
export const ALI_EXPRESS_RU = ["aliexpress.ru"];

export const AMAZON_WEBSITE = [
  "www.amazon.com"
  // ,"www.amazon.ca"
];
export const EBAY_WEBSITE = ["www.ebay.com"];

const MIN_DELAY_SECONDS = 3;
const MAX_DELAY_SECONDS = 10;

export const HUMAN_DELAY_E2E = async () => {
  if (IS_DEBUG) {
    return;
  }

  const maxDelay = MAX_DELAY_SECONDS * 1000;
  const minDelay = MIN_DELAY_SECONDS * 1000;
  const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
  await new Promise((resolve) => setTimeout(resolve, randomDelay));
};

export const isRussian = (current: string) => current.includes("aliexpress.ru");
async function setLocalStorage(page: Page, key: string, value: boolean): Promise<void> {
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key.toString(), JSON.stringify(value));
    },
    [key, value]
  );
}
export const markAsInitDone = async (page: Page) => {
  await setLocalStorage(page, "safe_deal_was_installed", true);
};

export const IS_CI = typeof process.env.CI !== "undefined" && process.env.CI;
