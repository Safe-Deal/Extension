import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { castAsNumber } from "../../../../../../utils/text/strings"

export const getStorePositiveFeedbackSummaryTooltip = (
	normalizeValue: number,
	storePositiveRate: number
): IRuleSummaryTooltip => {
	const isSafe = normalizeValue >= RULE_VALUE.RULE_VAL_5
	const percentageAsNumber = castAsNumber(storePositiveRate)
	const percentage = isSafe ? percentageAsNumber : 100 - percentageAsNumber
	const i18nData = {
		percentOfPeople: percentage?.toFixed(2)
	}
	const i18n = isSafe ? "tooltip_seller_feedback_safe" : "tooltip_seller_feedback_un_safe"
	const ruleExplanation = "explanations_store_rating"
	const type = isSafe ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const description = i18n

	return {
		description,
		type,
		ruleExplanation,
		i18nExplanation: "explanations_store_rating",
		i18n,
		i18nData
	}
}
