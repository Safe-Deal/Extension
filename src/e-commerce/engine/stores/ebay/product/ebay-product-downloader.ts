import { IProduct } from "../../../../../data/entities/product.interface";
import { ParsedHtml, parseAsHtml } from "../../../../../utils/dom/html";
import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher";
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader";
import { getWholesaleEbayProductIdFromHref, isEbayItemDetails } from "../utils/ebay-site-utils";
import { buildEbayItemUrl } from "./ebay-item-page-fetcher";

const MIN_DELAY_SECONDS = 0.005;
const MAX_DELAY_SECONDS = 0.9;

const parsedItemPageDocuments = new WeakMap<IProduct, ParsedHtml>();

const isViewedItemPage = ({ id, url, document }: IProduct): boolean =>
  Boolean(document && url) && isEbayItemDetails(url) && getWholesaleEbayProductIdFromHref(url) === id;

const getProvidedItemPageHtml = (product: IProduct): string | undefined =>
  isViewedItemPage(product) ? product.document : product.itemPageDocument;

const getParsedItemPageDocument = (product: IProduct, html: string): ParsedHtml => {
  if (!parsedItemPageDocuments.has(product)) {
    parsedItemPageDocuments.set(product, parseAsHtml(html));
  }
  return parsedItemPageDocuments.get(product);
};

export default class eBayProductDownloader extends BaseProductDownloader {
  private readonly product: IProduct;

  constructor(product: IProduct) {
    super({
      productUrl: buildEbayItemUrl(product.id, product.domain),
      isFetchHtml: true,
      minDelay: MIN_DELAY_SECONDS,
      maxDelay: MAX_DELAY_SECONDS,
      useBrowserHeaders: HeadersType.NONE
    });
    this.product = product;
  }

  public async download() {
    const providedHtml = getProvidedItemPageHtml(this.product);
    if (providedHtml) {
      return getParsedItemPageDocument(this.product, providedHtml);
    }
    return super.download();
  }

  public parse(): unknown {
    const html = this.remoteResponse;
    this.document = html;

    return this.document;
  }
}
