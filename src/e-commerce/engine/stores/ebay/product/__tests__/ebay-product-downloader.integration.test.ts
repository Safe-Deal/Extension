import eBayProductDownloader from "../ebay-product-downloader";
import { shopOpenYearSelector } from "../../rules/shop-open-year/shop-open-year-rule-result";
import { getAllAvailableSelectors } from "../../../../../../utils/dom/html";
import { EBAY_PAGE_SELECTORS } from "../../ebay-site-selector";

describe("Remote Fetch eBay Integration test should correctly fetch", () => {
  const productId = "205049591451";
  const url = `https://www.ebay.com/itm/${productId}`;

  it(`should correctly fetch delivery info for product`, async () => {
    const downloader = new eBayProductDownloader({ id: productId, domain: "www.ebay.com", url });
    const result = await downloader.download();
    const deliveryInfoEl = getAllAvailableSelectors(EBAY_PAGE_SELECTORS, result, true);
    expect(deliveryInfoEl.length > 0).toBeTruthy();
    const deliveryInfoTxt = deliveryInfoEl.map((el: HTMLElement) => el?.textContent?.toLowerCase());
    expect(result).toBeDefined();
    expect(deliveryInfoTxt).toBeDefined();
    expect(deliveryInfoTxt.map((txt: string) => txt).length > 1).toBeTruthy();
  });

  it(`should correctly fetch shop open year for product`, async () => {
    const downloader = new eBayProductDownloader({ id: productId, domain: "www.ebay.com", url });
    const result = await downloader.download();
    const shopOpenYearEl = getAllAvailableSelectors(shopOpenYearSelector, result, true);
    expect(shopOpenYearEl.length > 0).toBeTruthy();
    const shopOpenYearText = shopOpenYearEl.map((el: HTMLElement) => el?.textContent?.toLowerCase());
    expect(result).toBeDefined();
    expect(shopOpenYearText).toBeDefined();
    expect(shopOpenYearText[0]).toContain("joined");
  });

  it(`should correctly fetch both delivery info and shop open year for product`, async () => {
    const downloader = new eBayProductDownloader({ id: productId, domain: "www.ebay.com", url });
    const result = await downloader.download();
    const deliveryInfoEl = getAllAvailableSelectors(EBAY_PAGE_SELECTORS, result, true);
    const shopOpenYearEl = getAllAvailableSelectors(shopOpenYearSelector, result, true);
    expect(deliveryInfoEl.length > 0).toBeTruthy();
    expect(shopOpenYearEl.length > 0).toBeTruthy();
    const deliveryInfoTxt = deliveryInfoEl.map((el: HTMLElement) => el?.textContent?.toLowerCase());
    const shopOpenYearText = shopOpenYearEl.map((el: HTMLElement) => el?.textContent?.toLowerCase());
    expect(result).toBeDefined();
    expect(deliveryInfoTxt[0]).toBeDefined();
    expect(shopOpenYearText[0]).toBeDefined();
  });
});
