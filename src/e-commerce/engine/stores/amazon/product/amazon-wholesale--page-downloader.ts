import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader";

const MIN_DELAY_SECONDS = 0.005;
const MAX_DELAY_SECONDS = 1.8;

export default class AmazonWholesalePageDownloader extends BaseProductDownloader {
  constructor(url: string) {
    // const url = `https://${storeDomain}/sp?seller=${storeName}`;
    super({
      productUrl: url,
      isFetchHtml: true,
      minDelay: MIN_DELAY_SECONDS,
      maxDelay: MAX_DELAY_SECONDS,
      urlProductTerminator: null
    });
  }

  public parse(): {} {
    const html: any = this.remoteResponse;
    if (html) {
      this.document = html;
      return this.document;
    }
    this.document = null;
    return null;
  }
}
