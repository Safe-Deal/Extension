import { logError, debug } from "../../../../utils/analytics/logger";
import { ParsedHtml, parseAsHtml } from "../../../../utils/dom/html";
import { AmazonSiteUtils } from "../../../engine/stores/amazon/utils/amazon-site-utils";
import { getAllAmazonCoupons } from "./coupons-analyzer/amazon/amazon-coupons-analyzer";
import { initAmazonCouponsStoreBackend } from "@store/AmazonCouponsState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";

export enum AmazonCouponsMessageType {
  FETCH_AMAZON_COUPONS = "fetchAmazonCoupons"
}
export interface IAmazonCouponsDealsBus {
  fetchAmazonCoupons: (request: { document: string; url: string; domainUrl: string }) => Promise<{
    deals: any[];
  }>;
}

export const initAmazonCouponsWorker = async (): Promise<void> => {
  try {
    const store = await initAmazonCouponsStoreBackend();
    debug("AmazonCouponsStore:: AmazonCouponsStore ready:", store);
    const { onMessage } = definePegasusMessageBus<IAmazonCouponsDealsBus>();

    onMessage(AmazonCouponsMessageType.FETCH_AMAZON_COUPONS, async (request) => {
      const { document, url, domainUrl } = request.data;
      if (!AmazonSiteUtils.isAmazonWholesale(url)) {
        store.getState().setCoupons([]);
        return { deals: [] };
      }
      store.getState().setLoading(true);
      const currentPageDom: ParsedHtml = parseAsHtml(document);
      try {
        const deals = await getAllAmazonCoupons({ url, domainUrl, currentPageDom });
        store.getState().setCoupons(deals);
        store.getState().setLoading(false);
        return { deals };
      } catch (error) {
        logError(error);
        store.getState().setLoading(false);
        return { deals: [] };
      }
    });
  } catch (error) {
    logError(error, "AmazonCouponsStoreError:: Error!");
  }
};
