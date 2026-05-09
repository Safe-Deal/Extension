/**
 * Tests that XMLSerializer (getDomOuterHTML) is NOT called for Amazon and eBay.
 *
 * Root cause: getDomOuterHTML calls XMLSerializer().serializeToString(document)
 * which serializes the entire page DOM (300KB-5MB on Amazon/eBay listing pages)
 * on every sendNextRequest call. Amazon and eBay rules don't use the serialized
 * DOM at all (they make fresh HTTP fetches). Only AliExpress needs the DOM as
 * a fallback. So we skip serialization for Amazon and eBay.
 */

jest.mock("@utils/pegasus/transport", () => ({
  definePegasusMessageBus: jest.fn(() => ({ sendMessage: jest.fn() })),
  definePegasusEventBus: jest.fn(() => ({ onBroadcastEvent: jest.fn() }))
}));

jest.mock("@e-commerce/worker/worker", () => ({
  EcommerceMessageTypes: {
    PROCESS_PRODUCT: "processProduct",
    EMIT_CONCLUSION_RESPONSE_EVENT: "ecommerce:conclusionResponse"
  },
  ECommerceProductType: { PRODUCT: "e_commerce_product", WHOLESALE: "e_commerce_wholesale" }
}));

jest.mock("../../../../utils/dom/html", () => ({
  browserWindow: jest.fn(() => globalThis)
}));

jest.mock("../../../../utils/dom/location", () => ({
  comparePaths: jest.fn(() => false)
}));

jest.mock("../../../engine/logic/site/display-site-factory", () => ({
  PreDisplaySiteFactory: { destroy: jest.fn() },
  DisplaySiteFactory: jest.fn().mockImplementation(() => ({ create: jest.fn() }))
}));

jest.mock("../que", () => ({
  ClientQue: {
    getNextProductFromQue: jest.fn(() => ({ id: "test-product-001", url: "https://amazon.com/dp/B001" })),
    progressingDone: jest.fn()
  }
}));

const mockGetDomOuterHTML = jest.fn(() => "<html><body>large page</body></html>");
jest.mock("../../../../utils/site/site-information", () => ({
  SiteMetadata: {
    getDomOuterHTML: mockGetDomOuterHTML,
    getDomain: jest.fn(() => "amazon.com"),
    getDomainURL: jest.fn(() => "https://amazon.com"),
    getPathName: jest.fn(() => "/dp/B001"),
    getQueryParams: jest.fn(() => ""),
    getURL: jest.fn(() => "https://amazon.com/dp/B001")
  }
}));

jest.mock("../../../engine/logic/conclusion/conclusion-product-entity.interface", () => ({
  ProductStore: {
    ALI_EXPRESS: "ali-express",
    ALI_EXPRESS_RUSSIA: "ali-express-russia",
    AMAZON: "amazon",
    EBAY: "ebay",
    NOT_SUPPORTED: "not-supported"
  }
}));

describe("sendNextRequest — DOM serialization skipped for Amazon + eBay", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("does NOT call getDomOuterHTML for Amazon (no DOM needed for rules)", async () => {
    jest.mock("../../../engine/logic/utils/site-utils", () => ({
      SiteUtil: {
        getStore: jest.fn(() => "amazon"),
        isItemDetails: jest.fn(() => true)
      }
    }));

    const { sendNextRequest } = await import("../queHandler");
    sendNextRequest();

    expect(mockGetDomOuterHTML).not.toHaveBeenCalled();
  });

  test("does NOT call getDomOuterHTML for eBay (no DOM needed for rules)", async () => {
    jest.mock("../../../engine/logic/utils/site-utils", () => ({
      SiteUtil: {
        getStore: jest.fn(() => "ebay"),
        isItemDetails: jest.fn(() => false)
      }
    }));

    const { sendNextRequest } = await import("../queHandler");
    sendNextRequest();

    expect(mockGetDomOuterHTML).not.toHaveBeenCalled();
  });

  test("DOES call getDomOuterHTML for AliExpress (DOM used as product extraction fallback)", async () => {
    jest.mock("../../../engine/logic/utils/site-utils", () => ({
      SiteUtil: {
        getStore: jest.fn(() => "ali-express"),
        isItemDetails: jest.fn(() => false)
      }
    }));

    const { sendNextRequest } = await import("../queHandler");
    jest.useFakeTimers();
    sendNextRequest(); // renderDelay=1100 so setTimeout fires after advance
    jest.advanceTimersByTime(1200);
    jest.useRealTimers();

    expect(mockGetDomOuterHTML).toHaveBeenCalled();
  });
});
