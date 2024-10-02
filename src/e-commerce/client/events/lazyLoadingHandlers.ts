import { DONE_PRODUCT_CSS_CLASS } from "../../../constants/display"
import { aliExpressWholeSaleLazy } from "../../engine/stores/ali-express/ali-express-lazy-loading-handler"
import { AliExpressSiteUtils } from "../../engine/stores/ali-express/utils/ali-express-site-utils"
import { amazonLazy, handleVariantOnAmazon } from "../../engine/stores/amazon/amazon-lazy-loading-handler"
import { AmazonSiteUtils } from "../../engine/stores/amazon/utils/amazon-site-utils"
import { ebayLazy } from "../../engine/stores/ebay/ebay-lazy-loading-handler"
import { EbaySiteUtils } from "../../engine/stores/ebay/utils/ebay-site-utils"
import { getAllAvailableSelectors } from "../../../utils/dom/html"
import { Progress, processProducts } from "../processing/productHandler"

export const registerLazyLoaders = (site, siteURL: string, updateProgress: (progress: Progress) => void) => {
	if (AliExpressSiteUtils.isAliExpressSite(siteURL)) {
		aliExpressWholeSaleLazy.manageLazyLoadingOnAliExpress(
			() => processProducts(site, siteURL, updateProgress),
			siteURL
		)

		aliExpressWholeSaleLazy.manageLazyLoadingOnAliExpressPaging(() => {
			const products = getAllAvailableSelectors(`.${DONE_PRODUCT_CSS_CLASS}`, site.dom)
			products.forEach((product) => {
				product?.classList?.remove(DONE_PRODUCT_CSS_CLASS)
			})
			processProducts(site, siteURL, updateProgress)
		}, siteURL)
	}

	if (EbaySiteUtils.isEbaySite(siteURL)) {
		ebayLazy.manageLazyLoadingOneBay(() => processProducts(site, siteURL, updateProgress), siteURL)
	}

	if (AmazonSiteUtils.isAmazonSite(siteURL)) {
		amazonLazy.manageLazyLoadingOnAmazon(() => processProducts(site, siteURL, updateProgress), siteURL)
		if (AmazonSiteUtils.isAmazonItemDetails(siteURL)) {
			handleVariantOnAmazon(() => processProducts(site, siteURL, updateProgress))
		}
	}
}
