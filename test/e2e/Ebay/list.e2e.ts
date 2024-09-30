import { echo, expect, test } from "../../playwright";
import { EBAY_WEBSITE, HUMAN_DELAY_E2E, SAFE_DEAL_WHOLESALE, markAsInitDone } from "../utils/constants";

test.describe("Ebay", () => {
  test.beforeEach(async ({}) => {
    await HUMAN_DELAY_E2E();
  });

  EBAY_WEBSITE.forEach((current) => {
    test(`Wholesale ${current}`, async ({ page }) => {
      test.slow();
      const url = `https://${current}/sch/i.html?_from=R40&_trksid=p2047675.m570.l1313&_nkw=smartphone&_sacat=0`;

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
