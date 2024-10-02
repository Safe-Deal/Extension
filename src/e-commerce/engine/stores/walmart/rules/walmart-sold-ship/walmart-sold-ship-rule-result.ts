import BONUS_POINTS from "../../../../../../constants/rule-bonus-value"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import WalmartProductDownloader from "../../product/walmart-product-downloader"
import { getRuleWalmartSoldShipSummaryTooltip } from "./walmart-sold-ship-rule-summary-tooltip"
import { isSoldAndShipByWalmart } from "./walmart-sold-ship-rule-algorithm"
import { getAvailableSelector } from "../../../../../../utils/dom/html"

const SHOP_AND_SOLD = "[data-tl-id='ProductSellerInfo-SellerName']"

export const getRuleWalmartSoldShipResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new WalmartProductDownloader(product)
	const html = await downloader.download()

	const shopAndSoldEl = getAvailableSelector(SHOP_AND_SOLD, html)

	const isValidRule = !!shopAndSoldEl
	const soldShipByWalmartValue: boolean = isSoldAndShipByWalmart(shopAndSoldEl)

	const tooltipSummary: IRuleSummaryTooltip = getRuleWalmartSoldShipSummaryTooltip(soldShipByWalmartValue)

	return {
		name: ruleName,
		value: 0,
		weight,
		bonus: {
			isBonusRule: true,
			value: soldShipByWalmartValue ? BONUS_POINTS.TEN : BONUS_POINTS.NONE
		},
		isValidRule,
		tooltipSummary
	}
}
