import { RULE_VALUE } from "../../../../../../constants/rule-value";

import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

export const getStorePositiveFeedbackSummaryTooltip = (
  normalizeValue: number,
  storePositiveRateValue: number
): IRuleSummaryTooltip => {
  let i18n: string;
  let i18nData: object;
  let type: RuleSummaryTooltipType;
  const isPassed = normalizeValue >= RULE_VALUE.RULE_VAL_5;
  const productFeedbackSummaryTooltipMessage = () => {
    i18nData = isPassed
      ? { percentOfPeople: `${Math.round(storePositiveRateValue).toFixed(2)}` }
      : { percentOfPeople: `${Math.round(100 - storePositiveRateValue).toFixed(2)}` };

    return {
      safe: "tooltip_seller_feedback_safe",
      unsafe: "tooltip_seller_feedback_un_safe",
      unknown: "tooltip_seller_feedback_unknown"
    };
  };

  const ruleExplanation = "explanations_store_rating";
  const tooltipMessages = productFeedbackSummaryTooltipMessage();

  if (storePositiveRateValue) {
    i18n = isPassed ? tooltipMessages.safe : tooltipMessages.unsafe;
    type = isPassed ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE;
  } else {
    i18n = tooltipMessages.unknown;
    type = RuleSummaryTooltipType.UNSAFE;
  }
  const description = i18n;
  return {
    description,
    type,
    ruleExplanation,
    i18nExplanation: "explanations_store_rating",
    i18n,
    i18nData
  };
};
