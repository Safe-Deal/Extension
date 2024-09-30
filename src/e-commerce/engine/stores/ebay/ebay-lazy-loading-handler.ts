import { throttle } from "lodash";
import { browserWindow } from "../../../../utils/dom/html";
import { EbaySiteUtils } from "./utils/ebay-site-utils";

const DEBOUNCE_DELAY_MS = 200;
export const ebayLazy = {
  manageLazyLoadingOneBay: (callback, url: string) => {
    if (EbaySiteUtils.isEbayWholesale(url)) {
      browserWindow().addEventListener("scroll", throttle(callback, DEBOUNCE_DELAY_MS));
    }
  }
};
