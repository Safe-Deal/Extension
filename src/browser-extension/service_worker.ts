import { initAntiScamWorker } from "../anti-scam/anti-scam-worker";
import { initAliExpressSuperDealsWorker } from "../e-commerce/apps/deals-ali-express/worker/ali-super-deals-worker";
import { initAmazonCouponsWorker } from "../e-commerce/apps/deals-amazon/background/deals-coupons-worker";
import { initReviewsSummarizeWorker } from "../e-commerce/reviews/reviews-worker";
import { initCommerce } from "../e-commerce/worker/worker";
import { initShutafWorker } from "../shutaf/shutaf-worker";
import { initLog, logError } from "../utils/analytics/logger";
import { initExtensionSetup } from "./extension/life-cycle";
import { initWholesaleWarehouse } from "../wholesale-warehouse/worker/worker";

(async () => {
  try {
    initLog();
    initExtensionSetup();
    initCommerce();
    initWholesaleWarehouse();
    initAntiScamWorker();
    initReviewsSummarizeWorker();
    initShutafWorker();
    initAmazonCouponsWorker();
    initAliExpressSuperDealsWorker();
  } catch (error) {
    logError(error);
  }
})();
