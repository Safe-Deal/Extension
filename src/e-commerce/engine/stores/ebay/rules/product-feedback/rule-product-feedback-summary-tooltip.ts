import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { displayNumber } from "../../../../../../utils/text/strings";

export const getProductFeedbackSummaryTooltip = (
  productFeedbackNormalizeValue: number = 0,
  feedbackScoreValue: number,
  productFeedbackPercentageValue: number
): IRuleSummaryTooltip => {
  const percentage: number = productFeedbackPercentageValue / 100;
  const stars = percentage * 5;
  const isOk = productFeedbackNormalizeValue >= RULE_VALUE.RULE_VAL_8;
  const i18nData = {
    ProductRatingValue: displayNumber(stars, 1),
    ProductOrdersAmount: displayNumber(feedbackScoreValue)
  };

  const i18n = isOk ? "tooltip_seller_feedback_safe_orders_only" : "tooltip_seller_feedback_un_safe_orders_only";
  const type = isOk ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE;
  const description = i18n;
  return {
    description,
    type,
    ruleExplanation: "explanations_review_and_ratings",
    i18nExplanation: "explanations_review_and_ratings",
    i18n,
    i18nData
  };
};
