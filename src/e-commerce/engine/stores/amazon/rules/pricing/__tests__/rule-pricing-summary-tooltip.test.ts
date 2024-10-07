import { RuleSummaryTooltipType } from "../../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../../data/entities/rule-summary-tooltip.interface";
import { getProductPricingSummaryTooltip } from "../rule-pricing-summary-tooltip";

describe("Rule: Pricing - Tooltip", () => {
  describe("Positive scenario", () => {
    it("should return Safe and excellent deal", () => {
      const mock = {
        normalizeValue: 6,
        ratio: 2
      };
      const description = `tooltip_product_pricing_type_excellent`;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "explanations_price_history",
        i18nExplanation: "explanations_price_history",
        i18n: "tooltip_product_pricing_type_excellent",
        i18nData: { priceDifVsAverage: "2" }
      };
      const toolTip = getProductPricingSummaryTooltip(mock, 2);
      expect(toolTip).toEqual(excepted);
    });

    it("should return Safe and Good Deal", () => {
      const mock = {
        normalizeValue: 3,
        ratio: 10
      };
      const description = `tooltip_product_pricing_type_average_lower`;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "explanations_price_history",
        i18nExplanation: "explanations_price_history",
        i18n: "tooltip_product_pricing_type_average_lower",
        i18nData: { priceDifVsAverage: "10" }
      };
      const toolTip = getProductPricingSummaryTooltip(mock, 2);
      expect(toolTip).toEqual(excepted);
    });

    it("should return Un Safe and Expensive Deal", () => {
      const mock = {
        normalizeValue: 0,
        ratio: 10
      };
      const description = `tooltip_product_pricing_type_expensive`;
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.UNSAFE,
        ruleExplanation: "explanations_price_history",
        i18nExplanation: "explanations_price_history",
        i18n: "tooltip_product_pricing_type_expensive",
        i18nData: { priceDifVsAverage: "10" }
      };
      const toolTip = getProductPricingSummaryTooltip(mock, 2);
      expect(toolTip).toEqual(excepted);
    });

    it("should return safe and average price", () => {
      const mock = {
        normalizeValue: 0,
        ratio: 0
      };
      const description = "tooltip_product_pricing_average";
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "explanations_price_history",
        i18nExplanation: "explanations_price_history",
        i18n: "tooltip_product_pricing_average"
      };
      const toolTip = getProductPricingSummaryTooltip(mock, 2);
      expect(toolTip).toEqual(excepted);
    });

    it("should return nothing if no value", () => {
      const mock = null;
      const description = "tooltip_product_pricing_average";
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.SAFE,
        ruleExplanation: "",
        i18nExplanation: "",
        i18n: "tooltip_product_pricing_average"
      };
      const toolTip = getProductPricingSummaryTooltip(mock, 2);
      expect(toolTip).toEqual(null);
    });

    it("should return nothing if no current price", () => {
      const mock = {
        normalizeValue: 6,
        ratio: 2
      };
      const description = "tooltip_product_pricing_no_price_available";
      const excepted: IRuleSummaryTooltip = {
        description,
        type: RuleSummaryTooltipType.UNSAFE,
        ruleExplanation: "explanations_price_history",
        i18nExplanation: "tooltip_product_pricing_no_price_available",
        i18n: "tooltip_product_pricing_no_price_available"
      };
      const toolTip = getProductPricingSummaryTooltip(mock, null);
      expect(toolTip).toEqual(excepted);
    });
  });
});
