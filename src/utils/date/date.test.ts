import { getDiffInSeconds, getUtcTimestamp, isToday } from "./date";

describe("DateUtils", () => {
  describe("isToday", () => {
    it("returns true if the given date is today", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("returns false if the given date is not today", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe("getUtcTimestamp", () => {
    it("returns a number", () => {
      expect(typeof getUtcTimestamp()).toBe("number");
    });

    it("returns the current UTC timestamp", () => {
      const now = Date.now();
      expect(getUtcTimestamp()).toBeCloseTo(now, -3);
    });
  });

  describe("getDiffInSeconds", () => {
    it("returns the difference in seconds between two dates", () => {
      const date1 = new Date(2022, 0, 1, 0, 0, 0);
      const date2 = new Date(2022, 0, 1, 0, 0, 10);
      expect(getDiffInSeconds(date1, date2)).toBe(10);
    });

    it("returns the absolute difference in seconds", () => {
      const date1 = new Date(2022, 0, 1, 0, 0, 0);
      const date2 = new Date(2022, 0, 1, 0, 0, 10);
      expect(getDiffInSeconds(date2, date1)).toBe(10);
    });
  });
});
