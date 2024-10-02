import { IDiffDate } from "../../../../../../data/entities/diff-date.interface"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { calculateDatesRange } from "../../../../../../utils/date/date"
import { isExist } from "../../../../../../utils/general/general"
import { AliExpressProductDownloader } from "../../product/ali-express-product-downloader"
import { calculateShopOpenYearValueAlgorithm } from "./rule-shop-open-year-algorithm"
import { getRuleShopOpenYearSummaryTooltip } from "./rule-shop-open-year-summary-tooltip"

export const getRuleShopOpenYearResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new AliExpressProductDownloader(product)
	const result = await downloader.download()
	const storeOpenTime = Number(result?.storeOpenTime) ? Number(result?.storeOpenTime) : result?.storeOpenTime
	const isValidRule = isExist(storeOpenTime)
	const currentDate = new Date()
	const storeOpenDate = new Date(storeOpenTime)
	const diffDates: IDiffDate = calculateDatesRange(storeOpenDate, currentDate)

	const normalizeValue = calculateShopOpenYearValueAlgorithm(diffDates)
	if (
		Number.isNaN(normalizeValue) ||
    Number.isNaN(diffDates.yearDiff) ||
    Number.isNaN(diffDates.monthDiff) ||
    Number.isNaN(diffDates.dayDiff)
	) {
		return {
			name: ruleName,
			weight,
			value: 0,
			isValidRule: false
		}
	}
	const tooltipSummary: IRuleSummaryTooltip = getRuleShopOpenYearSummaryTooltip(normalizeValue, diffDates)
	return {
		name: ruleName,
		value: 0,
		weight: 0,
		bonus: {
			isBonusRule: true,
			value: normalizeValue
		},
		isValidRule,
		tooltipSummary
	}
}
