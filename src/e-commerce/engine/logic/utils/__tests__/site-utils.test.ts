import { AliExpressSiteUtils } from "../../../stores/ali-express/utils/ali-express-site-utils"
import { AmazonSiteUtils } from "../../../stores/amazon/utils/amazon-site-utils"
import { EbaySiteUtils } from "../../../stores/ebay/utils/ebay-site-utils"
import { SiteUtil } from "../site-utils"
import {
	ali_products,
	ali_wholesales,
	amazon_products,
	amazon_wholesales,
	ebay_products,
	ebay_wholesales,
	notAliLinks,
	notAmazonLinks,
	notEbayLinks,
	notItemOrWholesalePages
} from "./urls.mock"

describe("Site Utils test", () => {
	it("should work properly for AliExpress links", () => {
		for (const ali_product of ali_products) {
			expect(AliExpressSiteUtils.isAliExpressItemDetails(ali_product)).toBeTruthy()
			expect(AliExpressSiteUtils.isAliExpressWholesale(ali_product)).toBeFalsy()
		}

		for (const ali_product of ali_products) {
			expect(AliExpressSiteUtils.isAliExpressItemDetails(ali_product)).toBeTruthy()
			expect(AliExpressSiteUtils.isAliExpressWholesale(ali_product)).toBeFalsy()
		}

		for (const ali_wholesale of ali_wholesales) {
			expect(AliExpressSiteUtils.isAliExpressItemDetails(ali_wholesale)).toBeFalsy()
			expect(AliExpressSiteUtils.isAliExpressWholesale(ali_wholesale)).toBeTruthy()
		}

		for (const notAliLink of notAliLinks) {
			expect(AliExpressSiteUtils.isAliExpressSite(notAliLink)).toBeFalsy()
		}
	})

	it("should work properly for eBay links", () => {
		for (const ebay_product of ebay_products) {
			expect(EbaySiteUtils.isEbayItemDetails(ebay_product)).toBeTruthy()
			expect(EbaySiteUtils.isEbayWholesale(ebay_product)).toBeFalsy()
		}

		for (const ebay_wholesale of ebay_wholesales) {
			expect(EbaySiteUtils.isEbayItemDetails(ebay_wholesale)).toBeFalsy()
			expect(EbaySiteUtils.isEbayWholesale(ebay_wholesale)).toBeTruthy()
		}

		for (const notEbayLink of notEbayLinks) {
			expect(EbaySiteUtils.isEbaySite(notEbayLink)).toBeFalsy()
		}
	})

	it("should work properly for Amazon links", () => {
		for (const amazon_product of amazon_products) {
			expect(AmazonSiteUtils.isAmazonItemDetails(amazon_product)).toBeTruthy()
			expect(AmazonSiteUtils.isAmazonWholesale(amazon_product)).toBeFalsy()
		}

		for (const amazon_wholesale of amazon_wholesales) {
			expect(AmazonSiteUtils.isAmazonItemDetails(amazon_wholesale)).toBeFalsy()
			expect(AmazonSiteUtils.isAmazonWholesale(amazon_wholesale)).toBeTruthy()
		}

		for (const notAmazonLink of notAmazonLinks) {
			expect(AmazonSiteUtils.isAmazonSite(notAmazonLink)).toBeFalsy()
		}
	})

	test.each(ali_wholesales)("should return false for ali_wholesale link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeFalsy()
	})

	test.each(amazon_wholesales)("should return false for amazon_wholesale link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeFalsy()
	})

	test.each(ebay_wholesales)("should return false for ebay_wholesale link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeFalsy()
	})

	test.each(ali_products)("should return true for ali_product link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeTruthy()
	})

	test.each(amazon_products)("should return true for amazon_product link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeTruthy()
	})

	test.each(ebay_products)("should return true for ebay_product link %s", (link) => {
		expect(SiteUtil.isItemDetails(link)).toBeTruthy()
	})

	it("should work properly identify not item pages", () => {
		for (const link of notItemOrWholesalePages) {
			expect(AliExpressSiteUtils.isAliExpressItemDetails(link)).toBeFalsy()
			expect(AmazonSiteUtils.isAmazonItemDetails(link)).toBeFalsy()
			expect(EbaySiteUtils.isEbayItemDetails(link)).toBeFalsy()
			expect(SiteUtil.isItemDetails(link)).toBeFalsy()
		}
	})

	it("should work properly identify not wholesale pages", () => {
		for (const link of notItemOrWholesalePages) {
			expect(AliExpressSiteUtils.isAliExpressWholesale(link)).toBeFalsy()
			expect(AmazonSiteUtils.isAmazonWholesale(link)).toBeFalsy()
			expect(EbaySiteUtils.isEbayWholesale(link)).toBeFalsy()
			expect(SiteUtil.isWholesale(link)).toBeFalsy()
		}
	})
})

describe("matchesAny", () => {
	it("should return true if the URL matches any of the patterns", () => {
		const patterns = [/example\.com/, /test\.com/, /demo\.com/]
		const url = "https://www.example.com"
		expect(SiteUtil.matchesAny(url, patterns)).toBeTruthy()
	})

	it("should return false if the URL does not match any of the patterns", () => {
		const patterns = [/example\.com/, /test\.com/, /demo\.com/]
		const url = "https://www.google.com"
		expect(SiteUtil.matchesAny(url, patterns)).toBeFalsy()
	})

	it("should return false if the URL is empty", () => {
		const patterns = [/example\.com/, /test\.com/, /demo\.com/]
		const url = ""
		expect(SiteUtil.matchesAny(url, patterns)).toBeFalsy()
	})

	it("should return false if the patterns array is empty", () => {
		const patterns: RegExp[] = []
		const url = "https://www.example.com"
		expect(SiteUtil.matchesAny(url, patterns)).toBeFalsy()
	})
})
