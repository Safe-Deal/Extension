import { IShutaf, ShutafType } from "../../../data/entities/shutaf.interface";
import { AliExpressSiteUtils } from "../../../e-commerce/engine/stores/ali-express/utils/ali-express-site-utils";
import { AmazonSiteUtils } from "../../../e-commerce/engine/stores/amazon/utils/amazon-site-utils";
import { EbaySiteUtils } from "../../../e-commerce/engine/stores/ebay/utils/ebay-site-utils";
import { WalmartSiteUtils } from "../../../e-commerce/engine/stores/walmart/utils/walmart-site-utils";
import { getShutafByUrl, isApiCallRequeued, isOnItemPage, getUrlFromShutafParams } from "../ShutafUtils";

const CALL_INTERNALS_CONST = "[PRODUCT]";

jest.mock("../../../e-commerce/engine/stores/ali-express/utils/ali-express-site-utils");
jest.mock("../../../e-commerce/engine/stores/amazon/utils/amazon-site-utils");
jest.mock("../../../e-commerce/engine/stores/ebay/utils/ebay-site-utils");
jest.mock("../../../e-commerce/engine/stores/walmart/utils/walmart-site-utils");

describe("Shutaf ShutafUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getShutafByUrl", () => {
    it("should return the correct shutaf when domain matches", () => {
      const url = new URL("https://example.com");
      const shutaff: IShutaf[] = [
        {
          name: "test",
          domain: "example.com",
          shutaf: ShutafType.API,
          target: ""
        }
      ];
      const result = getShutafByUrl(url, shutaff);
      expect(result).toEqual(shutaff[0]);
    });

    it("should return null when no shutaf matches the domain", () => {
      const url = new URL("https://notfound.com");
      const shutaff: IShutaf[] = [
        {
          name: "test",
          domain: "example.com",
          shutaf: ShutafType.API,
          target: ""
        }
      ];
      const result = getShutafByUrl(url, shutaff);
      expect(result).toBeNull();
    });

    it("should return null when shutaff array is null", () => {
      const url = new URL("https://example.com");
      const result = getShutafByUrl(url, null);
      expect(result).toBeNull();
    });
  });

  describe("isApiCallRequeued", () => {
    it("should return true if shutaf type is API", () => {
      const shutaf: IShutaf = {
        name: "test",
        domain: "example.com",
        shutaf: ShutafType.API,
        target: ""
      };
      const result = isApiCallRequeued(shutaf);
      expect(result).toBe(true);
    });
  });

  it("should check if the URL is on Amazon item page", () => {
    const url = new URL("https://amazon.com/item/12345");
    const shutaf: IShutaf = {
      name: "test",
      domain: "amazon.com",
      shutaf: ShutafType.API,
      target: CALL_INTERNALS_CONST
    };

    (AmazonSiteUtils.isAmazonSite as jest.Mock).mockClear().mockReturnValue(true);
    (AmazonSiteUtils.isAmazonItemDetails as jest.Mock).mockClear().mockReturnValue(true);

    const result = isOnItemPage(url, shutaf);
    expect(result).toBe(true);
    expect(AmazonSiteUtils.isAmazonSite).toHaveBeenCalledWith(url.href);
    expect(AmazonSiteUtils.isAmazonItemDetails).toHaveBeenCalledWith(url.href);
  });

  it("should check if the URL is on AliExpress item page", () => {
    const url = new URL("https://aliexpress.com/item/12345");
    const shutaf: IShutaf = {
      name: "test",
      domain: "aliexpress.com",
      shutaf: ShutafType.API,
      target: CALL_INTERNALS_CONST
    };

    (AliExpressSiteUtils.isAliExpressSite as jest.Mock).mockReturnValue(true);
    (AliExpressSiteUtils.isAliExpressItemDetails as jest.Mock).mockReturnValue(true);

    const result = isOnItemPage(url, shutaf);
    expect(result).toBe(true);
    expect(AliExpressSiteUtils.isAliExpressSite).toHaveBeenCalledWith(url.href);
    expect(AliExpressSiteUtils.isAliExpressItemDetails).toHaveBeenCalledWith(url.href);
  });

  it("should return false if URL does not match any site", () => {
    const url = new URL("https://unknown.com/item/12345");
    const shutaf: IShutaf = {
      name: "test",
      domain: "unknown.com",
      shutaf: ShutafType.API,
      target: CALL_INTERNALS_CONST
    };

    (AliExpressSiteUtils.isAliExpressSite as jest.Mock).mockReturnValue(false);
    (AmazonSiteUtils.isAmazonSite as jest.Mock).mockReturnValue(false);
    (EbaySiteUtils.isEbaySite as jest.Mock).mockReturnValue(false);
    (WalmartSiteUtils.isWalmartSite as jest.Mock).mockReturnValue(false);

    const result = isOnItemPage(url, shutaf);
    expect(result).toBe(false);
  });

  it("should check if URL matches custom regex target", () => {
    const url = new URL("https://example.com/item/12345?query=abc#hash");
    const shutaf: IShutaf = {
      name: "test",
      domain: "example.com",
      shutaf: ShutafType.API,
      target: "regexp:.*item.*"
    };
    const result = isOnItemPage(url, shutaf);
    expect(result).toBe(true);
  });

  it("should check if URL contains custom target", () => {
    const url = new URL("https://example.com/item/12345?query=abc#hash");
    const shutaf: IShutaf = {
      name: "test",
      domain: "example.com",
      shutaf: ShutafType.API,
      target: "item"
    };
    const result = isOnItemPage(url, shutaf);
    expect(result).toBe(true);
  });
});

describe("getUrlFromShutafParams", () => {
  const targetUrls = [
    "https://www.alibaba.com/product-detail/40oz-Adventure-Quencher-Insulated-Vacuum-Travel_1600918776668.html?xp=OD5XmT7d65z5MzF0MvMRWc5QGreuMcpO-b2j7exRYi6gzI8YgYew_6cuIAHPrvNXFlkh7Xrjxptl4hiocD3RxEYU3MQTOwvMyJ3BgdZfsgk&cps_sk=tg1u2unl&bm=cps&src=saf&productId=1600918776668",
    "https://www.alibaba.com/product-detail/High-Quality-500ml-Stainless-Steel-Vacuum_1600838658024.html?spm=a2700.galleryofferlist.p_offer.d_image.607f2e467nKLQL&s=p",
    "https://www.alibaba.com/product-detail/700ml-Big-Capacity-Astronaut-Children-s_1600825847066.html?spm=a2700.wholesale.popular_products.3.49c327d7ma0ytq",
    "https://www.alibaba.com/incorrect-url/High-Quality-500ml-Stainless-Steel-Vacuum_1600838658024.html",
    "https://www.alibaba.com/product-detail/InvalidProduct_abcdef.html",
    "https://www.alibaba.com/product-detail/Product-without-ID.html",
    "https://www.alibaba.com/product-detail/AnotherProduct_123456.html"
  ];

  const shutafUrl = "https://www.example.com/shutaf?";
  const regexPattern = "regexp:(?<=\\/product-detail\\/[a-zA-Z0-9\\-]+_)\\d+(?=\\.html)";
  const paramName = "productId";

  it("should extract product ID using regex pattern and update shutaf URL with targetParamName", () => {
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam=1600918776668"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[1], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam=1600838658024"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[2], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam=1600825847066"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[3], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[4], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[5], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[6], regexPattern, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam=123456"
    );
  });

  it("should extract product ID using parameter name and update shutaf URL with targetParamName", () => {
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam=1600918776668"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[1], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[2], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[3], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[4], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[5], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[6], paramName, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
  });

  it("should return original shutaf URL appended with param if targetParamName is not provided", () => {
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], regexPattern)).toBe(
      "https://www.example.com/shutaf?1600918776668"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[1], regexPattern)).toBe(
      "https://www.example.com/shutaf?1600838658024"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[2], regexPattern)).toBe(
      "https://www.example.com/shutaf?1600825847066"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[3], regexPattern)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[4], regexPattern)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[5], regexPattern)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[6], regexPattern)).toBe(
      "https://www.example.com/shutaf?123456"
    );
  });

  it("should return original shutaf URL appended with param if targetParamName is not provided and patternOrParam is a parameter name", () => {
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], paramName)).toBe(
      "https://www.example.com/shutaf?1600918776668"
    );
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[1], paramName)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[2], paramName)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[3], paramName)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[4], paramName)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[5], paramName)).toBe("https://www.example.com/shutaf?");
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[6], paramName)).toBe("https://www.example.com/shutaf?");
  });

  it("should handle non-matching regex pattern", () => {
    const nonMatchingRegex = "regexp:(?<=\\/non-existent-pattern\\/[a-zA-Z0-9\\-]+_)\\d+(?=\\.html)";
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], nonMatchingRegex, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
  });

  it("should handle empty string as patternOrParam", () => {
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], "", "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
  });

  it("should handle non-existent parameter", () => {
    const nonExistingParam = "nonExistingParam";
    expect(getUrlFromShutafParams(shutafUrl, targetUrls[0], nonExistingParam, "newParam")).toBe(
      "https://www.example.com/shutaf?newParam="
    );
  });
});
