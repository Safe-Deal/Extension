import React from "react";
import ReactDOM from "react-dom/client";
import { debug, IS_DEBUG, logError } from "../utils/analytics/logger";
import { MODIFIED_PAGES_CSS_CLASS } from "../constants/display";
import { ErrorBoundary } from "../utils/analytics/ErrorBoundary";
import { WholesaleWarehouseClient } from "./client/WholesaleWarehouseClient";

import "../e-commerce/client/assets/style.scss";
import { SiteUtil } from "../e-commerce/engine/logic/utils/site-utils";

const initWholesaleWarehouseClient = (): void => {
  debug("Wholesale Warehouse::  initializing.... Started");

  const rootElement = document.createElement("div");
  rootElement.id = "safe-deal-toolbar-root";
  rootElement.className = MODIFIED_PAGES_CSS_CLASS;
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <WholesaleWarehouseClient />
      </React.StrictMode>
    </ErrorBoundary>
  );

  debug("Wholesale Warehouse::  initializing.... Done");
};

(async () => {
  try {
    if (!IS_DEBUG) {
      return;
    }

    if (SiteUtil.isAlibabaSite() && SiteUtil.isAlibabaWarehouseSite()) {
      debug("SafeDeal Client::  initializing.... Alibaba Warehouse Wholesale temporary not supported. Exiting....");
      return null;
    }

    initWholesaleWarehouseClient();
  } catch (error) {
    logError(error);
  }
})();
