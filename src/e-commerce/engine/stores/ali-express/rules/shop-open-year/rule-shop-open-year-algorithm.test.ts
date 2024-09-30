import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IDiffDate } from "../../../../../../data/entities/diff-date.interface";
import { calculateShopOpenYearValueAlgorithm } from "./rule-shop-open-year-algorithm";

const getDiff = (years): IDiffDate => ({ yearDiff: 0, monthDiff: 0, dayDiff: 0, roundYearDiff: years });

it("calculateShopOpenYearValueAlgorhtim", () => {
  expect(calculateShopOpenYearValueAlgorithm(getDiff(undefined))).toBe(0);
  expect(calculateShopOpenYearValueAlgorithm(getDiff(1))).toBe(BONUS_POINTS.NEGATIVE_MEDIUM);

  expect(calculateShopOpenYearValueAlgorithm(getDiff(2))).toBe(BONUS_POINTS.THREE);

  expect(calculateShopOpenYearValueAlgorithm(getDiff(3))).toBe(BONUS_POINTS.SEVEN);

  expect(calculateShopOpenYearValueAlgorithm(getDiff(4))).toBe(BONUS_POINTS.TWELVE);
  expect(calculateShopOpenYearValueAlgorithm(getDiff(7))).toBe(BONUS_POINTS.FIFTEEN);
  expect(calculateShopOpenYearValueAlgorithm(getDiff(14))).toBe(BONUS_POINTS.FIFTEEN);
});
