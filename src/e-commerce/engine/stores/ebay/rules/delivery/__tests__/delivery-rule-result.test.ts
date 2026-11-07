import { parseAsHtml } from "../../../../../../../utils/dom/html";
import eBayProductDownloader from "../../../product/ebay-product-downloader";
import { getRuleDeliveryResultValue } from "../delivery-rule-result";

const product = { id: "860104818206", domain: "www.ebay.com", url: "https://www.ebay.com/itm/860104818206" };

const evaluateDeliveryOn = (html: string) => {
  jest.spyOn(eBayProductDownloader.prototype, "download").mockResolvedValue(parseAsHtml(html));
  return getRuleDeliveryResultValue(product, null, 1, "eBay Delivery Item Details");
};

describe("eBay delivery rule", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 7, 12));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("uses the latest estimated delivery date", async () => {
    const result = await evaluateDeliveryOn(
      `<div class="d-shipping-minview"><div data-testid="ux-labels-values--deliverto-custom-help">Delivery: Estimated between Mon, Nov 16 and Mon, Nov 23</div></div>`
    );

    expect(result.isValidRule).toBe(true);
    expect(result.tooltipSummary.i18nData).toEqual({ daysToDeliver: 15 });
  });

  it("is invalid when the page has no delivery date", async () => {
    const result = await evaluateDeliveryOn(`<html><head><title>Error Page | eBay</title></head><body></body></html>`);

    expect(result.isValidRule).toBe(false);
    expect(result.tooltipSummary).toBeUndefined();
  });
});
