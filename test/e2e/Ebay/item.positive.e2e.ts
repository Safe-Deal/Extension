import { echo, expect, test } from "../../playwright";
import { EBAY_WEBSITE, LOADER_ELEMENT, SAFE_DEAL_BOX, markAsInitDone } from "../utils/constants";

test.describe("Ebay", () => {
  EBAY_WEBSITE.forEach((current) => {
    test(`Positive on ${current}`, async ({ page }) => {
      await page.goto("https://www.ebay.com/sch/i.html?_nkw=tennis+racket");

      const productId = "274963569977";
      const url = `https://${current}/itm/${productId}`;

      await page.goto(url);
      await markAsInitDone(page);

      echo(url);
      await page.mouse.wheel(0, 100);
      await page.waitForSelector(SAFE_DEAL_BOX);

      const itemValue = await page.getAttribute("[data-sd-item]", "data-sd-item");
      await expect(itemValue).toBe(productId);

      const safeDealBoxLocator = page.locator(SAFE_DEAL_BOX);
      await safeDealBoxLocator.click();

      await expect(safeDealBoxLocator.locator("text=Recommended")).toBeVisible();
      await expect(safeDealBoxLocator.locator("text=The shop is highly rated")).toBeVisible();
      await expect(safeDealBoxLocator.locator("text=Excellent delivery time")).toBeVisible();
      await expect(safeDealBoxLocator.locator("text=Ship for free")).toBeVisible();
      await expect(safeDealBoxLocator.locator("text=Return policy is poor")).toBeVisible();

      await expect(page.locator(LOADER_ELEMENT)).not.toBeVisible();
    });
  });
});
