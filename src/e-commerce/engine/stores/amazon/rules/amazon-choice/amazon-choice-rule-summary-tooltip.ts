import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

export const getRuleAmazonChoiceSummaryTooltip = (amazonChoiceEl: any): IRuleSummaryTooltip => {
  const isSafe = amazonChoiceEl;
  const i18n = isSafe ? "tooltip_amazon_choice_safe" : RULE_IS_HIDDEN;

  const description = i18n;
  const type: RuleSummaryTooltipType = amazonChoiceEl ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE;
  const ruleExplanation = "explanations_amazon_choice";
  return {
    description,
    type,
    ruleExplanation,
    i18nExplanation: "explanations_amazon_choice",
    i18n
  };
};
