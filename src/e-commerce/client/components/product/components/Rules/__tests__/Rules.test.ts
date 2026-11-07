import { extractMetricBadges, getVerdictText } from "../Rules";

describe("Rules metric badges", () => {
  it("keeps the thousands suffix on the orders badge and out of the verdict", () => {
    const text = "The shop is highly rated. Stars: 5.0, Orders: 136k";
    const badges = extractMetricBadges(text);

    expect(badges.map(({ label, value }) => ({ label, value }))).toEqual([
      { label: "Stars", value: "5.0" },
      { label: "Orders", value: "136K~" }
    ]);
    expect(getVerdictText(text, badges)).toBe("The shop is highly rated.");
  });

  it("keeps the millions suffix on the orders badge", () => {
    const text = "The shop is poorly rated. Stars: 3.2, Orders: 2M";
    const badges = extractMetricBadges(text);

    expect(badges.find((badge) => badge.label === "Orders")?.value).toBe("2M~");
    expect(getVerdictText(text, badges)).toBe("The shop is poorly rated.");
  });

  it("marks exact orders approximate and leaves stars unchanged", () => {
    const text = "The shop is highly rated. Stars: 4.8, Orders: 136";
    const badges = extractMetricBadges(text);

    expect(badges.find((badge) => badge.label === "Orders")?.value).toBe("136~");
    expect(badges.find((badge) => badge.label === "Stars")?.value).toBe("4.8");
    expect(getVerdictText(text, badges)).toBe("The shop is highly rated.");
  });
});
