import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IDiffDate } from "../../../../../../data/entities/diff-date.interface";
import { selectFromRange } from "../../../../../../utils/general/general";

const OPEN_YEAR_TABLE = [
  { start: 0, end: 1, value: BONUS_POINTS.NEGATIVE_MEDIUM },
  { start: 2, end: 2, value: BONUS_POINTS.THREE },
  { start: 3, end: 3, value: BONUS_POINTS.SEVEN },
  { start: 4, end: 6, value: BONUS_POINTS.TWELVE },
  { start: 7, end: 50, value: BONUS_POINTS.FIFTEEN }
];

export const calculateShopOpenYearValueAlgorithm = (diffDate: IDiffDate): number => {
  const shopOpenedYearValue = diffDate.roundYearDiff;
  const normalizeValue = selectFromRange(OPEN_YEAR_TABLE, shopOpenedYearValue);
  if (Number.isNaN(normalizeValue)) {
    return BONUS_POINTS.NONE;
  }

  return normalizeValue;
};
