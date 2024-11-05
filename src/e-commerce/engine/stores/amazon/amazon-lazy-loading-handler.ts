import { throttle } from "lodash";
import { DEBOUNCE_DELAY_MS } from "../../../../constants/display";
import { debug } from "../../../../utils/analytics/logger";
import { browserWindow } from "../../../../utils/dom/html";
import { onHrefChange } from "../../../../utils/dom/location";
import { PreDisplaySiteFactory } from "../../logic/site/display-site-factory";
import { getAsinFromUrl } from "./rules/shared/amazon-utils";
import { AmazonSiteUtils } from "./utils/amazon-site-utils";

export const amazonLazy = {
  manageLazyLoadingOnAmazon: (callback, url: string) => {
    if (AmazonSiteUtils.isAmazonWholesale(url)) {
      browserWindow().addEventListener("scroll", throttle(callback, DEBOUNCE_DELAY_MS));
    }
  }
};

let currentAsin = getAsinFromUrl(document.location.href);

export const handleVariantOnAmazon = (locateAndProcessUndoneProducts) => {
  onHrefChange((href) => {
    const newAsin = getAsinFromUrl(href);

    if (currentAsin !== newAsin) {
      currentAsin = newAsin;
      const urlParams = new URL(href).searchParams;
      const isVariationChange = urlParams.has("th") || urlParams.has("var");

      if (!isVariationChange) {
        setTimeout(() => {
          PreDisplaySiteFactory.start();
          locateAndProcessUndoneProducts();
        }, 0);
      }
    } else {
      debug(`handleVariantOnAmazon:: same asin ${currentAsin} => skipping analysis`, "Client::handleVariantOnAmazon");
    }
  });
};
