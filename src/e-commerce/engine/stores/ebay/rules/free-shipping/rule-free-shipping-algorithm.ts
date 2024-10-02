import ruleBonusValue from "../../../../../../constants/rule-bonus-value";
import { FREE_SHIPPING_TEXT, isContainedIn } from "../../../../../../utils/multilang/languages";

export const isFreeShipping = (freeShippingTxt: string) => {
  const text = freeShippingTxt?.toLowerCase();
  const result = isContainedIn(text, FREE_SHIPPING_TEXT);
  return result;
};

export const calculateFreeShippingValueAlgorithm = (input: string[]): number => {
  for (const text of input) {
    if (isFreeShipping(text)) {
      return ruleBonusValue.EIGHT;
    }
  }

  return ruleBonusValue.NONE;
};
