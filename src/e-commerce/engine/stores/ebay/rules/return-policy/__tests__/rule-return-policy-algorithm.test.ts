import BONUS_POINTS from "../../../../../../../constants/rule-bonus-value";
import { calculateReturnPolicyValueAlgorithm } from "../rule-return-policy-algorithm";

it("calculateShopOpenYearValueAlgorhtim", () => {
  expect(calculateReturnPolicyValueAlgorithm(undefined)).toBe(0);
  expect(calculateReturnPolicyValueAlgorithm("buyer pays")).toBe(BONUS_POINTS.THREE);
  expect(calculateReturnPolicyValueAlgorithm("20 days")).toBe(BONUS_POINTS.SEVEN);
  expect(calculateReturnPolicyValueAlgorithm("Free 30 day returns")).toBe(BONUS_POINTS.TEN);
  expect(calculateReturnPolicyValueAlgorithm("not accept returns")).toBe(BONUS_POINTS.NEGATIVE_SMALL);
});
