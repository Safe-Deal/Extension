import { echo, expect, test } from "../../playwright";
import { EBAY_WEBSITE, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";

test.describe("Ebay", () => {
  EBAY_WEBSITE.forEach((current) => {
    test(`Negative on ${current}`, async ({ page }) => {
      await page.goto("https://www.ebay.com/sch/i.html?_nkw=tennis+racket");

      const productId = "166565620716";
      const url = `https://${current}/itm/${productId}`;

      await page.goto(url);
      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);
      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const sdBox = page.locator(SAFE_DEAL_BOX);
      await sdBox.click();

      await expect(sdBox.locator("text=Unrecommended")).toBeVisible();
      await expect(sdBox.locator("text=The shop is poorly rated")).toBeVisible();
      await expect(sdBox.locator("text=Return policy is poor")).toBeVisible();
      await expect(sdBox.locator("text=It can take up to")).toBeVisible();
      await expect(sdBox.locator("text=Shipped for a fee or pickup required")).toBeVisible();
    });
  });
});
