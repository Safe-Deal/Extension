import { RULE_IS_HIDDEN } from "../../../../../../constants/rule-reliability-messages";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { getRuleAmazonSoldShipSummaryTooltip } from "./amazon-sold-ship-rule-summary-tooltip";

describe("Rule: Amazon Sold And Ship - Tooltip", () => {
  describe("Positive scenario", () => {
    it("should return sold and ship when item is both amazon brand", () => {
      const soldShipByAmazon = true;
      const soldOrShipByAmazonValue = true;
      const description = `tooltip_amazon_sold_ship_safe`;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "explanations_amazon_sold_ship",
        i18nExplanation: "explanations_amazon_sold_ship",
        i18n: "tooltip_amazon_sold_ship_safe"
      };
      const toolTip = getRuleAmazonSoldShipSummaryTooltip(soldShipByAmazon, soldOrShipByAmazonValue);
      expect(toolTip).toEqual(excepted);
    });

    it("should return sold or ship when item is one of amazon brand", () => {
      const soldShipByAmazon = false;
      const soldOrShipByAmazonValue = true;
      const description = `tooltip_amazon_sold_or_ship_safe`;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "explanations_amazon_sold_or_ship",
        i18nExplanation: "explanations_amazon_sold_or_ship",
        i18n: "tooltip_amazon_sold_or_ship_safe"
      };
      const toolTip = getRuleAmazonSoldShipSummaryTooltip(soldShipByAmazon, soldOrShipByAmazonValue);
      expect(toolTip).toEqual(excepted);
    });

    it("should return unsafe with both NOT by amazon which mean no extra bonus value", () => {
      const soldShipByAmazon = false;
      const soldOrShipByAmazonValue = false;
      const description = RULE_IS_HIDDEN;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.UNSAFE,
        ruleExplanation: "",
        i18nExplanation: "",
        i18n: RULE_IS_HIDDEN
      };
      const toolTip = getRuleAmazonSoldShipSummaryTooltip(soldShipByAmazon, soldOrShipByAmazonValue);
      expect(toolTip).toEqual(excepted);
    });
  });
});
