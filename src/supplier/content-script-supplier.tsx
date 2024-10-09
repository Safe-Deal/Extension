import React from "react";
import ReactDOM from "react-dom/client";
import { authStoreReady } from "@store/AuthState";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { debug, IS_DEBUG, logError } from "../utils/analytics/logger";
import { MODIFIED_PAGES_CSS_CLASS } from "../constants/display";
import { ErrorBoundary } from "../utils/analytics/ErrorBoundary";
import { SupplierClient } from "./client/SupplierClient";

import "../e-commerce/client/assets/style.scss";
import { SiteUtil } from "../e-commerce/engine/logic/utils/site-utils";

initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_SUPPLIER" });

const initSupplierClient = (): void => {
  debug("isSupplier::  initializing.... Started");

  const rootElement = document.createElement("div");
  rootElement.id = "safe-deal-toolbar-root";
  rootElement.className = MODIFIED_PAGES_CSS_CLASS;
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <SupplierClient />
      </React.StrictMode>
    </ErrorBoundary>
  );

  debug("isSupplier::  initializing.... Done");
};

(async () => {
  try {
    if (!IS_DEBUG) {
      return;
    }
    if (SiteUtil.isAlibabaSite() && SiteUtil.isAlibabaSupplierSite()) {
      debug("SafeDeal Client::  initializing.... Alibaba supplier temporary not supported. Exiting....");
      return null;
    }
    await authStoreReady().then((store) => {
      debug("SafeDeal Client::  initializing.... Auth store is ready!", store);
    });
    initSupplierClient();
  } catch (error) {
    logError(error);
  }
})();
