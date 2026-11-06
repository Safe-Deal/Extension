// Real eBay: pick a current listing from search, because item IDs expire, and check its item page.
export default async (h) => {
  const { page, expect } = h;

  await h.step("eBay serves the search page", async () => {
    const response = await page.goto("https://www.ebay.com/sch/i.html?_nkw=tennis+racket", { waitUntil: "domcontentloaded", timeout: 60_000 });
    expect(response.status(), "eBay refused this browser. See Gotchas in features/product-verdict.md").toBe(200);
  });
  const itemUrl = await h.step("find a listing", async () => {
    const hrefs = await page.locator('a[href*="/itm/"]').evaluateAll((links) => links.map((link) => link.href));
    const href = hrefs.find((candidate) => /\/itm\/[1-9]\d{8,}/.test(candidate));
    expect(href, `no listing link on ${page.url()}`).toBeTruthy();
    return href;
  });
  const itemId = itemUrl.match(/\/itm\/(\d+)/)[1];
  await h.step(`open listing ${itemId}`, () => page.goto(`https://www.ebay.com/itm/${itemId}`, { waitUntil: "domcontentloaded", timeout: 60_000 }));
  await h.step("the toolbar finishes with the item ID", () =>
    expect(page.locator(`[data-sd-item="${itemId}"]`)).toBeVisible({ timeout: 60_000 })
  );
  await h.step("clicking the shield expands the panel", async () => {
    await page.locator(".safe-deal-container").click();
    await expect(page.locator(".sd-product-full__header__title")).toBeVisible({ timeout: 15_000 });
  });
  h.observe("verdict", await page.locator(".sd-product-full__header__title").textContent());
  await h.shot("01-verdict-expanded");
};
