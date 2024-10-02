import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../../../../utils/analytics/ErrorBoundary";
import { debug, logError } from "../../../../utils/analytics/logger";
import { ProductStore } from "../../../engine/logic/conclusion/conclusion-product-entity.interface";
import AliSuperDealsApp from "./ali-super-deals-app";
import { SiteUtil } from "../../../engine/logic/utils/site-utils";

import "./styles/styles.scss";

export const bootstrapAliSuperDealsDealCouponsApp = (store): void => {
  const isItemDetail = SiteUtil.isItemDetails();
  const showDeals = store === ProductStore.ALI_EXPRESS && !isItemDetail;
  if (store !== ProductStore.ALI_EXPRESS) {
    debug("AliSuperDealsApp Client Content Script:: Wont run on this store");
    return null;
  }

  debug("AliSuperDealsApp Client Content Script:: initializing....");

  const dealsContainerRootNode = document.createElement("div");
  dealsContainerRootNode.id = "sd-ali-superdeals-coupons-root";

  // Append the newly created div to the body
  document.body.appendChild(dealsContainerRootNode);

  // Create a root container if the element exists
  const rootElement = document.getElementById("sd-ali-superdeals-coupons-root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      showDeals && (
        <ErrorBoundary>
          <AliSuperDealsApp />
        </ErrorBoundary>
      )
    );
  } else {
    logError(new Error("Failed to find the root element for Ali SuperDeals Deals Coupons App"));
  }
};
