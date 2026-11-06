export interface MetricBadge {
  label: string;
  value: string;
  numericValue: number | null;
  type: "stars" | "orders" | "percent" | "generic";
}

export function extractMetricBadges(text: string): MetricBadge[] {
  const badges: MetricBadge[] = [];

  const keyValuePattern = /(\w+):\s*([\d.]+)/g;
  let match = keyValuePattern.exec(text);
  while (match !== null) {
    const label = match[1];
    const value = match[2];
    const numericValue = parseFloat(value);
    const lowerLabel = label.toLowerCase();
    const type = lowerLabel === "stars" ? "stars" : lowerLabel === "orders" ? "orders" : "generic";
    badges.push({ label, value, numericValue, type });
    match = keyValuePattern.exec(text);
  }

  const percentPattern = /,\s*([\d.]+)%/;
  const percentMatch = text.match(percentPattern);
  if (percentMatch) {
    badges.push({
      label: "percent",
      value: `${percentMatch[1]}%`,
      numericValue: parseFloat(percentMatch[1]),
      type: "percent"
    });
  }

  const unitPattern = /(-?[\d]+)\s+(days?|years?|months?)/gi;
  let unitMatch = unitPattern.exec(text);
  while (unitMatch !== null) {
    const num = parseInt(unitMatch[1], 10);
    const unit = unitMatch[2].toLowerCase();
    if (num > 0) {
      badges.push({
        label: unit,
        value: `${unitMatch[1]} ${unitMatch[2]}`,
        numericValue: num,
        type: "generic"
      });
    }
    unitMatch = unitPattern.exec(text);
  }

  return badges;
}

export function getVerdictText(text: string, badges: MetricBadge[]): string {
  let result = text;
  for (const badge of badges) {
    if (badge.type === "percent") {
      result = result.replace(/,\s*[\d.]+%/, "");
    } else if (badge.label.match(/^(days?|years?|months?)$/i)) {
      result = result.replace(new RegExp(`,?\\s*-?\\d+\\s+${badge.label}`, "gi"), "");
    } else {
      result = result.replace(new RegExp(`,?\\s*${badge.label}:\\s*[\\d.]+`, "g"), "");
    }
  }
  return result.replace(/[,.]?\s*$/, ".").trim();
}
