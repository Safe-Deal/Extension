import { siteNames } from "../../../../../constants/sites";
import Urls from "../../../../../constants/urls";
import { SiteUtil } from "../../../logic/utils/site-utils";

export const isAliExpressSite = (url: string): boolean => SiteUtil.containsAny(url, siteNames.ALI_EXPRESS);

export const isAliExpressRussianSite = (url: string): boolean => SiteUtil.containsAny(url, "aliexpress.ru");

export const isAliExpressItemDetails = (url: string): boolean =>
  SiteUtil.matchesAny(url, Urls.ALI_EXPRESS_PRODUCT_PATH_REGEX);

export const isAliExpressWholesale = (url: string): boolean =>
  SiteUtil.containsAny(url, Urls.ALI_EXPRESS_WHOLESALE_PATH_URL) && !isAliExpressItemDetails(url);

export const getWholesaleAliExpressProductIdFromHref = (link) => {
  if (!link) {
    return "";
  }
  const regex = /\/(?:[a-zA-Z0-9_-]+)\/(\d+)\.html/;
  const match = link.match(regex);
  return match ? match[1] : "";
};

export const isAliExpressStore = (link: string) => SiteUtil.containsAny(link, Urls.ALI_EXPRESS_STORE_PATH_URL);

export const AliExpressSiteUtils = {
  isAliExpressSite,
  isAliExpressRussianSite,
  isAliExpressStore,
  isAliExpressWholesale,
  isAliExpressItemDetails,
  getWholesaleAliExpressProductIdFromHref
};
