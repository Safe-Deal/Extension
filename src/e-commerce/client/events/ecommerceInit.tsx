import React from "react";
import ReactDOM from "react-dom/client";
import { debug } from "@utils/analytics/logger";
import { SiteMetadata } from "../../../utils/site/site-information";
import { ECommerceClient } from "../ECommerceClient";
import { Tour } from "../../../browser-extension/app-tour/tour-tutorial";
import { MODIFIED_PAGES_CSS_CLASS } from "../../../constants/display";
import { ErrorBoundary } from "../../../utils/analytics/ErrorBoundary";
import { SiteUtil } from "../../engine/logic/utils/site-utils";

const JUST_INSTALLED_PARAM = "safe_deal_installed";

export const initTour = () => {
  const siteURL: string = SiteMetadata.getURL();
  if (siteURL.includes(JUST_INSTALLED_PARAM)) {
    if (SiteUtil.isItemDetails(siteURL)) {
      Tour.start();
    }
  }
};

export const initApps = async (store) => {
  debug("ECommerce Client::  Starting Apps....");
  debug("ECommerce Client::  AliSuperDeals Apps....");
  //   aliExpressSuperDealsApp(store);
  debug("ECommerce Client::  Starting Apps.... Done");
};

export const initCommerceClient = () => {
  debug("ECommerce Client::  initializing.... Started");
  const isWholesale = SiteUtil.isWholesale();
  const isItemDetails = SiteUtil.isItemDetails();

  if (!isWholesale && !isItemDetails) {
    debug("ECommerce Client::  initializing.... Not a valid page. Exiting....");
    return null;
  }

  const rootElement = document.createElement("div");
  rootElement.id = "safe-deal-toolbar-root";
  rootElement.className = MODIFIED_PAGES_CSS_CLASS;
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <ECommerceClient />
      </React.StrictMode>
    </ErrorBoundary>
  );
  debug("ECommerce Client::  initializing.... Done");
  return null;
};
