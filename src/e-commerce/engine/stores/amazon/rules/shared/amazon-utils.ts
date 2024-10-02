import { IProduct } from "../../../../../../data/entities/product.interface";
import { browserWindow, isSelectorExists } from "../../../../../../utils/dom/html";
import { replaceAll } from "../../../../../../utils/text/strings";

export const getAsinFromUrl = (url) => {
  const asin = url.replace("#", "/").match("/([a-zA-Z0-9]{10})(?:[/?]|$)");
  if (asin && asin.length > 0) {
    const result = replaceAll(asin[0], "/", "");
    return replaceAll(result, "?", "");
  }

  return null;
};

export const detectVideoProduct = (): boolean => {
  const VIDEO_PAGE_SELECTORS = [
    "[data-testid=genresMetadata]",
    "[data-testid=rating-badge]",
    "[data-card-entity-type=Movie]"
  ].join("|");

  const videoSelectorsExist = isSelectorExists(VIDEO_PAGE_SELECTORS, browserWindow().document);

  return videoSelectorsExist;
};

export const getUrlByAsin = (domain, asin) => `https://${domain}/exec/obidos/ASIN/${asin}`;

export const isUrl = (string) => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};

export const getAsin = (product: IProduct) => {
  if (product.id) {
    return product.id;
  }
  const asin = getAsinFromUrl(product.url);
  return asin;
};
