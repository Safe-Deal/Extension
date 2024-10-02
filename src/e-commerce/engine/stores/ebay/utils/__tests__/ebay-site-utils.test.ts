import { EbaySiteUtils } from "../ebay-site-utils";

describe("eBay Site Utils", () => {
  it("should return true if it ebay url", () => {
    const url = "https://www.ebay.com/";
    expect(EbaySiteUtils.isEbaySite(url)).toBeTruthy();
  });
  it("should return false if it NOT ebay url", () => {
    const url = "https://www.amazon.com/";
    expect(EbaySiteUtils.isEbaySite(url)).toBeFalsy();
  });

  it("should return true when url is ebay wholesale page", () => {
    const url = "https://www.ebay.com/sch/i.html?_from=R40&_nkw=shirt&_sacat=0&_dmd=2&rt=nc";
    expect(EbaySiteUtils.isEbayWholesaleGallery(url)).toBeTruthy();
  });

  it("should return false when url is NOT ebay wholesale page", () => {
    const url = "https://www.ebay.com/sch/i.html?_from=R40&_nkw=shirt&_sacat=0&rt=nc";
    expect(EbaySiteUtils.isEbayWholesaleGallery(url)).toBeFalsy();
  });
});

describe("isEbaySite", () => {
  it("should return true for eBay site URL", () => {
    const url = "https://www.ebay.com/";
    expect(EbaySiteUtils.isEbaySite(url)).toBeTruthy();
  });

  it("should return false for non-eBay site URL", () => {
    const url = "https://www.amazon.com/";
    expect(EbaySiteUtils.isEbaySite(url)).toBeFalsy();
  });

  it("should return true for eBay site URL with subdomain", () => {
    const url = "https://subdomain.ebay.com/";
    expect(EbaySiteUtils.isEbaySite(url)).toBeTruthy();
  });

  it("should return true for eBay site URL with path", () => {
    const url = "https://www.ebay.com/path/to/page";
    expect(EbaySiteUtils.isEbaySite(url)).toBeTruthy();
  });

  it("should return true for eBay site URL with query parameters", () => {
    const url = "https://www.ebay.com/?param1=value1&param2=value2";
    expect(EbaySiteUtils.isEbaySite(url)).toBeTruthy();
  });
});

describe("isEbayWholesaleProducts", () => {
  it("should return true for eBay wholesale products URL", () => {
    const url = "https://www.ebay.com/sch/i.html?_from=R40&_nkw=shirt&_sacat=0&_dmd=2&rt=nc";
    expect(EbaySiteUtils.isEbayWholesaleProducts(url)).toBeTruthy();
  });
  it("should return false for non-eBay wholesale products URL", () => {
    const url = "https://www.amazon.com/";
    expect(EbaySiteUtils.isEbayWholesaleProducts(url)).toBeFalsy();
  });
});

describe("isEbayWholesale", () => {
  it("should return true for eBay wholesale URL", () => {
    const url = "https://www.ebay.com/sch/i.html?_from=R40&_nkw=shirt&_sacat=0&_dmd=2&rt=nc";
    expect(EbaySiteUtils.isEbayWholesale(url)).toBeTruthy();
  });
  it("should return false for non-eBay wholesale URL", () => {
    const url = "https://www.amazon.com/";
    expect(EbaySiteUtils.isEbayWholesale(url)).toBeFalsy();
  });
});

describe("isEbayItemDetails", () => {
  it("should return true for eBay item details URL", () => {
    const url = "https://www.ebay.com/itm/1234567890";
    expect(EbaySiteUtils.isEbayItemDetails(url)).toBeTruthy();
  });
  it("should return false for non-eBay item details URL", () => {
    const url = "https://www.amazon.com/product/1234567890";
    expect(EbaySiteUtils.isEbayItemDetails(url)).toBeFalsy();
  });
});

describe("getWholesaleEbayProductIdFromHref", () => {
  it("should return an empty string if link is not provided", () => {
    const link = undefined;
    expect(EbaySiteUtils.getWholesaleEbayProductIdFromHref(link)).toBe("");
  });

  it("should return the product ID from the old eBay URL", () => {
    const link = "https://www.ebay.com/?iid=1234567890";
    expect(EbaySiteUtils.getWholesaleEbayProductIdFromHref(link)).toBe("1234567890");
  });

  it("should return the product ID from the new eBay URL", () => {
    const link =
      "https://www.ebay.com/itm/373760959244?_trkparms=amclksrc%3DITM%26aid%3D111001%26algo%3DREC.SEED%26ao%3D1%26asc%3D20180105095853%26meid%3D662c5e8a68e240eaaf5eec2f5bfbcbca%26pid%3D100903%26rk%3D2%26rkt%3D15%26sd%3D265410928257%26itm%3D373760959244%26pmt%3D1%26noa%3D1%26pg%3D2510209&_trksid=p2510209.c100903.m5276";
    expect(EbaySiteUtils.getWholesaleEbayProductIdFromHref(link)).toBe("373760959244");
  });

  it("should return the product ID from the new eBay URL with hash", () => {
    const link = "https://www.ebay.com/itm/1234567890#hash1234567890";
    expect(EbaySiteUtils.getWholesaleEbayProductIdFromHref(link)).toBe("1234567890");
  });

  it("should return the product ID from the new eBay URL with query parameters", () => {
    const link = "https://www.ebay.com/itm/1234567890?param1=value1&param2=value2";
    expect(EbaySiteUtils.getWholesaleEbayProductIdFromHref(link)).toBe("1234567890");
  });
});
