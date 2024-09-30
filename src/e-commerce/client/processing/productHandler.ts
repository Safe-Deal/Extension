import { isEmpty } from "lodash";
import { ProductLocator } from "../../engine/logic/product/product-locator";
import { SiteUtil } from "../../engine/logic/utils/site-utils";
import { debug } from "../../../utils/analytics/logger";
import { PROCESSING_UPDATE_INTERVAL } from "../components/constants";
import { ClientQue } from "./que";
import { AmazonSiteUtils } from "../../engine/stores/amazon/utils/amazon-site-utils";

export interface AnalyzedItem {
  id: string;
  data: object;
}

export interface Progress {
  justStarted: boolean;
  totalFound: number;
  sentToAnalysis: number;
  receivedFromAnalysis: number;
  totalAnalyzed: number;
  totalLeft: number;
}

export const DEFAULT_PROGRESS: Progress = {
  justStarted: true,
  totalFound: 0,
  sentToAnalysis: 0,
  receivedFromAnalysis: 0,
  totalAnalyzed: 0,
  totalLeft: 0
};

export const processProducts = (site, siteURL: string, updateProgress: (progress: Progress) => void) => {
  if (AmazonSiteUtils.isAmazonVideoItemDetail()) {
    updateProgress({
      justStarted: false,
      totalFound: 1,
      sentToAnalysis: 1,
      receivedFromAnalysis: 1,
      totalAnalyzed: 1,
      totalLeft: 0
    });
    debug(`Amazon Prime Video. Skipping.`, "Client::processContent");
    return;
  }

  const productLocator = new ProductLocator(site);
  const products = productLocator.parseDomToGetProducts(SiteUtil.isEbayOrAmazonSite(siteURL)).reverse();
  const notProcessesProducts = products.filter((product) => product?.id && !ClientQue.isProductProcessed(product));

  debug(`Found New: ${notProcessesProducts.length} on page.`, "Client::processContent");

  if (isEmpty(notProcessesProducts)) {
    debug(`No New Products Found. Exiting.`, "Client::processContent");
    return;
  }

  notProcessesProducts.forEach((product) => {
    setTimeout(() => {
      ClientQue.addProductToQue(product);
    }, PROCESSING_UPDATE_INTERVAL / 10);
  });

  updateProgress({
    justStarted: false,
    totalFound: notProcessesProducts.length,
    sentToAnalysis: notProcessesProducts.length,
    receivedFromAnalysis: 0,
    totalAnalyzed: 0,
    totalLeft: notProcessesProducts.length
  });
};
