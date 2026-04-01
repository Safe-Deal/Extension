import React from "react";
import { getSymbolClassByText } from "../../../../../../constants/icons";
import { PRICING_ITEM_DETAILS } from "../../../../../engine/logic/utils/const";
import { Explanation } from "../../../shared/Explanation";
import { PriceChart } from "../PriceHistory/PriceChart";
import { getReliabilityProductsSummaryTooltip } from "../../../../../../constants/rule-reliability-messages";

interface MetricBadge {
  label: string;
  value: string;
  numericValue: number | null;
  type: "stars" | "orders" | "percent" | "generic";
}

// Extracts key:value pairs like "Stars: 4.9", "Orders: 149" from a sentence
function extractMetricBadges(text: string): MetricBadge[] {
  const badges: MetricBadge[] = [];
  const keyValuePattern = /(\w+):\s*([\d.]+)/g;
  let match;
  while ((match = keyValuePattern.exec(text)) !== null) {
    const label = match[1];
    const value = match[2];
    const numericValue = parseFloat(value);
    const lowerLabel = label.toLowerCase();
    const type = lowerLabel === "stars" ? "stars" : lowerLabel === "orders" ? "orders" : "generic";
    badges.push({ label, value, numericValue, type });
  }
  return badges;
}

// Strips "Key: value" pairs from sentence, cleans up trailing punctuation
function getVerdictText(text: string, badges: MetricBadge[]): string {
  let result = text;
  for (const badge of badges) {
    result = result.replace(new RegExp(",?\\s*" + badge.label + ":\\s*[\\d.]+", "g"), "");
  }
  return result.replace(/[,.]?\s*$/, ".").trim();
}

// Returns star rating color: green ≥4.5, yellow ≥3.5, red below
function getStarsColor(value: number): string {
  if (value >= 4.5) return "#16a34a";
  if (value >= 3.5) return "#d97706";
  return "#dc2626";
}

function StarRating({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const color = getStarsColor(value);
  return (
    <span className="sd-rules__star-rating" style={{ color }}>
      {"★".repeat(fullStars)}
      {hasHalf ? "½" : ""}
      <span style={{ opacity: 0.25 }}>{"★".repeat(emptyStars)}</span>
    </span>
  );
}

interface IRulesProps {
  rules: any;
  bg: string;
}

export function Rules({ rules, bg }: IRulesProps) {

  const reasons = rules?.filter((r) => r && r.name !== PRICING_ITEM_DETAILS);
  const listItems = [];
  const pricing = rules?.find((r) => r.name === PRICING_ITEM_DETAILS);
  const explanationEntities = getReliabilityProductsSummaryTooltip(reasons);
  explanationEntities.map((explanation) => {
    const { ruleExplanation, reliabilityMessage } = explanation;
    const reliabilityClass = getSymbolClassByText(reliabilityMessage);
    listItems.push({
      title: reliabilityMessage,
      explanation: ruleExplanation,
      className: reliabilityClass
    });
  });

  if (pricing && pricing.isValidRule) {
    const explanationPricing = getReliabilityProductsSummaryTooltip([pricing])[0];
    const { ruleExplanation, reliabilityMessage } = explanationPricing;
    const reliabilityClass = getSymbolClassByText(reliabilityMessage);
    listItems.push({
      title: reliabilityMessage,
      explanation: ruleExplanation,
      className: reliabilityClass
    });
  }

  return (
    <div className="sd-rules">
      <ul className="sd-rules__explanation">
        {listItems.map((item) => {
          const spaceIndex = item.title.indexOf(" ");
          const rawText = item.title.substring(spaceIndex + 1);
          const badges = extractMetricBadges(rawText);
          const verdictText = badges.length > 0 ? getVerdictText(rawText, badges) : rawText;
          return (
            <li key={item.title} className="sd-rules__explanation__reason" title={item.title}>
              <div className={`sd-reason ${item.className}`}>
                <span className={`${item.className}-bullet sd-rules__explanation__reason__bullet`} />
                <span className={`${item.className}-title sd-rules__explanation__reason__title`}>
                  {verdictText}
                </span>
                {badges.length > 0 && (
                  <div className="sd-rules__explanation__reason__badges">
                    {badges.map((badge) => {
                      if (badge.type === "stars" && badge.numericValue !== null) {
                        const color = getStarsColor(badge.numericValue);
                        return (
                          <span
                            key={badge.label}
                            className="sd-rules__explanation__reason__badge sd-rules__explanation__reason__badge--stars"
                            style={{ backgroundColor: color + "1a", color }}
                          >
                            <StarRating value={badge.numericValue} />
                            <span className="sd-rules__explanation__reason__badge__value">{badge.value}</span>
                          </span>
                        );
                      }
                      return (
                        <span
                          key={badge.label}
                          className={`sd-rules__explanation__reason__badge ${item.className}-badge`}
                        >
                          <span className="sd-rules__explanation__reason__badge__label">{badge.label}</span>
                          <span className="sd-rules__explanation__reason__badge__value">{badge.value}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                <Explanation text={item.explanation} />
              </div>
            </li>
          );
        })}
      </ul>
      <PriceChart bg={bg} prices={pricing?.dataset?.price} currency={pricing?.dataset?.currency} />
    </div>
  );
}
