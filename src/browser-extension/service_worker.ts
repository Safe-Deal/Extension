import { initPegasusTransport } from "@utils/pegasus/transport/background";
import { initAntiScamWorker } from "../anti-scam/anti-scam-worker";
import { initAliExpressSuperDealsWorker } from "../e-commerce/apps/deals-ali-express/worker/ali-super-deals-worker";
import { initAmazonCouponsWorker } from "../e-commerce/apps/deals-amazon/background/deals-coupons-worker";
import { initReviewsSummarizeWorker } from "../e-commerce/reviews/reviews-worker";
import { initCommerce } from "../e-commerce/worker/worker";
import { initShutafWorker } from "../shutaf/shutaf-worker";
import { initLog, logError } from "../utils/analytics/logger";
import { initExtensionSetup } from "./extension/life-cycle";
import { initSupplier } from "../supplier/worker/worker";
import { initAuthWorker } from "../auth/auth-worker";

initPegasusTransport();

(async () => {
  try {
    initAuthWorker();
    initLog();
    initExtensionSetup();
    initCommerce();
    initSupplier();
    initAntiScamWorker();
    initReviewsSummarizeWorker();
    initShutafWorker();
    initAmazonCouponsWorker();
    initAliExpressSuperDealsWorker();
  } catch (error) {
    logError(error);
  }
})();
