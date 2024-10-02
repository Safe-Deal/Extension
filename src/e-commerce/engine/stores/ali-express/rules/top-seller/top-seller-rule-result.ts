import BONUS_POINTS from "../../../../../../constants/rule-bonus-value"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { isExist } from "../../../../../../utils/general/general"
import { getRuleTopSellerSummaryTooltip } from "./rule-top-seller-summary-tooltip"
import { AliExpressProductDownloader } from "../../product/ali-express-product-downloader"

export const getRuleTopSellerResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new AliExpressProductDownloader(product)
	const result = await downloader.download()
	const isTopSeller = result?.storeIsTopRated
	const isValidRule = isExist(isTopSeller)
	const tooltipSummary: IRuleSummaryTooltip = getRuleTopSellerSummaryTooltip(isTopSeller)
	return {
		name: ruleName,
		value: 0,
		weight,
		bonus: {
			isBonusRule: true,
			value: isTopSeller ? BONUS_POINTS.TEN : BONUS_POINTS.NONE
		},
		isValidRule,
		tooltipSummary
	} as IRuleResult
}
