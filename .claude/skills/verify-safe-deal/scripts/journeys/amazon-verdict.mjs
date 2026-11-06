// Item page, every external document served as a fixture: a well-reviewed product sold by Amazon must
// end in the Recommended verdict. This positive control proves the whole chain can say Recommended.
import { AMAZON, AMAZON_ITEM_URL, serveAmazonItem } from "../lib/fixtures.mjs";

export default async (h) => {
  const { page, expect } = h;
  serveAmazonItem(h);
  const box = page.locator(".safe-deal-container");

  await h.step("open the item page", () => page.goto(AMAZON_ITEM_URL));
  await h.step("the floating toolbar mounts with the product ID", async () => {
    await expect(page.getByTestId("floating-toolbar")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(`[data-sd-item="${AMAZON.asin}"]`)).toBeVisible({ timeout: 30_000 });
  });
  await h.shot("01-toolbar-minimal");
  await h.step("clicking the shield expands the verdict", async () => {
    await box.click();
    await expect(page.locator(".sd-product-full__header__title")).toHaveText(/Recommended/, { timeout: 15_000 });
  });
  await h.step("the expanded panel shows the evaluation tabs", async () => {
    for (const name of ["Product Evaluation", "Reviews Summary", "Opinions & Commentary"]) {
      await expect(page.getByRole("tab", { name })).toBeVisible();
    }
  });
  await h.shot("02-verdict-expanded");
  await h.saveHtml("02-verdict-expanded", page.getByTestId("floating-toolbar"));
  await h.step("the service worker fetched the reviews and seller documents", () => {
    const urls = h.serviceWorkerRequests().filter(({ disposition }) => disposition === "fixture").map(({ url }) => url);
    expect(urls.some((url) => url.includes("/product-reviews/"))).toBe(true);
    expect(urls.some((url) => url.includes("/sp?"))).toBe(true);
  });
  h.observe("verdict", await page.locator(".sd-product-full__header__title").textContent());
};
