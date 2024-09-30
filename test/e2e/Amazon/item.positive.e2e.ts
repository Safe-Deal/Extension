import { echo, expect, test } from "../../playwright";
import { AMAZON_WEBSITE, IS_CI, LOADER_ELEMENT, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";
import { clearCookiesAndLocalStorage } from "../utils/utils";

test.describe("Amazon", () => {
  if (IS_CI) {
    test.skip();
    return;
  }

  AMAZON_WEBSITE.forEach((current) => {
    test(`Positive on ${current}`, async ({ page, context }) => {
      test.slow();
      await page.goto("https://www.amazon.com/s?k=tennis+racket");
      await clearCookiesAndLocalStorage({ page, context });

      const productId = "B07L6MLC6J";
      const url = `https://${current}/Apple/dp/${productId}/`;

      await page.goto(url);
      await markAsInitDone(page);

      echo(url);
      await page.waitForSelector(SAFE_DEAL_BOX);
      await page.mouse.wheel(0, 100);

      await page.locator(SAFE_DEAL_BOX).scrollIntoViewIfNeeded();
      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const sdBox = page.locator(SAFE_DEAL_BOX);
      await sdBox.click();

      await expect(sdBox.locator("text=Recommended")).toBeVisible();
      await expect(sdBox.locator("text=Amazon sells and ships this product")).toBeVisible();
      await expect(sdBox.locator("text=This product is selling really well")).toBeVisible();
      await expect(sdBox.locator("text=Reviews are extremely positive")).toBeVisible();
      await expect(sdBox.locator("xpath=//*[contains(text(), 'price')]")).toBeVisible();

      await expect(page.locator(`${LOADER_ELEMENT}`)).not.toBeVisible();
    });
  });
});
