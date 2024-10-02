import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

export const getProductPricingSummaryTooltip = (
	productPricingNormalizeValue,
	currentProductPricing: number
): IRuleSummaryTooltip => {
	if (!productPricingNormalizeValue) {
		return null
	}
	const ruleExplanation = "explanations_price_history"

	if (currentProductPricing == null) {
		return {
			description: "tooltip_product_pricing_no_price_available",
			i18n: "tooltip_product_pricing_no_price_available",
			type: RuleSummaryTooltipType.UNSAFE,
			ruleExplanation,
			i18nExplanation: "tooltip_product_pricing_no_price_available"
		}
	}

	const { normalizeValue, ratio } = productPricingNormalizeValue
	let description: string
	let type: RuleSummaryTooltipType
	let priceDifVsAverage: any = Math.abs(ratio)
	let i18n: string
	let i18nData: object
	priceDifVsAverage = priceDifVsAverage < 1 ? "1" : `${priceDifVsAverage.toFixed(0)}`

	if (ratio === 0) {
		i18n = "tooltip_product_pricing_average"
		description = i18n
		type = RuleSummaryTooltipType.SAFE
	} else {
		switch (normalizeValue) {
		case RULE_VALUE.RULE_VAL_5:
		case RULE_VALUE.RULE_VAL_6:
			i18n = "tooltip_product_pricing_type_excellent"
			i18nData = { priceDifVsAverage }
			description = i18n
			type = RuleSummaryTooltipType.SAFE
			break

		case RULE_VALUE.RULE_VAL_3:
			i18n = "tooltip_product_pricing_type_average_lower"
			i18nData = { priceDifVsAverage }
			description = i18n
			type = RuleSummaryTooltipType.SAFE
			break

		case RULE_VALUE.RULE_VAL_7:
			i18n = "tooltip_product_pricing_type_average_higher"
			i18nData = { priceDifVsAverage }
			description = i18n
			type = RuleSummaryTooltipType.SAFE
			break
		default:
			i18n = "tooltip_product_pricing_type_expensive"
			i18nData = { priceDifVsAverage }
			description = i18n
			type = RuleSummaryTooltipType.UNSAFE
			break
		}
	}

	return {
		description,
		type,
		ruleExplanation,
		i18nExplanation: "explanations_price_history",
		i18n,
		i18nData
	}
}
