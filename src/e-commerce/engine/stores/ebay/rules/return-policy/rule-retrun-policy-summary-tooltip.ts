import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

export const getRuleReturnPolicySummaryTooltip = (returnPolicyNormalizeValue: number = 0): IRuleSummaryTooltip => {
  const returnsNotAccepted: boolean = returnPolicyNormalizeValue <= BONUS_POINTS.NONE;
  const i18n: string = returnsNotAccepted ? "tooltip_return_policy_un_safe" : "tooltip_return_policy_safe";
  const type: RuleSummaryTooltipType = returnsNotAccepted ? RuleSummaryTooltipType.UNSAFE : RuleSummaryTooltipType.SAFE;
  const i18nRuleExplanation = returnsNotAccepted
    ? "explanations_ebay_return_policy_off"
    : "explanations_ebay_return_policy_on";
  const description = i18n;
  return {
    description,
    type,
    ruleExplanation: i18nRuleExplanation,
    i18nExplanation: i18nRuleExplanation,
    i18n
  };
};
