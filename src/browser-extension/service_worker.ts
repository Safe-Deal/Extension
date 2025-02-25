import { initPegasusTransport } from "@utils/pegasus/transport/background";
import { initAntiScamWorker } from "../anti-scam/anti-scam-worker";
import { initAliExpressSuperDealsWorker } from "../e-commerce/apps/deals-ali-express/worker/ali-super-deals-worker";
import { initAmazonCouponsWorker } from "../e-commerce/apps/deals-amazon/background/deals-coupons-worker";
import { initReviewsSummarizeWorker } from "../e-commerce/reviews/reviews-worker";
import { initCommerce } from "../e-commerce/worker/worker";
import { initShutafWorker } from "../shutaf/shutaf-worker";
import { initLog, logError, debug } from "../utils/analytics/logger";
import { initExtensionSetup } from "./extension/life-cycle";
import { initSupplier } from "../supplier/worker/worker";
import { initAuthWorker } from "../auth/auth-worker";
import { initHotReload } from "./hot-reload";

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
    initReviewsSummarizeWorker();
    initShutafWorker();
    initAmazonCouponsWorker();
    initAliExpressSuperDealsWorker();

    if (isDebuggerOn) {
      debug("[HotReload] Enabled - in development mode (will reload extension and active tab)");
      initHotReload();
    }
  } catch (error) {
    logError(error);
  }
})();
