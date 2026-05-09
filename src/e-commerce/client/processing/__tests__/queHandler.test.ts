/**
 * Regression test: sendNextRequest must not create MutationObservers.
 *
 * Root cause: the old code called onDocumentInactivity(callback, 1100) for
 * AliExpress pages. onDocumentInactivity created a brand-new MutationObserver
 * on document on every call and never disconnected it. Since sendNextRequest
 * was called by a 200ms setInterval this caused unbounded observer accumulation.
 *
 * Fix: sendNextRequest uses setTimeout directly; MutationObserver is never
 * created during product processing.
 */

// Paths are relative to this test file:
// src/e-commerce/client/processing/__tests__/

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

// Return ALI_EXPRESS so STORE_DELAY_TIMES_MAP picks renderDelay=1100 —
// that is the path that called onDocumentInactivity with a non-zero delay,
// which is the path that leaked MutationObservers.
jest.mock("../../../engine/logic/utils/site-utils", () => ({
  SiteUtil: {
    getStore: jest.fn(() => "ali-express"),
    isItemDetails: jest.fn(() => false)
  }
}));

jest.mock("../../../../utils/site/site-information", () => ({
  SiteMetadata: {
    getDomOuterHTML: jest.fn(() => "<html></html>"),
    getDomain: jest.fn(() => "aliexpress.com"),
    getDomainURL: jest.fn(() => "https://aliexpress.com"),
    getPathName: jest.fn(() => "/item/123"),
    getQueryParams: jest.fn(() => ""),
    getURL: jest.fn(() => "https://aliexpress.com/item/123")
  }
}));

jest.mock("../../../../utils/dom/html", () => ({
  browserWindow: jest.fn(() => window)
}));

jest.mock("../../../engine/logic/site/display-site-factory", () => ({
  PreDisplaySiteFactory: { destroy: jest.fn() },
  DisplaySiteFactory: jest.fn().mockImplementation(() => ({ create: jest.fn() }))
}));

jest.mock("../../../../utils/dom/location", () => ({
  comparePaths: jest.fn(() => false)
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

// NOTE: onDocumentInactivity is NOT mocked — we let the real implementation
// run so the test catches observer creation.

describe("sendNextRequest — no MutationObserver leak", () => {
  let observerInstances: Array<{ observe: jest.Mock; disconnect: jest.Mock }>;
  let OriginalMutationObserver: typeof MutationObserver;

  beforeEach(() => {
    jest.useFakeTimers();
    observerInstances = [];
    OriginalMutationObserver = global.MutationObserver;
    global.MutationObserver = jest.fn().mockImplementation(() => {
      const instance = { observe: jest.fn(), disconnect: jest.fn() };
      observerInstances.push(instance);
      return instance;
    }) as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    global.MutationObserver = OriginalMutationObserver;
    jest.useRealTimers();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("does not create a MutationObserver on AliExpress (renderDelay=1100 path)", async () => {
    const { sendNextRequest } = await import("../queHandler");

    sendNextRequest();

    // After the fix: setTimeout is used — no observer created
    expect(observerInstances).toHaveLength(0);
  });

  it("does not accumulate MutationObservers across 10 repeated calls", async () => {
    const { sendNextRequest } = await import("../queHandler");

    for (let i = 0; i < 10; i++) {
      sendNextRequest();
    }

    expect(observerInstances).toHaveLength(0);
  });
});
