import { initPegasusTransport } from "@utils/pegasus/transport/background";
import { initAntiScamWorker } from "../anti-scam/anti-scam-worker";
import { initLinkScanWorker } from "../anti-scam/link-scan/link-scan-worker";
import { initAuthWorker } from "../auth/auth-worker";
import { initAliExpressSuperDealsWorker } from "../e-commerce/apps/deals-ali-express/worker/ali-super-deals-worker";
import { initAmazonCouponsWorker } from "../e-commerce/apps/deals-amazon/background/deals-coupons-worker";
import { initReviewsSummarizeWorker } from "../e-commerce/reviews/reviews-worker";
import { initCommerce } from "../e-commerce/worker/worker";
import { initShutafWorker } from "../shutaf/shutaf-worker";
import { initSupplier } from "../supplier/worker/worker";
import { initLog, logError } from "../utils/analytics/logger";
import { initExtensionSetup } from "./extension/life-cycle";

// @ts-ignore
const isDebuggerOn = typeof IS_DEBUGGER_ON !== "undefined" ? IS_DEBUGGER_ON : false;

initPegasusTransport();

(async () => {
  try {
    initAuthWorker();
    initLog();
    initExtensionSetup();
    initCommerce();
    initSupplier();
    initAntiScamWorker();
    initLinkScanWorker();
    initReviewsSummarizeWorker();
    initShutafWorker();
    initAmazonCouponsWorker();
    initAliExpressSuperDealsWorker();
  } catch (error) {
    logError(error);
  }
})();
