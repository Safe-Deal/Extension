import { IBonusRule } from "./bonus.interface"
import { IRuleSummaryTooltip } from "./rule-summary-tooltip.interface"

export const NOT_VALID_RULE_RESPONSE = {
	isValidRule: false,
	value: 0,
	weight: 0
}

export interface IRuleResult {
  name: string;
  value: any;
  weight: any;
  bonus?: IBonusRule;
  isValidRule: boolean;
  tooltipSummary?: IRuleSummaryTooltip;
  dataset?: any[];
}
