import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

export const getRuleTopSellerSummaryTooltip = (
  isSoldByBrandSeller: boolean = false,
  soldByBrand = ""
): IRuleSummaryTooltip => {
  const i18n: string = isSoldByBrandSeller ? "tooltip_sold_by_brand" : RULE_IS_HIDDEN;
  // const description: string = i18n;
  const description: string = soldByBrand;
  const type: RuleSummaryTooltipType = isSoldByBrandSeller
    ? RuleSummaryTooltipType.SAFE
    : RuleSummaryTooltipType.UNSAFE;
  const i18nExplanation = "explanations_ebay_top_rated";
  return {
    description,
    type,
    ruleExplanation: i18nExplanation,
    i18nExplanation,
    i18n
  };
};
