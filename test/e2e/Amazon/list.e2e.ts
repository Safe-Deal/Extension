import { echo, expect, test } from "../../playwright";
import { AMAZON_WEBSITE, HUMAN_DELAY_E2E, IS_CI, SAFE_DEAL_WHOLESALE, markAsInitDone } from "../utils/constants";

test.describe("Amazon", () => {
  if (IS_CI) {
    test.skip();
    return;
  }

  AMAZON_WEBSITE.forEach((current) => {
    test(`Wholesale ${current}`, async ({ page }) => {
      const url = `https://${current}/s?k=smartphone&ref=nb_sb_noss_2`;

      await page.goto(url);
      await markAsInitDone(page);

      echo(url);
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
