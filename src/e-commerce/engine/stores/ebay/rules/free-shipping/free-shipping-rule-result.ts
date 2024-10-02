import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { getAvailableSelector } from "../../../../../../utils/dom/html"
import eBayProductDownloader from "../../product/ebay-product-downloader"
import { calculateFreeShippingValueAlgorithm } from "./rule-free-shipping-algorithm"
import { getRuleFreeShippingSummaryTooltip } from "./rule-free-shipping-summary-tooltip"

const FREE_SHIPPING_SEL = ["[class*=d-shipping]", "#why2buy .w2b", "#shSummary"].join("|")

export const getRuleFreeShippingResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new eBayProductDownloader(product)
	const html = await downloader.download()
	const deliveryInfoTxt = getAvailableSelector(FREE_SHIPPING_SEL, html)?.textContent
	if (!deliveryInfoTxt) {
		return {
			name: ruleName,
			weight: 0,
			value: 0,
			isValidRule: false
		}
	}

	const bonusValue: number = calculateFreeShippingValueAlgorithm([deliveryInfoTxt])
	const tooltipSummary: IRuleSummaryTooltip = getRuleFreeShippingSummaryTooltip(bonusValue)
	const isValidRule = true
	return {
		name: ruleName,
		value: 0,
		weight,
		bonus: {
			isBonusRule: true,
			value: bonusValue
		},
		isValidRule,
		tooltipSummary
	}
}
