// Amazon hides reviews and seller behind sign-in, the state a logged-out shopper's service worker
// actually gets. With neither checked, the shopper must not be told "Recommended".
import { AMAZON_ITEM_URL, serveAmazonItem } from "../lib/fixtures.mjs";

export default async (h) => {
  const { page, expect } = h;
  serveAmazonItem(h, { signInWall: true });

  await h.step("open the item page", () => page.goto(AMAZON_ITEM_URL));
  await h.step("the toolbar reaches a finished state", () =>
    expect(page.locator(".safe-deal-container")).toBeVisible({ timeout: 30_000 })
  );
  await h.step("expand the verdict", async () => {
    await page.locator(".safe-deal-container").click();
    await expect(page.locator(".sd-product-full__header__title")).toBeVisible({ timeout: 15_000 });
  });
  const title = page.locator(".sd-product-full__header__title");
  h.observe("verdict", await title.textContent());
  await h.shot("01-verdict");
  await h.step("the verdict is not Recommended", () => expect(title).not.toHaveText(/Recommended/));
};
