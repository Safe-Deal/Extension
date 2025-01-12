import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { BUYER, DAY, isContainedIn, NO } from "../../../../../../utils/multilang/languages";
import { isFreeShipping } from "../free-shipping/rule-free-shipping-algorithm";

const noReturnPolicy = (returnPolicyValue: string): boolean => isContainedIn(returnPolicyValue, NO);

const paidReturnPolicy = (returnPolicyValue: string): boolean => isContainedIn(returnPolicyValue, BUYER);

const timedReturnPolicy = (returnPolicyValue: string): boolean =>
  isContainedIn(returnPolicyValue, DAY) && !isFreeShipping(returnPolicyValue);

export const calculateReturnPolicyValueAlgorithm = (text: string): number => {
  if (!text) {
    return BONUS_POINTS.NONE;
  }

  const normalizeValue: number = BONUS_POINTS.NONE;

  text = String(text)?.toLowerCase();
  if (isFreeShipping(text)) {
    return BONUS_POINTS.TEN;
  }

  if (noReturnPolicy(text)) {
    return BONUS_POINTS.NEGATIVE_SMALL;
  }

  if (paidReturnPolicy(text) && !noReturnPolicy(text)) {
    return BONUS_POINTS.THREE;
  }

  if (timedReturnPolicy(text)) {
    return BONUS_POINTS.SEVEN;
  }

  return normalizeValue;
};
