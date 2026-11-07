import { Remote } from "../../../../../../utils/downloaders/remote/remoteFetcher";
import eBayProductDownloader from "../ebay-product-downloader";

const ITEM_ID = "860104818206";
const PAGE_DOCUMENT = `<html><body><h1 class="x-item-title">Viewed item page</h1></body></html>`;
const REMOTE_DOCUMENT = `<html><body><h1 class="x-item-title">Downloaded item page</h1></body></html>`;

const titleOf = (doc) => doc?.querySelector(".x-item-title")?.textContent;

describe("eBayProductDownloader", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    Remote.clear();
    fetchMock = jest.fn().mockResolvedValue({ status: 200, text: () => Promise.resolve(REMOTE_DOCUMENT) });
    global.fetch = fetchMock;
  });

  it("uses the viewed item page document instead of downloading it", async () => {
    const downloader = new eBayProductDownloader({
      id: ITEM_ID,
      domain: "www.ebay.com",
      url: `https://www.ebay.com/itm/${ITEM_ID}?_skw=shoes&itmmeta=01M6TAPN2ZKXDSXE56WBY0NBQZ`,
      document: PAGE_DOCUMENT
    });

    const doc = await downloader.download();

    expect(titleOf(doc)).toBe("Viewed item page");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the item page fetched by the search page tab instead of downloading it", async () => {
    const downloader = new eBayProductDownloader({
      id: "398114108396",
      domain: "www.ebay.com",
      url: "https://www.ebay.com/sch/i.html?_nkw=soccer+ball",
      document: PAGE_DOCUMENT,
      itemPageDocument: `<html><body><h1 class="x-item-title">Tab fetched item page</h1></body></html>`
    });

    const doc = await downloader.download();

    expect(titleOf(doc)).toBe("Tab fetched item page");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("downloads items listed on a search page", async () => {
    const downloader = new eBayProductDownloader({
      id: "116281321847",
      domain: "www.ebay.com",
      url: "https://www.ebay.com/sch/i.html?_nkw=shoes",
      document: PAGE_DOCUMENT
    });

    const doc = await downloader.download();

    expect(titleOf(doc)).toBe("Downloaded item page");
    expect(fetchMock).toHaveBeenCalledWith("https://www.ebay.com/itm/116281321847", expect.anything());
  });
});
