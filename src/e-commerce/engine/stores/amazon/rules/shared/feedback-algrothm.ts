import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { selectFromRange } from "../../../../../../utils/general/general"

const GREAT_FEEDBACKS_AMOUNT = 1600
const GREAT_RANKING = 4.6
const MAX_RANKING = 5
export const MINIMUM_FEEDBACKS_AMOUNT = 99
const MAX_PERCENTAGE_OF_UNSATISFIED = 35 / 100

const FEEDBACK_RATING = [
	{ start: 0, end: 38, value: -1 },
	{ start: 39, end: 40, value: RULE_VALUE.RULE_VAL_4 },
	{ start: 41, end: 42, value: RULE_VALUE.RULE_VAL_5 },
	{ start: 42, end: 43, value: RULE_VALUE.RULE_VAL_6 },
	{ start: 44, end: 45, value: RULE_VALUE.RULE_VAL_7 },
	{ start: 46, end: 47, value: RULE_VALUE.RULE_VAL_8 },
	{ start: 48, end: 50, value: RULE_VALUE.RULE_VAL_10 + 2 }
]

export const calculateAmazonItemDetailsFeedbackAlgorithm = (
	productRatingValue: number = 0,
	productNumberOfReviewsValue: number = 0
): number => {
	const rating = Number(productRatingValue)
	const numberOfReviews = Number(productNumberOfReviewsValue)
	const percentageOfUnsatisfied = 1 - rating / MAX_RANKING
	const intRankings = Math.round(rating * 10)
	const feedbackRating = selectFromRange(FEEDBACK_RATING, intRankings)

	let ratingProportion = rating / GREAT_RANKING
	let feedbackProportion = numberOfReviews / MINIMUM_FEEDBACKS_AMOUNT

	if (feedbackProportion < 0.2) {
		feedbackProportion = -1
	}

	if (feedbackProportion > 1) {
		let multiplier = numberOfReviews / GREAT_FEEDBACKS_AMOUNT
		if (multiplier > 10) {
			multiplier = 10
		}
		feedbackProportion = 1 + multiplier / 100
	}

	if (percentageOfUnsatisfied >= MAX_PERCENTAGE_OF_UNSATISFIED) {
		ratingProportion = -RULE_VALUE.RULE_VAL_10
	}

	const finalRecommendation =
    Math.floor((ratingProportion + feedbackRating) / 2) + Math.floor((feedbackProportion * RULE_VALUE.RULE_VAL_10) / 2)

	const result = Math.round(finalRecommendation)

	if (result < RULE_VALUE.RULE_VAL_1) {
		return RULE_VALUE.RULE_VAL_1
	}

	if (result > RULE_VALUE.RULE_VAL_10) {
		return RULE_VALUE.RULE_VAL_10
	}

	return result
}
