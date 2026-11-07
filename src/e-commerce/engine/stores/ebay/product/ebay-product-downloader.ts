import { IProduct } from "../../../../../data/entities/product.interface";
import { ParsedHtml, parseAsHtml } from "../../../../../utils/dom/html";
import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher";
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader";
import { getWholesaleEbayProductIdFromHref, isEbayItemDetails } from "../utils/ebay-site-utils";

const MIN_DELAY_SECONDS = 0.005;
const MAX_DELAY_SECONDS = 0.9;

const buildUrl = (id, domain) => `https://${domain}/itm/${id}`;

const viewedItemPageDocuments = new WeakMap<IProduct, ParsedHtml>();

const isViewedItemPage = ({ id, url, document }: IProduct): boolean =>
  Boolean(document && url) && isEbayItemDetails(url) && getWholesaleEbayProductIdFromHref(url) === id;

const getViewedItemPageDocument = (product: IProduct): ParsedHtml => {
  if (!viewedItemPageDocuments.has(product)) {
    viewedItemPageDocuments.set(product, parseAsHtml(product.document));
  }
  return viewedItemPageDocuments.get(product);
};

export default class eBayProductDownloader extends BaseProductDownloader {
  private readonly product: IProduct;

  constructor(product: IProduct) {
    super({
      productUrl: buildUrl(product.id, product.domain),
      isFetchHtml: true,
      minDelay: MIN_DELAY_SECONDS,
      maxDelay: MAX_DELAY_SECONDS,
      useBrowserHeaders: HeadersType.NONE
    });
    this.product = product;
  }

  public async download() {
    if (isViewedItemPage(this.product)) {
      return getViewedItemPageDocument(this.product);
    }
    return super.download();
  }

  public parse(): unknown {
    const html = this.remoteResponse;
    this.document = html;

    return this.document;
  }
}
