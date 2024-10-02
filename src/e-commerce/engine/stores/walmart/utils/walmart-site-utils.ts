import { siteNames } from "../../../../../constants/sites"
import Urls from "../../../../../constants/urls"
import { SiteUtil } from "../../../logic/utils/site-utils"

const isWalmartWholesaleSite = (url: string): boolean => isWalmartWholesale(url) || isWalmartCategoryWholesale(url)

const isWalmartWholesale = (url: string): boolean => SiteUtil.containsAny(url, Urls.WALMART_WHOLESALE_PATH_URL)
const isWalmartCategoryWholesale = (url: string): boolean =>
	SiteUtil.containsAny(url, Urls.WALMART_CATEGORY_WHOLESALE_PATH_URL)
const isWalmartItemDetails = (url: string): boolean => SiteUtil.containsAny(url, Urls.WALMART_PRODUCT_PATH_URL)

const isWalmartSite = (url: string): boolean => SiteUtil.containsAny(url, siteNames.WALMART)

export const WalmartSiteUtils = {
	isWalmartWholesaleSite,
	isWalmartWholesale,
	isWalmartCategoryWholesale,
	isWalmartItemDetails,
	isWalmartSite
}
