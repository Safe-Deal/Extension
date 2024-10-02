import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

export const getRuleTopSellerSummaryTooltip = (isTopSeller: boolean = false): IRuleSummaryTooltip => {
	const i18n: string = isTopSeller ? "tooltip_top_seller_safe" : RULE_IS_HIDDEN
	const description: string = i18n
	const type: RuleSummaryTooltipType = isTopSeller ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const i18nExplanation = "explanations_ebay_top_rated"
	return {
		description,
		type,
		ruleExplanation: i18nExplanation,
		i18nExplanation,
		i18n
	}
}
