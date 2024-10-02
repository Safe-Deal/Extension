import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

export const getBSRSummaryTooltip = (bsrNormalizeValue: number): IRuleSummaryTooltip => {
	let i18n: string = "tooltip_bsr_un_safe"
	let type: RuleSummaryTooltipType = RuleSummaryTooltipType.UNSAFE
	if (bsrNormalizeValue >= RULE_VALUE.RULE_VAL_5) {
		i18n = "tooltip_bsr_safe"
		type = RuleSummaryTooltipType.SAFE
	}
	const ruleExplanation = "explanations_amazon_bsr"
	const description = i18n
	return {
		description,
		type,
		ruleExplanation,
		i18nExplanation: "explanations_amazon_bsr",
		i18n
	}
}
