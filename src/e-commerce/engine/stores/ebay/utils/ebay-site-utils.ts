import { siteNames } from "../../../../../constants/sites";
import Urls from "../../../../../constants/urls";
import { ISiteSpec } from "../../../../../data/entities/site-spec.interface";
import { SiteUtil } from "../../../logic/utils/site-utils";

export const isEbaySite = (url: string): boolean => SiteUtil.containsAny(url, siteNames.EBAY);

export const isEbayWholesaleProducts = (url: string): boolean => isEbayWholesale(url);

export const isEbayWholesale = (url: string): boolean => SiteUtil.containsAny(url, Urls.EBAY_WHOLESALE_PATH_URL);

export const isEbayWholesaleList = (url: string, siteSpec: ISiteSpec): boolean => {
  let isEBayWholesaleList = url?.includes(Urls.EBAY_WHOLESALE_LIST_MODE_QP);
  if (!isEBayWholesaleList) {
    isEBayWholesaleList = siteSpec?.dom?.querySelector(".expand-btn__cell .icon--filter-list-small");
  }
  return isEBayWholesaleList;
};

export const isEbayWholesaleGallery = (url: string): boolean =>
  SiteUtil.containsAny(url, Urls.EBAY_WHOLESALE_GALLERY_MODE_QP);

export const isEbayItemDetails = (url: string): boolean => SiteUtil.containsAny(url, Urls.EBAY_PRODUCT_PATH_URL);

const isEbayOldUrl = (url: string): boolean => url.includes("?iid=");

export const getWholesaleEbayProductIdFromHref = (link) => {
  if (!link) {
    return "";
  }
  if (isEbayOldUrl(link)) {
    const [, substringHrefProduct] = link.split("iid=");
    return substringHrefProduct;
  }
  const [substringHrefProduct] = link.split("?");
  const [substringHrefProductNoHash] = substringHrefProduct.split("#");
  const substringHref = substringHrefProductNoHash.split("/");
  return substringHref.pop();
};

export const EbaySiteUtils = {
  isEbaySite,
  isEbayWholesaleProducts,
  isEbayWholesale,
  isEbayWholesaleList,
  isEbayWholesaleGallery,
  isEbayItemDetails,
  getWholesaleEbayProductIdFromHref
};
