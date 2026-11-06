import { extractMetricBadges, getVerdictText } from "./rule-metrics";

const parse = (text: string) => {
  const badges = extractMetricBadges(text);
  return { badges, verdict: getVerdictText(text, badges) };
};

describe("rule metrics", () => {
  it("keeps plain numeric orders and strips them from the verdict", () => {
    const { badges, verdict } = parse("The shop is highly rated. Stars: 4.9, Orders: 75");

    expect(badges.map((badge) => [badge.label, badge.value])).toEqual([
      ["Stars", "4.9"],
      ["Orders", "75"]
    ]);
    expect(verdict).toBe("The shop is highly rated.");
  });

  test.each([
    ["75k", 75000],
    ["1.2M", 1200000]
  ])("keeps the %s suffix in the orders badge and out of the verdict", (orders, expectedNumeric) => {
    const { badges, verdict } = parse(`The shop is highly rated. Stars: 4.9, Orders: ${orders}`);

    const ordersBadge = badges.find((badge) => badge.type === "orders");
    expect(ordersBadge?.value).toBe(orders);
    expect(ordersBadge?.numericValue).toBe(expectedNumeric);
    expect(verdict).toBe("The shop is highly rated.");
  });

  it("strips suffixed values for generic keys", () => {
    const { verdict } = parse("Reviews are extremely positive. Stars: 4.7, Orders: 10k, Reviews: 2.5k");

    expect(verdict).toBe("Reviews are extremely positive.");
  });
});
