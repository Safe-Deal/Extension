import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

export const getProductFeedbackSummaryTooltip = (productFeedbackNormalizeValue: number = 0): IRuleSummaryTooltip => {
	const isOk = productFeedbackNormalizeValue >= RULE_VALUE.RULE_VAL_5
	const i18n = isOk ? "tooltip_product_feedback_safe" : "tooltip_product_feedback_un_safe"
	const type = isOk ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const description = i18n
	return {
		description,
		type,
		ruleExplanation: "explanations_review_and_ratings",
		i18nExplanation: "explanations_review_and_ratings",
		i18n
	}
}
