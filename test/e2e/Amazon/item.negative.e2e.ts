import { echo, expect, test } from "../../playwright";
import { AMAZON_WEBSITE, IS_CI, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";
import { clearCookiesAndLocalStorage } from "../utils/utils";

test.describe("Amazon", () => {
  if (IS_CI) {
    test.skip();
    return;
  }

  AMAZON_WEBSITE.forEach((current) => {
    test(`Negative on ${current}`, async ({ page, context }) => {
      test.slow();

      await page.goto("https://www.amazon.com/s?k=tennis+racket");
      await clearCookiesAndLocalStorage({ page, context });

      const productId = "B0D2VTNQDP";
      const url = `https://${current}/dp/${productId}`;

      await page.goto(url);
      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);
      await page.locator(SAFE_DEAL_BOX).scrollIntoViewIfNeeded();

      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const sdBox = page.locator(SAFE_DEAL_BOX);
      await sdBox.click();

      await expect(sdBox.locator("text=Unrecommended")).toBeVisible();
      await expect(sdBox.locator("text=Reviews deficiency or poor reviews")).toBeVisible();
      await expect(sdBox.locator("text=Many Customers are dissatisfied with the store")).toBeVisible();
      //   await expect(sdBox.locator("text=This product is reasonably priced")).toBeVisible();
    });
  });
});
