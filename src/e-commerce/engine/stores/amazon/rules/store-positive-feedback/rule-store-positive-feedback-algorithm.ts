import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { selectFromRange } from "../../../../../../utils/general/general";

const STORE_FEEDBACK_TABLE = [
  { start: 0, end: 75, value: RULE_VALUE.RULE_VAL_NEGATIVE_CRITICAL },
  { start: 76, end: 90, value: RULE_VALUE.RULE_VAL_2 },
  { start: 91, end: 92, value: RULE_VALUE.RULE_VAL_6 },
  { start: 93, end: 95, value: RULE_VALUE.RULE_VAL_8 },
  { start: 96, end: 98, value: RULE_VALUE.RULE_VAL_9 },
  { start: 99, end: 101, value: RULE_VALUE.RULE_VAL_10 }
];

export const calculateStorePositiveFeedbackValueAlgorithm = (storePositiveRateValue: number = 0): number => {
  const normalizeValue = selectFromRange(STORE_FEEDBACK_TABLE, storePositiveRateValue);
  if (Number.isNaN(normalizeValue)) {
    return null;
  }

  return normalizeValue;
};
