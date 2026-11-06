// Real amazon.com item page through the real service worker and backend. Live data drifts by region
// and sign-in state, so this asserts the mechanism and records the verdict rather than asserting it.
const ASIN = process.env.SD_ASIN ?? "B07L6MLC6J";

export default async (h) => {
  const { page, expect } = h;

  await h.step(`open amazon.com item ${ASIN}`, () => page.goto(`https://www.amazon.com/dp/${ASIN}/`, { waitUntil: "domcontentloaded", timeout: 60_000 }));
  await h.step("the toolbar finishes with the product ID", () =>
    expect(page.locator(`[data-sd-item="${ASIN}"]`)).toBeVisible({ timeout: 60_000 })
  );
  await h.shot("01-toolbar-minimal");
  await h.step("clicking the shield expands the panel", async () => {
    await page.locator(".safe-deal-container").click();
    await expect(page.locator(".sd-product-full__header__title")).toBeVisible({ timeout: 15_000 });
  });
  h.observe("verdict", await page.locator(".sd-product-full__header__title").textContent());
  h.observe("pageTitle", await page.title());
  await h.shot("02-verdict-expanded");
  await h.saveHtml("02-verdict-expanded", page.getByTestId("floating-toolbar"));
  await h.step("the service worker called the pricing backend and read reviews from Amazon", () => {
    const urls = h.serviceWorkerRequests().map(({ url }) => url);
    expect(urls.some((url) => url.startsWith("https://api.joinsafedeal.com/price"))).toBe(true);
    expect(urls.some((url) => url.includes(`/product-reviews/${ASIN}`))).toBe(true);
  });
  h.observe("swRequests", h.serviceWorkerRequests().map(({ method, url, disposition }) => `${disposition} ${method} ${url.slice(0, 120)}`));
};
