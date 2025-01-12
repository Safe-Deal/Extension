import { RULE_VALUE } from "../../../../../../constants/rule-value";

export const calculateProductFeedbackValueAlgorithm = (
  feedbacksAmount: number = 0,
  feedbackRatingSumPercentage: number = 0
): number => {
  // Base case - no feedback or very low rating
  if (feedbacksAmount === 0 || feedbackRatingSumPercentage < 80) {
    return RULE_VALUE.RULE_VAL_1;
  }

  // Excellent sellers with high volume and high ratings
  if (feedbacksAmount >= 5000) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_10;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_9;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_8;
    return RULE_VALUE.RULE_VAL_7;
  }

  // Very established sellers
  if (feedbacksAmount >= 1000) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_9;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_8;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_7;
    return RULE_VALUE.RULE_VAL_6;
  }

  // Established sellers
  if (feedbacksAmount >= 500) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_8;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_7;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_6;
    return RULE_VALUE.RULE_VAL_5;
  }

  // Growing sellers
  if (feedbacksAmount >= 200) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_8;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_7;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_6;
    return RULE_VALUE.RULE_VAL_5;
  }

  // New but active sellers
  if (feedbacksAmount >= 50) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_7;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_6;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_5;
    return RULE_VALUE.RULE_VAL_4;
  }

  // Very new sellers
  if (feedbacksAmount >= 10) {
    if (feedbackRatingSumPercentage >= 98) return RULE_VALUE.RULE_VAL_6;
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_5;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_4;
    return RULE_VALUE.RULE_VAL_3;
  }

  // Beginners
  if (feedbacksAmount >= 1) {
    if (feedbackRatingSumPercentage >= 95) return RULE_VALUE.RULE_VAL_3;
    if (feedbackRatingSumPercentage >= 90) return RULE_VALUE.RULE_VAL_2;
  }

  return RULE_VALUE.RULE_VAL_1;
};
