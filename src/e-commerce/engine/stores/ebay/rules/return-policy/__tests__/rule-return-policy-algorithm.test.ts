import BONUS_POINTS from "../../../../../../../constants/rule-bonus-value";
import { calculateReturnPolicyValueAlgorhtim } from "../rule-return-policy-algorithm";

it("calculateShopOpenYearValueAlgorhtim", () => {
  expect(calculateReturnPolicyValueAlgorhtim(undefined)).toBe(0);
  expect(calculateReturnPolicyValueAlgorhtim("buyer pays")).toBe(BONUS_POINTS.NONE);
  expect(calculateReturnPolicyValueAlgorhtim("20 days")).toBe(BONUS_POINTS.SEVEN);
  expect(calculateReturnPolicyValueAlgorhtim("Free 30 day returns")).toBe(BONUS_POINTS.TEN);
  expect(calculateReturnPolicyValueAlgorhtim("not accept returns")).toBe(BONUS_POINTS.NEGATIVE_SMALL);
});
