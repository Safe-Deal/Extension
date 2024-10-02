import { querySelector } from "../../../../../utils/dom/html"
import BONUS_POINTS from "../../../../../constants/rule-bonus-value"
import { RULE_IS_HIDDEN } from "../../../../../constants/rule-reliability-messages"
import { RuleSummaryTooltipType } from "../../../../../data/entities/rule-summary-tooltip-type-enum"
import { IRuleSummaryTooltip } from "../../../../../data/entities/rule-summary-tooltip.interface"

export const isProductPrimeVideo = (html) => {
	const rowEl = querySelector([".a-row.a-size-base.a-color-base"], html)
	return rowEl && rowEl?.textContent?.includes("Prime Video")
}
export const getProductPrimeVideoRuleResult = (ruleName, weight) => {
	const tooltip: IRuleSummaryTooltip = {
		description: "",
		type: RuleSummaryTooltipType.SAFE,
		i18n: RULE_IS_HIDDEN,
		ruleExplanation: "",
		i18nExplanation: RULE_IS_HIDDEN
	}

	return {
		name: ruleName,
		value: 0,
		weight,
		bonus: {
			isBonusRule: true,
			value: BONUS_POINTS.TEN
		},
		isValidRule: true,
		tooltipSummary: tooltip
	}
}
