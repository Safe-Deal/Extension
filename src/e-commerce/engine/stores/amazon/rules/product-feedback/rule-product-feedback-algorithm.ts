import { selectFromRange } from "../../../../../../utils/general/general";
import { calculateAmazonItemDetailsFeedbackAlgorithm } from "../shared/feedback-algrothm";

const FEEDBACK_VS_RATING_PROPORTION_BRACKETS_IN_PERCENT = [
  { start: 0, end: 10, value: -0.44 },
  { start: 11, end: 20, value: -0.085 },
  { start: 21, end: 30, value: 0.095 },
  { start: 31, end: 40, value: 0.2 },
  { start: 41, end: 50, value: 0.23 },
  { start: 51, end: 60, value: 0.25 },
  { start: 61, end: 70, value: 0.26 },
  { start: 71, end: 80, value: 0.27 },
  { start: 81, end: 90, value: 0.9 },
  { start: 91, end: 100, value: 2 }
];

export const calculateProductFeedbackValueAlgorithm = (
  rating: number = 0,
  globalRatingsAmount: number = 1,
  globalReviewsAmount: number = 1
): number => {
  const ratioPercent: number = (globalReviewsAmount / globalRatingsAmount) * 100;
  const adjustment = selectFromRange(FEEDBACK_VS_RATING_PROPORTION_BRACKETS_IN_PERCENT, ratioPercent);
  const totalInteractions = globalRatingsAmount + globalReviewsAmount;
  const adjustedRatings = rating + adjustment;
  return calculateAmazonItemDetailsFeedbackAlgorithm(adjustedRatings, totalInteractions);
};
