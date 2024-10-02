import { IBonusRule } from "./bonus.interface"
import { IRuleSummaryTooltip } from "./rule-summary-tooltip.interface"

export interface IRule {
  name?: string;
  value: number;
  weight: number;
  bonus?: IBonusRule;
  isValidRule: boolean;
  tooltipSummary?: IRuleSummaryTooltip;
  dataset?: any;
}
