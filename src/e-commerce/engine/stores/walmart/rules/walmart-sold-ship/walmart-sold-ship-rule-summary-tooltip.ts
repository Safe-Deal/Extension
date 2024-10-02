import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

const getRuleWalmartSoldShipSummaryTooltip = (soldAndShipByWalmart: boolean): IRuleSummaryTooltip => {
  const i18n: string = soldAndShipByWalmart ? "tooltip_walmart_sold_ship_safe" : RULE_IS_HIDDEN;
  const type: RuleSummaryTooltipType = soldAndShipByWalmart
    ? RuleSummaryTooltipType.SAFE
    : RuleSummaryTooltipType.UNSAFE;
  const i18nExplanation = soldAndShipByWalmart ? "explanations_walmart_sold_ship" : RULE_IS_HIDDEN;
  const description = i18n;
  return {
    description,
    type,
    ruleExplanation: i18nExplanation,
    i18nExplanation,
    i18n
  };
};

export { getRuleWalmartSoldShipSummaryTooltip };
