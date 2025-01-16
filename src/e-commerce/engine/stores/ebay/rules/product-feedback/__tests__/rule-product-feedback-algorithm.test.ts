import { RULE_VALUE } from "../../../../../../../constants/rule-value";
import { calculateProductFeedbackValueAlgorithm } from "../rule-product-feedback-algorithm";

describe("Ebay - Rule product feedback algorithm", () => {
  describe("Positive scenario", () => {
    it("should return value 8", () => {
      const feedbackAmount = 92;
      const feedbackRatingSumPercentage = 99;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_7
      );
    });
    it("should fail on low amount of purchases and poor feedback", () => {
      const feedbackAmount = 92;
      const feedbackRatingSumPercentage = 90;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_5
      );
    });

    it("should fail on low amount of purchases and poor feedback 1", () => {
      const feedbackAmount = 40;
      const feedbackRatingSumPercentage = 91.7;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_4
      );
    });

    it("should fail on low amount of purchases and poor feedback 2", () => {
      const feedbackAmount = 40000000;
      const feedbackRatingSumPercentage = 91.7;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_8
      );
    });
  });

  describe("Negative scenario", () => {
    it("should return rule value 1 when there is no ratings, feedbackRatingSumPercentage and orders number", () => {
      expect(calculateProductFeedbackValueAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1);
    });

    it("should return value of 1 for invalid product - tiny amount", () => {
      const feedbackAmount = 1;
      const feedbackRatingSumPercentage = 1;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_1
      );
    });

    it("should return value of 4 when orders not exist", () => {
      const feedbackAmount = 4.3;
      const feedbackRatingSumPercentage = 3;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_1
      );
    });

    it("should return passing from perfect feedback not so hight sales", () => {
      const feedbackAmount = 45;
      const feedbackRatingSumPercentage = 100;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });

    it("should return passing from perfect feedback not so low sales", () => {
      const feedbackAmount = 25;
      const feedbackRatingSumPercentage = 100;
      expect(calculateProductFeedbackValueAlgorithm(feedbackAmount, feedbackRatingSumPercentage)).toBe(
        RULE_VALUE.RULE_VAL_6
      );
    });
  });
});
