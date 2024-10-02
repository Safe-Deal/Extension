import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

const isProductDeliveryGood = (deliveryNormalizeValue: number): boolean =>
  deliveryNormalizeValue >= RULE_VALUE.RULE_VAL_5;

export const getDeliverySummaryTooltip = (
  deliveryNormalizeValue: number = 0,
  days: number = null
): IRuleSummaryTooltip => {
  const i18nData = { daysToDeliver: days };
  let i18n: string = "tooltip_delivery_un_safe";
  let type = RuleSummaryTooltipType.UNSAFE;
  if (isProductDeliveryGood(deliveryNormalizeValue)) {
    i18n = "tooltip_delivery_safe";
    type = RuleSummaryTooltipType.SAFE;
  }

  const ruleExplanation = "explanations_ebay_delivery_time";
  const description = i18n;
  return {
    description,
    type,
    ruleExplanation,
    i18nExplanation: "explanations_ebay_delivery_time",
    i18n,
    i18nData
  };
};
