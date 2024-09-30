import { RULE_VALUE } from "../../../../../../constants/rule-value";

export const calculateProductFeedbackValueAlgorithm = (
  feedbacksAmount: number = 0,
  feedbackRatingSumPercentage: number = 0
): number => {
  if (feedbacksAmount >= 45) {
    if (feedbackRatingSumPercentage >= 99) {
      return RULE_VALUE.RULE_VAL_8;
    }

    if (feedbacksAmount >= 220 && feedbackRatingSumPercentage >= 97) {
      return RULE_VALUE.RULE_VAL_8;
    }

    if (feedbacksAmount >= 1000 && feedbackRatingSumPercentage >= 96) {
      return RULE_VALUE.RULE_VAL_8;
    }

    if (feedbacksAmount >= 5000 && feedbackRatingSumPercentage >= 95) {
      return RULE_VALUE.RULE_VAL_8;
    }

    if (feedbacksAmount >= 10000 && feedbackRatingSumPercentage >= 93) {
      return RULE_VALUE.RULE_VAL_8;
    }

    return RULE_VALUE.RULE_VAL_1;
  }
  return RULE_VALUE.RULE_VAL_1;
};
