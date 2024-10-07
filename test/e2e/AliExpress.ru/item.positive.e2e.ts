import { echo, expect, test } from "../../playwright";
import { ALI_EXPRESS_RU, LOADER_ELEMENT, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";
import { clearCookiesAndLocalStorage } from "../utils/utils";

test.describe("AliExpress.ru", () => {
  ALI_EXPRESS_RU.forEach((current) => {
    test(`Positive on ${current}`, async ({ page, context }) => {
      test.slow();

      const productId = "32933550262";
      const url = `https://${current}/item/${productId}.html`;

      await page.goto(url);
      await clearCookiesAndLocalStorage({ page, context });

      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);
      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const sdBox = page.locator(SAFE_DEAL_BOX);
      await sdBox.click();

      await expect(sdBox.locator("text=Recommended")).toBeVisible();
      await expect(sdBox.locator("text=Reviews are extremely positive")).toBeVisible();
      await expect(sdBox.locator("text=The majority of the store's customers are satisfied")).toBeVisible();
      //   await expect(sdBox.locator("text=The price")).toBeVisible();

      await expect(page.locator(LOADER_ELEMENT)).not.toBeVisible();
    });
  });
});
