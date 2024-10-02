import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages"
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"

const getRuleProSellerSummaryTooltip = (proSellerEl: any): IRuleSummaryTooltip => {
	const i18n: string = proSellerEl ? "tooltip_walmart_pro_seller" : RULE_IS_HIDDEN
	const type: RuleSummaryTooltipType = proSellerEl ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE
	const ruleExplanation = "explanations_walmart_pro_seller"
	const description = i18n
	return {
		description,
		type,
		ruleExplanation,
		i18nExplanation: "explanations_walmart_pro_seller",
		i18n
	}
}

export { getRuleProSellerSummaryTooltip }
