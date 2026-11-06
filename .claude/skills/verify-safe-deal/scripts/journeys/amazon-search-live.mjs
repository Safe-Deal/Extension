// Real amazon.com search results: the extension paints a shield on listed products and adds the
// list-mode toolbar with the coupons badge.
export default async (h) => {
  const { page, expect } = h;

  await h.step("open an amazon.com search", () => page.goto("https://www.amazon.com/s?k=smartphone", { waitUntil: "domcontentloaded", timeout: 60_000 }));
  await h.step("the list toolbar mounts", () => expect(page.getByTestId("floating-toolbar")).toBeVisible({ timeout: 30_000 }));
  await h.step("more than one result gets a shield", () =>
    page.waitForFunction(() => document.querySelectorAll(".safe-deal-image-wholesale-product").length > 1, null, { timeout: 60_000 })
  );
  await h.step("wait for the shield count to settle", () =>
    expect.poll(async () => {
      const count = await page.locator(".safe-deal-image-wholesale-product").count();
      await h.sleep(5000);
      return count === (await page.locator(".safe-deal-image-wholesale-product").count());
    }, { timeout: 60_000 }).toBe(true)
  );
  h.observe("shieldedResults", await page.locator(".safe-deal-image-wholesale-product").count());
  await h.step("the first shield is visible to the shopper", async () => {
    const first = page.locator(".safe-deal-image-wholesale-product").first();
    await first.scrollIntoViewIfNeeded();
    await expect(first).toBeVisible();
  });
  await h.shot("01-search-results");
};
