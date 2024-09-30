import { logError } from "../../../../utils/analytics/logger";
import { ParsedHtml, parseAsHtml } from "../../../../utils/dom/html";
import { AMAZON_COUPONS_GLUE } from "../../../../utils/extension/glue";
import { AmazonSiteUtils } from "../../../engine/stores/amazon/utils/amazon-site-utils";
import { getAllAmazonCoupons } from "./coupons-analyzer/amazon/amazon-coupons-analyzer";

export const initAmazonCouponsWorker = (): void => {
  AMAZON_COUPONS_GLUE.worker(async (request, sendResponse) => {
    const { document, url, domainUrl } = request.data;
    if (!AmazonSiteUtils.isAmazonWholesale(url)) {
      sendResponse({ deals: [] });
    }

    const currentPageDom: ParsedHtml = parseAsHtml(document);
    try {
      const deals = await getAllAmazonCoupons({
        url,
        domainUrl,
        currentPageDom
      });
      sendResponse({ deals });
    } catch (error) {
      logError(error);
    }
  });
};
