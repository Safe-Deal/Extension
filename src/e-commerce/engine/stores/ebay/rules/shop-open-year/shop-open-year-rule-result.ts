import { IDiffDate } from "../../../../../../data/entities/diff-date.interface"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { calculateDatesRange } from "../../../../../../utils/date/date"
import { isExist } from "../../../../../../utils/general/general"
import { BaseProductDownloader } from "../../../../logic/product/baseProductDownloader"
import { getAllAvailableSelectors } from "../../../../../../utils/dom/html"
import eBayProductDownloader from "../../product/ebay-product-downloader"
import { calculateShopOpenYearValueAlgorithm } from "./rule-shop-open-year-algorithm"
import { getRuleShopOpenYearSummaryTooltip } from "./rule-shop-open-year-summary-tooltip"

export const shopOpenYearSelector = ".d-stores-info-categories__container__details"

export const getRuleShopOpenYearResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader: BaseProductDownloader = new eBayProductDownloader(product)
	const html = await downloader.download()
	const shopFullOpenYearEl = getAllAvailableSelectors(shopOpenYearSelector, html, true)
	const shopFullOpenYearInnerText = shopFullOpenYearEl.map((el: HTMLElement) => el?.innerText)

	if (shopFullOpenYearInnerText.length === 0) {
		return {
			name: ruleName,
			weight,
			value: 0,
			isValidRule: false
		}
	}

	const [, month, year] = shopFullOpenYearInnerText[0].split(" ")
	const monthIndex = new Date(Date.parse(`1 ${month} ${year}`)).getMonth()
	const shopFullOpenYearParsed = new Date(Number(year), monthIndex)
	const storeOpenDate = isNaN(shopFullOpenYearParsed.getTime()) ? null : shopFullOpenYearParsed

	const isValidRule = isExist(storeOpenDate)

	if (!isValidRule) {
		return {
			name: ruleName,
			weight,
			value: 0,
			isValidRule: false
		}
	}

	const currentDate = new Date()
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
