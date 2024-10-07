import tldjs from "tldjs";
import { ProductStore } from "../../src/e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { SiteUtil } from "../../src/e-commerce/engine/logic/utils/site-utils";
import { AliExpressSiteUtils } from "../../src/e-commerce/engine/stores/ali-express/utils/ali-express-site-utils";
import { getAsinFromUrl } from "../../src/e-commerce/engine/stores/amazon/rules/shared/amazon-utils";
import { EbaySiteUtils } from "../../src/e-commerce/engine/stores/ebay/utils/ebay-site-utils";
import { ProcessProductData } from "../services/brain-worker";

export const initProcessProductDataFromUrl = (
  givenUrl: string,
  lang: string = "en",
  regenerate: boolean = false
): ProcessProductData => {
  const url = new URL(givenUrl);
  let productId = null;
  const domain = url.hostname;
  const pathName = url.pathname;

  const store = SiteUtil.getStore(givenUrl);
  switch (store) {
    case ProductStore.ALI_EXPRESS_RUSSIA:
    case ProductStore.ALI_EXPRESS:
      productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(givenUrl);
      break;

    case ProductStore.AMAZON:
      productId = getAsinFromUrl(givenUrl);
      break;

    case ProductStore.EBAY:
      productId = EbaySiteUtils.getWholesaleEbayProductIdFromHref(givenUrl);
      break;

    default:
      break;
  }

  const data: ProcessProductData = {
    product: {
      id: productId,
      domain,
      url: givenUrl,
      regenerate,
      locale: lang
    },
    url: {
      url: givenUrl,
      pathName,
      domain
    },
    lang,
    regenerate
  };

  return data;
};

export const getRootDomain = (url: string): string => tldjs.getDomain(url);

export const serializeToJson = (value, replacer = undefined, space = undefined) => {
  const bigintReplacer = (key, value) => {
    if (replacer) {
      value = replacer(key, value);
    }
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };

  return JSON.stringify(value, bigintReplacer, space);
};
