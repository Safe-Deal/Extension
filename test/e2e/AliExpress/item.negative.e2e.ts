import { echo, expect, test } from "../../playwright";
import { ALI_EXPRESS_WEBSITES, IS_CI, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";
import { clearCookiesAndLocalStorage } from "../utils/utils";

test.describe("AliExpress", () => {
  test.skip();

  if (IS_CI) {
    return;
  }

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(2 * 60 * 1000);
  });

  ALI_EXPRESS_WEBSITES.forEach((current) => {
    test(`Negative on ${current}`, async ({ page, context }) => {
      test.slow();

      await page.goto(
        "https://www.aliexpress.com/af/cover-for-tennis-.html?d=y&origin=n&SearchText=cover+for+tennis+&catId=0&initiative_id=SB_20201023135939"
      );
      await clearCookiesAndLocalStorage({ page, context });

      const productId = "3256805733023495";
      const url = `https://${current}/item/${productId}.html`;
      await page.goto(url);
      await clearCookiesAndLocalStorage({ page, context });
      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);
      const sdBox = page.locator(SAFE_DEAL_BOX);
      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);
      await sdBox.click();
      await expect(sdBox.locator("text=Unrecommended")).toBeVisible();
      //   await expect(sdBox.locator("text=Well-established seller, in business")).toBeVisible();
      //   await expect(sdBox.locator("text=The product is not recommended enough by customers")).toBeVisible();
      await expect(sdBox.locator("text=Many Customers are dissatisfied with the store")).toBeVisible();
      await expect(sdBox.locator("text=This product is reasonably priced")).toBeVisible();
    });
  });
});
