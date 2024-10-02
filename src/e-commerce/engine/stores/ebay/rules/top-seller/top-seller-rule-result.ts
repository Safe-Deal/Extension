import BONUS_POINTS from "../../../../../../constants/rule-bonus-value"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import eBayProductDownloader from "../../product/ebay-product-downloader"
import { getRuleTopSellerSummaryTooltip } from "./rule-top-seller-summary-tooltip"

export const getRuleTopSellerResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string,
	isItemDetails?: boolean
): Promise<IRuleResult> => {
	const downloader = new eBayProductDownloader(product)
	const html = await downloader.download()
	const shopWithConfidenceSections = html?.querySelectorAll(hrefSelector)
	let isValidRule = false
	let bonusValue: any = BONUS_POINTS.NONE
	if (shopWithConfidenceSections && shopWithConfidenceSections.length > 0) {
		const confidenceText = [...shopWithConfidenceSections].map((it) => it?.textContent?.toLowerCase())
		const isItemTopSeller = confidenceText.some((item) => item.includes("top rated"))
		isValidRule = isItemTopSeller
		bonusValue = isItemTopSeller ? BONUS_POINTS.HUGE_BONUS : BONUS_POINTS.NONE
	}
	const tooltipSummary: IRuleSummaryTooltip = getRuleTopSellerSummaryTooltip(isValidRule)
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
