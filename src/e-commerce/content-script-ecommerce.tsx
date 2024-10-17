import { debug, logError } from "@utils/analytics/logger";
import { initPageDisplay } from "@constants/display";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { authStoreReady } from "@store/AuthState";
import { ProductStore } from "./engine/logic/conclusion/conclusion-product-entity.interface";
import { PreDisplaySiteFactory } from "./engine/logic/site/display-site-factory";
import { SiteUtil } from "./engine/logic/utils/site-utils";
import { initApps, initCommerceClient, initTour } from "./client/events/ecommerceInit";

import "./client/assets/style.scss";

initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_ECOMMERCE" });

(async () => {
  try {
    debug("SafeDeal Client::  initializing.... Started");
    await authStoreReady();
    const store = SiteUtil.getStore();
    if (store === ProductStore.NOT_SUPPORTED) {
      debug("SafeDeal Client::  initializing.... Store not supported. Exiting....");
      return null;
    }

    if (SiteUtil.isAliExpressSite() && SiteUtil.isWholesale()) {
      debug("SafeDeal Client::  initializing.... ALI_EXPRESS Wholesale temporary not supported. Exiting....");
      return null;
    }

    initPageDisplay(document);
    initTour();
    initCommerceClient();
    initApps(store);
    debug("SafeDeal Client::  initializing.... Done");
  } catch (error) {
    PreDisplaySiteFactory.destroy();
    logError(error);
  }
  return null;
})();
