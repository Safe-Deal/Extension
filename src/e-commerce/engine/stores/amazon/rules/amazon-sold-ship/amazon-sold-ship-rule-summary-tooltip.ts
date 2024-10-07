import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

const getRuleAmazonSoldShipSummaryTooltip = (
  soldAndShipByAmazon: boolean,
  soldOrShipByAmazonValue: boolean
): IRuleSummaryTooltip => {
  const i18n: string = soldAndShipByAmazon
    ? "tooltip_amazon_sold_ship_safe"
    : soldOrShipByAmazonValue
      ? "tooltip_amazon_sold_or_ship_safe"
      : RULE_IS_HIDDEN;

  const type: RuleSummaryTooltipType =
    soldAndShipByAmazon || soldOrShipByAmazonValue ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE;

  const ruleExplanation = soldAndShipByAmazon
    ? "explanations_amazon_sold_ship"
    : soldOrShipByAmazonValue
      ? "explanations_amazon_sold_or_ship"
      : "";
  const i18nExplanation = soldAndShipByAmazon
    ? "explanations_amazon_sold_ship"
    : soldOrShipByAmazonValue
      ? "explanations_amazon_sold_or_ship"
      : "";

  const description = i18n;
  return {
    description,
    type,
    ruleExplanation,
    i18nExplanation,
    i18n
  };
};

export { getRuleAmazonSoldShipSummaryTooltip };
