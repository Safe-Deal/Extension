import { echo, expect, test } from "../../playwright";
import { ALI_EXPRESS_WEBSITES, IS_CI, SAFE_DEAL_WHOLESALE, markAsInitDone } from "../utils/constants";

test.describe("AliExpress", () => {
  test.skip(true, "no wholesale for aliexpress yet because  data obsification is too strong");

  if (IS_CI) {
    test.skip();
    return;
  }

  ALI_EXPRESS_WEBSITES.forEach((current) => {
    test(`Wholesale ${current}`, async ({ page }) => {
      test.slow();

      const url = `https://${current}`;

      await page.goto(url);
      await markAsInitDone(page);

      await page.mouse.wheel(0, 100);
      echo(url);
      let selector = '[name="SearchText"]';
      const search = await page.isVisible(selector);

      if (!search) {
        selector = "#search-words";
      }

      await page.waitForSelector(selector);
      const inputLocator = page.locator(selector);
      await inputLocator.pressSequentially("hello kitty backpack", { delay: 50 });
      await inputLocator.press("ArrowDown", { delay: 100 });
      await inputLocator.press("Enter");
      const elements = page.locator(SAFE_DEAL_WHOLESALE);
      await page.waitForFunction((selector) => document.querySelectorAll(selector).length > 1, SAFE_DEAL_WHOLESALE);
      const count = await elements.count();
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        await expect(element).toBeVisible();
      }
      expect(count).toBeGreaterThan(1);
    });
  });
});
