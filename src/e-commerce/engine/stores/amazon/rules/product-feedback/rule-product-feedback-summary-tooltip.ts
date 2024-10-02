import { displayNumber } from "../../../../../../utils/text/strings"
import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

export const getProductFeedbackSummaryTooltip = (
	productFeedbackNormalizeValue: number = 0,
	rating: number,
	reviews: number,
	ratings: number
): IRuleSummaryTooltip => {
	let i18n: string
	let type: RuleSummaryTooltipType
	const isSafe = productFeedbackNormalizeValue >= RULE_VALUE.RULE_VAL_5
	const i18nData = {
		ProductRatingValue: displayNumber(rating, 1),
		ProductReviewAmount: displayNumber(reviews),
		ProductRatingAmount: displayNumber(ratings)
	}
	i18n = isSafe ? "tooltip_product_feedback_safe_rated" : "tooltip_product_feedback_un_safe_rated"
	type = isSafe ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const description = i18n

	return {
		description,
		type,
		ruleExplanation: "explanations_review_and_ratings",
		i18nExplanation: "explanations_review_and_ratings",
		i18n,
		i18nData
	}
}
