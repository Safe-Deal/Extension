import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm";

describe("Walmart - Rule product feedback algorithm", () => {
  describe("Positive scenario - great product 4.8 and up", () => {
    it("4.8 should pass on good rate", () => {
      const rating = 5;
      const globalRatingsAmount = 100;
      const recommendedValue = 100;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_10
      );
    });

    it("4.8 should pass on great rate", () => {
      const rating = 4.8;
      const globalRatingsAmount = 100;
      const recommendedValue = 100;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_10
      );
    });

    it("4.8 should pass on medium rate", () => {
      const rating = 4.8;
      const globalRatingsAmount = 100;
      const recommendedValue = 30;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.8 should pass on low rate", () => {
      const rating = 4.8;
      const globalRatingsAmount = 100;
      const recommendedValue = 20;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.8 should pass on so so rate", () => {
      const rating = 4.8;
      const globalRatingsAmount = 100;
      const recommendedValue = 15;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.8 should pass on very low rate", () => {
      const rating = 4.8;
      const globalRatingsAmount = 100;
      const recommendedValue = 5;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("valid product - medium amount", () => {
      const rating = 4.5;
      const globalRatingsAmount = 100;
      const recommendedValue = 50;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("valid product - low amount", () => {
      const rating = 4.3;
      const globalRatingsAmount = 100;
      const recommendedValue = 20;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("should return value of 10 for valid product - good amount", () => {
      const rating = 4.1;
      const globalRatingsAmount = 523;
      const recommendedValue = 388;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.8 should pass on good rate 1", () => {
      const rating = 5;
      const globalRatingsAmount = 100;
      const recommendedValue = 50;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("3.7 should  fail but with  1 rating | https://www.amazon.com/Finding-Dory-Penny-Bank-Combination/dp/B01FVYGVX4/", () => {
      const rating = 3.7;
      const globalRatingsAmount = 3;
      const recommendedValue = 3;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_1
      );
    });
  });

  describe("Positive scenario - medium product 4.1 and up", () => {
    const rating = 4.1;
    it("4.1 should fails on good rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 50;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("4.1 should pass on great rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 100;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.1 should pass on medium rate", () => {
      const globalRatingsAmount = 1000;
      const recommendedValue = 300;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });

    it("4.1 should pass on low rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 20;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("4.1 should pass on so so rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 15;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("4.1 should pass on very low rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 5;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });
  });

  describe("Positive scenario - bad product 3.8 and down", () => {
    const rating = 3.6;
    it("3.6 should fails on good rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 50;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_3
      );
    });

    it("3.6 should pass on great rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 100;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_5
      );
    });

    it("3.6 should pass on medium rate", () => {
      const globalRatingsAmount = 1000;
      const recommendedValue = 300;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_5
      );
    });

    it("3.6 should pass on low rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 20;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_3
      );
    });

    it("3.6 should pass on so so rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 15;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_3
      );
    });

    it("3.6 should pass on very low rate", () => {
      const globalRatingsAmount = 100;
      const recommendedValue = 5;
      expect(calculateProductFeedbackValueAlgorithm(rating, globalRatingsAmount, recommendedValue)).toBe(
        RULE_VALUE.RULE_VAL_3
      );
    });
  });

  describe("Negative scenario", () => {
    it("should return rule value 1 when there is no ratings, reviews and orders number", () => {
      expect(calculateProductFeedbackValueAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1);
    });

    it("should return value of 1 for invalid product - tiny amount", () => {
      const rating = 1;
      const reviews = 1;
      expect(calculateProductFeedbackValueAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1);
    });

    it("should return value of 4 when orders not exist", () => {
      const rating = 4.3;
      const reviews = 3;
      expect(calculateProductFeedbackValueAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1);
    });
  });
});
