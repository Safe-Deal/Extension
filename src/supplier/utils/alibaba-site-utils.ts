import { siteNames } from "../../constants/sites";
import { SiteUtil } from "../../e-commerce/engine/logic/utils/site-utils";
import Urls from "../../constants/urls";

export const isAlibabaSite = (url: string): boolean => SiteUtil.containsAny(url, siteNames.ALIBABA);

export const isAlibabaItemDetails = (url: string): boolean => SiteUtil.containsAny(url, Urls.ALIBABA_PRODUCT_PATH_URL);

export const isAlibabaSupplier = (url: string): boolean => !isAlibabaItemDetails(url);

export const AlibabaSiteUtils = {
  isAlibabaSite,
  isAlibabaSupplier,
  isAlibabaItemDetails
};
