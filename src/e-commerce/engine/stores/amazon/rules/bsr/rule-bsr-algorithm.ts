import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { selectFromRange } from "../../../../../../utils/general/general"

const AVG_BSR_IN_SAFE_DEAL = 18000
const GOOD_BSR_IN_SAFE_DEAL = 10000

// --------------------------
// Best Seller Rating Weights
// --------------------------
const BSR_RATING = [
	{ start: 0, end: GOOD_BSR_IN_SAFE_DEAL, value: RULE_VALUE.RULE_VAL_10 },
	{
		start: GOOD_BSR_IN_SAFE_DEAL + 1,
		end: AVG_BSR_IN_SAFE_DEAL,
		value: RULE_VALUE.RULE_VAL_6
	},
	{
		start: AVG_BSR_IN_SAFE_DEAL + 1,
		end: AVG_BSR_IN_SAFE_DEAL * 4,
		value: RULE_VALUE.RULE_VAL_5
	},
	{
		start: AVG_BSR_IN_SAFE_DEAL * 4 + 1,
		end: AVG_BSR_IN_SAFE_DEAL * 5,
		value: RULE_VALUE.RULE_VAL_4
	},
	{
		start: AVG_BSR_IN_SAFE_DEAL * 5 + 1,
		end: AVG_BSR_IN_SAFE_DEAL * 6,
		value: RULE_VALUE.RULE_VAL_3
	},
	{
		start: AVG_BSR_IN_SAFE_DEAL * 6 + 1,
		end: AVG_BSR_IN_SAFE_DEAL * 7,
		value: RULE_VALUE.RULE_VAL_2
	},
	{
		start: AVG_BSR_IN_SAFE_DEAL * 7 + 1,
		end: Number.MAX_VALUE,
		value: RULE_VALUE.RULE_VAL_1
	}
]

export const calculateBsrValueAlgorithm = (avgBsrValue = undefined): number => {
	if (!avgBsrValue) {
		return RULE_VALUE.RULE_VAL_1
	}
	const bsrRating = selectFromRange(BSR_RATING, avgBsrValue)
	return bsrRating
}
