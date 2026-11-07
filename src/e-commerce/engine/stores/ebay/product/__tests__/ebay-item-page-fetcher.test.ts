import { fetchEbayItemPageDocument } from "../ebay-item-page-fetcher";

const product = { id: "398114108396", domain: "www.ebay.com", url: "https://www.ebay.com/sch/i.html?_nkw=soccer+ball" };

describe("fetchEbayItemPageDocument", () => {
  it("returns the item page html fetched with the tab cookies", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("<html>item</html>") });
    global.fetch = fetchMock;

    await expect(fetchEbayItemPageDocument(product)).resolves.toBe("<html>item</html>");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.ebay.com/itm/398114108396",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("returns nothing when eBay rejects the request", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve("Error Page") });

    await expect(fetchEbayItemPageDocument(product)).resolves.toBeUndefined();
  });

  it("returns nothing when the request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchEbayItemPageDocument(product)).resolves.toBeUndefined();
  });
});
