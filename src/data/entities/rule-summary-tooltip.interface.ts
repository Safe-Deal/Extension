import { RuleSummaryTooltipType } from "./rule-summary-tooltip-type-enum"

export interface IRuleSummaryTooltip {
  description: string;
  type: RuleSummaryTooltipType;
  i18n: string;
  i18nData?: object;
  ruleExplanation: string;
  i18nExplanation: string;
  data?: object;
}
