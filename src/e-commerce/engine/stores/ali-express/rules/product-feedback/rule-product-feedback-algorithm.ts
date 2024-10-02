import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { distance, getPercentage } from "../../../../../../utils/general/general";

export const IDEAL_RATING = 4.7;
export const IDEAL_REVIEWS = 12;
export const IDEAL_ORDERS = 150;

export const IDEAL_RESULT = (IDEAL_RATING * IDEAL_REVIEWS) / IDEAL_ORDERS;

const MINIMUM_ORDERS_VALUE = IDEAL_ORDERS / 7;
const MINIMUM_RATING_VALUE = 4;
const MINIMUM_REVIEW_VALUE = 4;

const isRatingValueInsufficient = (ratingValue: number): boolean => ratingValue < MINIMUM_RATING_VALUE;
const isOrdersValid = (ordersValue: number): boolean => ordersValue && ordersValue > MINIMUM_ORDERS_VALUE;
const getRating = (ratingValue: number) => (ratingValue > IDEAL_RATING ? IDEAL_RATING : ratingValue);
const getReviews = (reviewsValue: number) => (reviewsValue > IDEAL_REVIEWS ? IDEAL_REVIEWS : reviewsValue);
const getOrders = (ordersValue: number) => (ordersValue > IDEAL_ORDERS ? IDEAL_ORDERS : ordersValue);
const calculate = (newRatingValue, newReviewsValue, newOrdersValue): number =>
  (newRatingValue * newReviewsValue) / newOrdersValue;
const isProductFeedbackBetterThanIdealFeedback = (newProductFeedbackResult) => newProductFeedbackResult > IDEAL_RESULT;

export const calculateProductFeedbackValueAlgorithm = (
  ratingValue: number = 0,
  reviewsValue: number = 0,
  ordersValue: number = 0
): number => {
  if (isRatingValueInsufficient(ratingValue)) {
    return RULE_VALUE.RULE_VAL_1;
  }

  if (!isOrdersValid(ordersValue)) {
    return RULE_VALUE.RULE_VAL_4;
  }

  if (reviewsValue < MINIMUM_REVIEW_VALUE) {
    return RULE_VALUE.RULE_VAL_4;
  }

  const distanceFromIdealTo50 = distance(IDEAL_RESULT, getPercentage(IDEAL_RESULT, 50));
  const distanceFromIdealTo40 = distance(IDEAL_RESULT, getPercentage(IDEAL_RESULT, 40));
  const distanceFromIdealTo30 = distance(IDEAL_RESULT, getPercentage(IDEAL_RESULT, 30));
  const distanceFromIdealTo20 = distance(IDEAL_RESULT, getPercentage(IDEAL_RESULT, 20));
  const distanceFromIdealTo10 = distance(IDEAL_RESULT, getPercentage(IDEAL_RESULT, 10));

  const newRatingValue = getRating(ratingValue);
  const newReviewsValue = getReviews(reviewsValue);
  const newOrdersValue = getOrders(ordersValue);
  const newProductFeedbackResult = calculate(newRatingValue, newReviewsValue, newOrdersValue);

  const distanceFromIdeal = distance(newProductFeedbackResult, IDEAL_RESULT);

  let normalizeValue: number = RULE_VALUE.RULE_VAL_1;
  if (isProductFeedbackBetterThanIdealFeedback(newProductFeedbackResult)) {
    return RULE_VALUE.RULE_VAL_10;
  }

  if (distanceFromIdeal < distanceFromIdealTo50) {
    normalizeValue = RULE_VALUE.RULE_VAL_7;
  }

  if (distanceFromIdeal < distanceFromIdealTo40) {
    normalizeValue = RULE_VALUE.RULE_VAL_8;
  }

  if (distanceFromIdeal < distanceFromIdealTo30) {
    normalizeValue = RULE_VALUE.RULE_VAL_9;
  }

  if (distanceFromIdeal < distanceFromIdealTo20) {
    normalizeValue = RULE_VALUE.RULE_VAL_10;
  }

  if (distanceFromIdeal < distanceFromIdealTo10) {
    normalizeValue = RULE_VALUE.RULE_VAL_10;
  }

  return normalizeValue;
};
