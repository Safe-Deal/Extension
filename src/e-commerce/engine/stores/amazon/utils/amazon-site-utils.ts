import { siteNames } from "../../../../../constants/sites";
import Urls from "../../../../../constants/urls";
import { SiteUtil } from "../../../logic/utils/site-utils";
import { detectVideoProduct, getAsinFromUrl } from "../rules/shared/amazon-utils";

export const isAmazonSite = (url: string): boolean => SiteUtil.containsAny(url, siteNames.AMAZON);

export const isAmazonItemDetails = (url: string): boolean =>
  SiteUtil.containsAny(url, Urls.AMAZON_ITEM_URL_REGEX) && getAsinFromUrl(url) != null;

export const isAmazonWholesale = (url: string): boolean => {
  const isItemDetails = isAmazonItemDetails(url);
  const isWholesale = SiteUtil.containsAny(url, Urls.AMAZON_WHOLESALE_PATH_URL);
  return !isItemDetails && isWholesale;
};

export const isAmazonVideoItemDetail = (): boolean => detectVideoProduct();

export const AmazonSiteUtils = {
  isAmazonSite,
  isAmazonWholesale,
  isAmazonItemDetails,
  isAmazonVideoItemDetail
};
