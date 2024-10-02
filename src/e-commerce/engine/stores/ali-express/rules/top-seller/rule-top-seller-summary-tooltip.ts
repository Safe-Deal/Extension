import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

const isSafe = (isTopSeller: boolean): RuleSummaryTooltipType =>
	isTopSeller ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE

export const getRuleTopSellerSummaryTooltip = (isTopSeller: boolean = false): IRuleSummaryTooltip => {
	const i18nKey: string = isTopSeller ? "tooltip_top_seller_safe" : RULE_IS_HIDDEN
	const descriptionKey: string = i18nKey
	const type: RuleSummaryTooltipType = isSafe(isTopSeller)
	const ruleExplanationKey = "explanations_top_seller_ali_express"
	return {
		description: descriptionKey,
		type,
		ruleExplanation: ruleExplanationKey,
		i18nExplanation: "explanations_top_seller_ali_express",
		i18n: i18nKey
	}
}
