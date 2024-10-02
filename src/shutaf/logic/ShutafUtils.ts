import { IShutaf, ShutafType } from "../../data/entities/shutaf.interface"
import { AliExpressSiteUtils } from "../../e-commerce/engine/stores/ali-express/utils/ali-express-site-utils"
import { AmazonSiteUtils } from "../../e-commerce/engine/stores/amazon/utils/amazon-site-utils"
import { EbaySiteUtils } from "../../e-commerce/engine/stores/ebay/utils/ebay-site-utils"
import { WalmartSiteUtils } from "../../e-commerce/engine/stores/walmart/utils/walmart-site-utils"
import { debug } from "../../utils/analytics/logger"

const CALL_INTERNALS_CONST = "[PRODUCT]"

export const getShutafByUrl = (url: URL, shutaff: IShutaf[]): IShutaf => {
	if (shutaff?.find) {
		const shutaf = shutaff.find((s) => url.host.includes(s.domain))
		if (shutaf) {
			return shutaf
		}
		debug(`No shutaff found for ${url.href}`, "Shutaff:: getShutafByUrl")
		return null
	}
	return null
}

export const isApiCallRequeued = (shutaff: IShutaf): boolean => shutaff?.shutaf == ShutafType.API

export const getUrlFromShutafParams = (shutaf, url, patternOrParam, targetParamName = undefined) => {
	const targetObj = new URL(url)
	const shutafObj = new URL(shutaf)
	let param = ""

	if (patternOrParam) {
		if (patternOrParam.startsWith("regexp:")) {
			const regexPattern = patternOrParam.replace("regexp:", "")
			const regex = new RegExp(regexPattern)
			const match = targetObj.pathname.match(regex)
			param = match ? match[0] : ""
		} else {
			param = targetObj.searchParams.get(patternOrParam) || ""
		}
	}

	if (targetParamName) {
		shutafObj.searchParams.set(targetParamName, param)
		return shutafObj.toString()
	}

	const result = `${shutaf}${param}`
	return result
}

export const isOnItemPage = (url: URL, shutaff: IShutaf): boolean => {
	if (shutaff?.target === CALL_INTERNALS_CONST) {
		if (AliExpressSiteUtils.isAliExpressSite(url.href)) {
			return AliExpressSiteUtils.isAliExpressItemDetails(url.href)
		}

		if (AmazonSiteUtils.isAmazonSite(url.href)) {
			return AmazonSiteUtils.isAmazonItemDetails(url.href)
		}

		if (EbaySiteUtils.isEbaySite(url.href)) {
			return EbaySiteUtils.isEbayItemDetails(url.href)
		}

		if (WalmartSiteUtils.isWalmartSite(url.href)) {
			return WalmartSiteUtils.isWalmartItemDetails(url.href)
		}
		return false
	}

	if (shutaff?.target) {
		const matcher = `${shutaff?.target?.toLowerCase()}`
		const testPage = `${url?.pathname?.toLowerCase()}${url?.search?.toLowerCase()}${url?.hash?.toLocaleLowerCase()}`
		if (matcher.startsWith("regexp:")) {
			debug(`found regex ${matcher}`, "Shutaff:: isOnItemPage")
			const expression = matcher.replace("regexp:", "")
			const regexp = new RegExp(expression)
			const result = regexp.test(testPage)
			return result
		}
		debug(`found containing ${matcher}`, "Shutaff:: isOnItemPage")
		const result = testPage.includes(matcher)
		return result
	}
	return false
}
