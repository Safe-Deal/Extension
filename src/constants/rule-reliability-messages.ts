import { debug } from "../utils/analytics/logger";
import { RuleSummaryTooltipType } from "../data/entities/rule-summary-tooltip-type-enum";
import { IRule } from "../data/entities/rule.interface";
import { FAILED_SYMBOL, getSymbolClassByText, PASSED_SYMBOL } from "./icons";
import { t } from "./messages";

export const RULE_IS_HIDDEN = "empty";

export const getReliabilityProductsSummaryTooltip = (rules: IRule[] = []) => {
  const rulesWithValidTooltip: IRule[] = rules.filter(
    (rule: IRule) => rule?.isValidRule && rule?.tooltipSummary?.description
  );

  rulesWithValidTooltip.forEach((rule: IRule) => {
    if (!rule.tooltipSummary.description) {
      debug(`Rule ${rule.name} has no tooltip summary.`);
      rule.tooltipSummary.description = rule.tooltipSummary.i18n;
    }
  });

  const reliabilityEntities = rulesWithValidTooltip
    .filter((rule: IRule) => rule.tooltipSummary.description !== RULE_IS_HIDDEN)
    .sort((a: IRule, b: IRule) => {
      if (a.tooltipSummary.type === b.tooltipSummary.type) {
        return 0;
      }
      return a.tooltipSummary.type === RuleSummaryTooltipType.SAFE ? -1 : 1;
    })
    .map((rule: IRule) => ({
      reliabilityMessage: `${
        rule.tooltipSummary.type === RuleSummaryTooltipType.SAFE ? PASSED_SYMBOL : FAILED_SYMBOL
      } ${rule.tooltipSummary.description}`,
      ruleExplanation: rule.tooltipSummary.ruleExplanation
    }));

  return reliabilityEntities;
};

export const getReliabilityProductsSummaryTooltipMessage = (rules: IRule[] = []) => {
  const reliabilityEntities = getReliabilityProductsSummaryTooltip(rules);
  const tooltip = reliabilityEntities
    .map((item) => {
      const className = getSymbolClassByText(item.reliabilityMessage);
      let color;
      if (className === "sd-reason-good") {
        color = "#00a660";
      } else if (className === "sd-reason-bad") {
        color = "red";
      } else {
        color = "inherit";
      }
      return `<div class="${className}"><span style="color: ${color};">${item.reliabilityMessage.charAt(0)}</span>${item.reliabilityMessage.slice(1)}</div>`;
    })
    .join("");

  return tooltip.trim() ? tooltip : t("no_data");
};
