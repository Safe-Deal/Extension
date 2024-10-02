import { getAvailableSelector } from "../../../../../utils/dom/html";
import { replaceAll } from "../../../../../utils/text/strings";
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader";

const MIN_DELAY_SECONDS = 0.005;
const MAX_DELAY_SECONDS = 1.8;

export default class AmazonCategoryDownloader extends BaseProductDownloader {
  constructor(categoryId: string, storeDomain: string) {
    const url = `https://${storeDomain}/b/?node=${categoryId}`;
    super({
      productUrl: url,
      isFetchHtml: true,
      minDelay: MIN_DELAY_SECONDS,
      maxDelay: MAX_DELAY_SECONDS,
      urlProductTerminator: null
    });
  }

  public parse(): {} {
    const html = this.remoteResponse;
    this.document = html;

    return this.document;
  }

  public static async getCategoryName(categoryId: string, storeDomain: string): Promise<string> {
    const downloader = new AmazonCategoryDownloader(categoryId, storeDomain);
    const html = await downloader.download();
    const categoryName = getAvailableSelector(
      [
        ".apb-browse-two-col-center-margin-right span.a-size-base.a-color-state.a-text-bold",
        ".bxc-grid__text--dark h1",
        "#search span.a-color-state.a-text-bold",
        ".pageBanner",
        "#filter-n .a-size-small.a-color-base",
        "#departments .s-navigation-indent-1"
      ].join("|"),
      html
    )?.textContent;

    return replaceAll(categoryName, ["\"", "'", "'", "\n"], "").trim();
  }
}
