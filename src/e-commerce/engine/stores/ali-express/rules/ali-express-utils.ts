import { IProduct } from "../../../../../data/entities/product.interface";
import { browserWindow, getAvailableSelector } from "../../../../../utils/dom/html";

const browserPrefixHrefRegexAr = ["chrome-extension", "moz-extension"];
const browserPrefixHrefRegexStr = browserPrefixHrefRegexAr.join("|");
const browserPrefixHrefRegex = new RegExp(browserPrefixHrefRegexStr);
const pageSelector = "meta[property=\"og:url\"]";

export const getUrlFromElement = (product: IProduct, hrefSelector: string) => {
  const isProductPage = hrefSelector === pageSelector;
  if (product.url && isProductPage) {
    return product.url;
  }
  const wholesaleProductItemHrefSel = hrefSelector;
  const wholesaleItemUrlEl = getAvailableSelector(wholesaleProductItemHrefSel, browserWindow().document) as any;
  const wholesaleItemUrl = wholesaleItemUrlEl?.href;
  let url = "";
  if (wholesaleItemUrl) {
    url = wholesaleItemUrl?.replace(browserPrefixHrefRegex, "https") || "";
  } else {
    url = wholesaleItemUrlEl?.content || "";
  }

  if (!url) {
    url = `https://${product.domain}/item/${product.id}.html`;
  }

  return url;
};

export const average = (arr) => {
  if (!arr || arr.length === 0) {
    return 0;
  }
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};
