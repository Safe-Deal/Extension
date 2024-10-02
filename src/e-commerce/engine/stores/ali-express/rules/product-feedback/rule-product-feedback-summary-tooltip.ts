import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { displayNumber } from "../../../../../../utils/text/strings"

export const getProductFeedbackSummaryTooltip = (
	productFeedbackNormalizeValue: number = 0,
	isAllValuesExist: boolean = true,
	stars: number,
	reviews: number,
	orders: number
): IRuleSummaryTooltip => {
	let type: RuleSummaryTooltipType
	let i18n: string

	const i18nData = {
		ProductRatingValue: displayNumber(stars, 1),
		ProductReviewAmount: displayNumber(reviews),
		ProductOrdersAmount: displayNumber(orders)
	}

	const isSafe = productFeedbackNormalizeValue === RULE_VALUE.RULE_VAL_10

	if (isAllValuesExist) {
		i18n = isSafe ? "tooltip_product_feedback_safe_orders_only" : "tooltip_product_feedback_un_safe_orders_only"
		type = isSafe ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	} else {
		type = RuleSummaryTooltipType.UNSAFE
		i18n = "tooltip_product_feedback_un_safe"
	}

	const description = i18n
	return {
		description,
		type,
		ruleExplanation: description,
		i18nExplanation: "explanations_review_and_ratings",
		i18n,
		i18nData
	}
}
