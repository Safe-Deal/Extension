import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { debug } from "../../../../../../utils/analytics/logger"

const reject = () => {
	debug("Rule Pricing: Current Product Pricing is Invalid")
	return false
}

const isValid = (priceHistory) => {
	if (!priceHistory) {
		return reject()
	}

	if (priceHistory.error) {
		return reject()
	}

	if (!priceHistory.minPrice || !priceHistory.maxPrice) {
		return reject()
	}

	if (priceHistory?.price && priceHistory?.price?.length === 0) {
		return reject()
	}

	return true
}

export const calculateProductPricingAlgorithm = (productPrice, priceHistory): any => {
	try {
		if (!isValid(priceHistory)) {
			return null
		}

		const productPrices = priceHistory?.price

		const minPrices = productPrices.map((p) => p?.price)
		const maxPrices = productPrices.map((p) => p?.price)

		const sumMin = minPrices.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
		const minAvg = sumMin / minPrices.length

		const sumMax = maxPrices.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
		const maxAvg = sumMax / maxPrices.length

		const minMaxAvg = parseFloat(((minAvg + maxAvg) / 2).toFixed(2))

		const percentage = (productPrice / minMaxAvg) * 100
		const ratioFromAvgPrice = percentage - 100

		let normalizeValue: number = RULE_VALUE.RULE_VAL_1
		const isDiscounted = ratioFromAvgPrice < 0
		const ratio = Math.abs(ratioFromAvgPrice)

		if (isDiscounted) {
			if (ratio <= 20) {
				normalizeValue = RULE_VALUE.RULE_VAL_3
			}

			if (ratio >= 20) {
				normalizeValue = RULE_VALUE.RULE_VAL_5
			}

			if (ratio >= 55) {
				normalizeValue = RULE_VALUE.RULE_VAL_6
			}
		} else if (ratio >= 38) {
			normalizeValue = RULE_VALUE.RULE_VAL_2
		} else if (ratio <= 8) {
			normalizeValue = RULE_VALUE.RULE_VAL_7
		} else {
			normalizeValue = RULE_VALUE.RULE_VAL_1
		}

		return { normalizeValue, ratio: ratioFromAvgPrice }
	} catch (error) {
		debug(error)
		return null
	}
}
