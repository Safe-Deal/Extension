import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import ruleBonusValue from "../../../../../../constants/rule-bonus-value"

export const getRuleFreeShippingSummaryTooltip = (normalizeValue: number): IRuleSummaryTooltip => {
	const isFreeShipping: boolean = normalizeValue === ruleBonusValue.EIGHT
	const i18n: string = isFreeShipping ? "tooltip_free_shipping_safe" : "tooltip_free_shipping_un_safe"
	const ruleExplanation = "explanations_ebay_free_shipping"
	const type: RuleSummaryTooltipType = isFreeShipping ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const description = i18n
	return {
		description,
		type,
		ruleExplanation,
		i18n,
		i18nExplanation: "explanations_ebay_free_shipping"
	}
}
