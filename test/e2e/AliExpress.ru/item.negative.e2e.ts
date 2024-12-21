import { echo, expect, test } from "../../playwright";
import { ALI_EXPRESS_RU, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";
import { clearCookiesAndLocalStorage } from "../utils/utils";

test.describe("AliExpress.ru", () => {
  ALI_EXPRESS_RU.forEach((current) => {
    test(`Negative on ${current}`, async ({ page, context }) => {
      test.slow();

      const productId = "1005004459905655";
      const url = `https://${current}/item/${productId}.html`;

      await page.goto(url);
      await clearCookiesAndLocalStorage({ page, context });
      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);
      await page.click("[class*=ShipToHeaderItem_GeoTooltip__mapGeoButton]");
      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const sdBox = page.locator(SAFE_DEAL_BOX);
      await sdBox.click();
      await expect(sdBox.locator("text=Unrecommended")).toBeVisible();
      await expect(sdBox.locator("text=Reviews deficiency or poor reviews")).toBeVisible();
      await expect(sdBox.locator("text=Many Customers are dissatisfied with the store")).toBeVisible();
      await expect(sdBox.locator("text=price")).toBeVisible();
    });
  });
});
