/**
 * Tests that processProduct skips SiteMetadata.getDom when the payload
 * has no `document` field (Amazon/eBay payloads after Slice 4).
 *
 * getDom calls node-html-parser to re-parse the serialised HTML string.
 * Skipping it when `document` is absent eliminates an unnecessary parse
 * on every Amazon / eBay product queue tick.
 */

// ─── Module-level mocks ───────────────────────────────────────────────────────

jest.mock("p-queue", () =>
  jest.fn().mockImplementation(() => ({
    pause: jest.fn(),
    start: jest.fn(),
    add: jest.fn((fn) => fn())
  }))
);

jest.mock("@utils/pegasus/transport", () => ({
  definePegasusMessageBus: jest.fn(),
  definePegasusEventBus: jest.fn()
}));

jest.mock("@store/EcommerceStore", () => ({
  initEcommerceStoreBackend: jest.fn()
}));

const mockGetDom = jest.fn(() => null);
jest.mock("../../../utils/site/site-information", () => ({
  SiteMetadata: { getDom: mockGetDom }
}));

jest.mock("../../../data/sites/site-factory", () => ({
  SiteFactory: jest.fn().mockImplementation(() => ({
    create: jest.fn(() => ({
      rules: [],
      siteDomSelector: null,
      pathName: "/itm/123",
      url: "https://www.ebay.com/itm/123"
    }))
  }))
}));

jest.mock("../../../data/rules/rule-manager", () => ({
  RuleManager: jest.fn().mockImplementation(() => ({}))
}));

jest.mock("../../../data/rules-conclusion/conclusion-manager", () => ({
  ConclusionManager: jest.fn().mockImplementation(() => ({
    conclusion: jest.fn().mockResolvedValue([])
  }))
}));

jest.mock("../../engine/logic/utils/site-utils", () => ({
  SiteUtil: { isItemDetails: jest.fn(() => false) }
}));

jest.mock("../../engine/logic/utils/convertors", () => ({
  convertSiteToSiteResponse: jest.fn(() => ({}))
}));

jest.mock("../../../utils/analytics/logger", () => ({
  debug: jest.fn(),
  logError: jest.fn()
}));

jest.mock("../../../utils/cashing/memoryCache", () => ({
  MemoryCache: jest.fn().mockImplementation(() => ({
    has: jest.fn(() => false),
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

jest.mock("../../../data/entities/product.interface", () => ({}));
jest.mock("../../../data/sites/site", () => ({}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL_DATA = {
  domain: "ebay.com",
  domainURL: "https://www.ebay.com",
  pathName: "/itm/123",
  queryParams: "",
  url: "https://www.ebay.com/itm/123"
};

const BASE_PRODUCT = { id: "prod-001", title: "Test Item" };

function buildPayload(extras: Record<string, unknown> = {}) {
  return {
    url: BASE_URL_DATA,
    product: BASE_PRODUCT,
    type: "e_commerce_product", // ECommerceProductType.PRODUCT
    ...extras
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("worker processProduct — conditional getDom", () => {
  let capturedOnMessage: ((req: { data: unknown }) => Promise<void>) | null = null;
  let capturedEmitBroadcastEvent: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    capturedEmitBroadcastEvent = jest.fn();

    const { definePegasusMessageBus, definePegasusEventBus } = require("@utils/pegasus/transport");
    const { initEcommerceStoreBackend } = require("@store/EcommerceStore");

    (initEcommerceStoreBackend as jest.Mock).mockResolvedValue({
      getState: jest.fn(() => ({
        setConclusionResponse: jest.fn(),
        setCurrentProduct: jest.fn()
      }))
    });

    (definePegasusMessageBus as jest.Mock).mockReturnValue({
      onMessage: (_, handler) => {
        capturedOnMessage = handler;
      }
    });

    (definePegasusEventBus as jest.Mock).mockReturnValue({
      emitBroadcastEvent: capturedEmitBroadcastEvent
    });

    const { initCommerce } = require("../worker");
    await initCommerce();
  });

  test("does NOT call getDom when document field is absent (Amazon/eBay payload)", async () => {
    await capturedOnMessage({ data: buildPayload() }); // no `document` key
    expect(mockGetDom).not.toHaveBeenCalled();
  });

  test("DOES call getDom when document field is present (AliExpress payload)", async () => {
    await capturedOnMessage({ data: buildPayload({ document: "<html><body>large page</body></html>" }) });
    expect(mockGetDom).toHaveBeenCalledTimes(1);
  });

  test("passes routingHint to SiteFactory when present", async () => {
    const { SiteFactory } = require("../../../data/sites/site-factory");
    const mockCreate = jest.fn(() => ({
      rules: [],
      siteDomSelector: null,
      pathName: "/sch/i.html",
      url: "https://www.ebay.com/sch/i.html"
    }));
    (SiteFactory as jest.Mock).mockImplementation(() => ({ create: mockCreate }));

    await capturedOnMessage({ data: buildPayload({ routingHint: "list" }) });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ routingHint: "list", dom: null })
    );
  });
});
