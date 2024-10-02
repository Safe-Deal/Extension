import { SiteMetadata } from "../../../../utils/site/site-information"
import { AliExpressSiteUtils } from "../../stores/ali-express/utils/ali-express-site-utils"
import { getAsinFromUrl } from "../../stores/amazon/rules/shared/amazon-utils"
import { AmazonSiteUtils } from "../../stores/amazon/utils/amazon-site-utils"
import { EbaySiteUtils } from "../../stores/ebay/utils/ebay-site-utils"
import { ProductStore } from "../conclusion/conclusion-product-entity.interface"
import { AlibabaSiteUtils } from "../../../../wholesale-warehouse/utils/alibaba-site-utils"

const CONDITION_SPLITTER = "|"

export class SiteUtil {
	public static isEbayOrAmazonSite(url: string = SiteMetadata.getURL()) {
		return EbaySiteUtils.isEbaySite(url) || AmazonSiteUtils.isAmazonSite(url)
	}

	public static getProductID(url: string = SiteMetadata.getURL()): string {
		const isItemDetails = SiteUtil.isItemDetails(url)
		if (!isItemDetails) {
			return null
		}

		const store = SiteUtil.getStore(url)
		switch (store) {
		case ProductStore.ALI_EXPRESS_RUSSIA:
		case ProductStore.ALI_EXPRESS:
			return AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(url)
		case ProductStore.AMAZON:
			return getAsinFromUrl(url)
		case ProductStore.EBAY:
			return EbaySiteUtils.getWholesaleEbayProductIdFromHref(url)
		default:
			return null
		}
	}

	public static isItemDetails(url: string = SiteMetadata.getURL()): boolean {
		const store = SiteUtil.getStore(url)
		switch (store) {
		case ProductStore.ALI_EXPRESS_RUSSIA:
		case ProductStore.ALI_EXPRESS:
			return AliExpressSiteUtils.isAliExpressItemDetails(url)
		case ProductStore.AMAZON:
			return AmazonSiteUtils.isAmazonItemDetails(url)
		case ProductStore.EBAY:
			return EbaySiteUtils.isEbayItemDetails(url)
		default:
			return (
				AliExpressSiteUtils.isAliExpressItemDetails(url) ||
          AmazonSiteUtils.isAmazonItemDetails(url) ||
          EbaySiteUtils.isEbayItemDetails(url)
			)
		}
	}

	public static isWholesale(url: string = SiteMetadata.getURL()): boolean {
		const store = SiteUtil.getStore(url)
		switch (store) {
		case ProductStore.ALI_EXPRESS_RUSSIA:
		case ProductStore.ALI_EXPRESS:
			return AliExpressSiteUtils.isAliExpressWholesale(url)
		case ProductStore.AMAZON:
			return AmazonSiteUtils.isAmazonWholesale(url)
		case ProductStore.EBAY:
			return EbaySiteUtils.isEbayWholesale(url)
		default:
			return false
		}
	}

	public static matchesAny(url: string, patterns: RegExp[]) {
		if (!url) {
			return false
		}
		const urlToTest = url?.toString()?.toLowerCase()
		return patterns.some((pattern) => pattern.test(urlToTest))
	}

	public static containsAny(url: string, pattern: string) {
		if (!url) {
			return false
		}
		const urlToTest = url?.toString()?.toLowerCase()
		const patternToTest = pattern?.toLowerCase()
		if (patternToTest.includes(CONDITION_SPLITTER)) {
			const items = patternToTest.split(CONDITION_SPLITTER)
			return items.some((v) => urlToTest.includes(v))
		}
		const result = urlToTest.includes(patternToTest)
		return result
	}

	public static getStore(url = SiteMetadata.getURL()): ProductStore {
		if (AliExpressSiteUtils.isAliExpressRussianSite(url)) {
			return ProductStore.ALI_EXPRESS_RUSSIA
		}

		if (AliExpressSiteUtils.isAliExpressSite(url)) {
			return ProductStore.ALI_EXPRESS
		}

		if (AmazonSiteUtils.isAmazonSite(url)) {
			return ProductStore.AMAZON
		}

		if (EbaySiteUtils.isEbaySite(url)) {
			return ProductStore.EBAY
		}

		return ProductStore.NOT_SUPPORTED
	}

	public static isAliExpressSite(url = SiteMetadata.getURL()): boolean {
		return AliExpressSiteUtils.isAliExpressSite(url)
	}

	public static isAliExpressRussianSite(url = SiteMetadata.getURL()): boolean {
		return AliExpressSiteUtils.isAliExpressRussianSite(url)
	}

	public static isAmazonSite(url = SiteMetadata.getURL()): boolean {
		return AmazonSiteUtils.isAmazonSite(url)
	}

	public static isEbaySite(url = SiteMetadata.getURL()): boolean {
		return EbaySiteUtils.isEbaySite(url)
	}

	public static isAlibabaSite(url = SiteMetadata.getURL()): boolean {
		return AlibabaSiteUtils.isAlibabaSite(url)
	}

	public static isAlibabaWarehouseSite(url = SiteMetadata.getURL()): boolean {
		return AlibabaSiteUtils.isAlibabaWholesale(url)
	}
}
