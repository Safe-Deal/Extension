import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IDiffDate } from "../../../../../../data/entities/diff-date.interface";
import { RuleSummaryTooltipType } from "../../../../../../data/entities/rule-summary-tooltip-type-enum";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";

export const getRuleShopOpenYearSummaryTooltip = (
  shopOpenYearNormalizeValue: number = 0,
  diffDate: IDiffDate
): IRuleSummaryTooltip => {
  const years = diffDate.roundYearDiff;
  const isSafe = shopOpenYearNormalizeValue >= BONUS_POINTS.THREE;
  const i18nExplanation = "explanations_store_age";
  const ruleExplanation = i18nExplanation;

  let shopOpenedYearValue;
  let yearsInBusinessIndicator = "";

  if (years === 0) {
    yearsInBusinessIndicator = "less_than_a_year";
    shopOpenedYearValue = "";
  } else if (years === 1) {
    yearsInBusinessIndicator = "year_label";
    shopOpenedYearValue = "";
  } else {
    yearsInBusinessIndicator = years > 1 ? "years_label" : "year_label";
    shopOpenedYearValue = years;
  }

  const i18nData = {
    yearsInBusinessIndicator: { i18n: yearsInBusinessIndicator },
    shopOpenedYearValue
  };
  const i18n = isSafe ? "tooltip_shop_open_year_safe" : "tooltip_shop_open_year_un_safe";

  const type: RuleSummaryTooltipType = isSafe ? RuleSummaryTooltipType.SAFE : RuleSummaryTooltipType.UNSAFE;
  const description = i18n;

  return {
    description,
    type,
    ruleExplanation,
    i18nExplanation,
    i18n,
    i18nData
  };
};
