import { throttle } from "lodash";
import { browserWindow } from "../../../../utils/dom/html";
import { WalmartSiteUtils } from "./utils/walmart-site-utils";

const DEBOUNCE_DELAY_MS = 200;
export default {
  manageLazyLoadingOnWalmart: (callback, url: string) => {
    if (WalmartSiteUtils.isWalmartWholesaleSite(url)) {
      browserWindow().addEventListener("scroll", throttle(callback, DEBOUNCE_DELAY_MS));
    }
  }
};
