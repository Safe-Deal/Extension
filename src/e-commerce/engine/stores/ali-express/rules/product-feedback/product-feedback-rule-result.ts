import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { isExist } from "../../../../../../utils/general/general"
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm"
import { getProductFeedbackSummaryTooltip } from "./rule-product-feedback-summary-tooltip"
import { AliExpressProductDownloader } from "../../product/ali-express-product-downloader"

const DEFAULT_ORDERS_VALUE_IF_NOT_PROVIDED = 22

export const getRuleProductFeedbackResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new AliExpressProductDownloader(product)
	const result = await downloader.download()

	if (!result) {
		return {
			name: ruleName,
			value: 0,
			weight,
			isValidRule: false
		}
	}

	// Rating
	const isFeedbackRatingExist = result?.productRatingAverage !== 0
	const rating = isFeedbackRatingExist ? result.productRatingAverage : 0
	const ratingValue = rating

	// Reviews
	const reviews = result?.productRatingsAmount
	const reviewsValue = reviews

	// Orders
	const orders = result?.productPurchases || DEFAULT_ORDERS_VALUE_IF_NOT_PROVIDED
	const isValidRule = isExist(orders) && isExist(rating)
	const isProductFeedbackValuesExist = ratingValue !== 0 && reviewsValue !== 0
	const ordersValue = orders || 0

	const normilizeValue = calculateProductFeedbackValueAlgorithm(ratingValue, reviewsValue, ordersValue)
	const tooltipSummary: IRuleSummaryTooltip = getProductFeedbackSummaryTooltip(
		normilizeValue,
		isProductFeedbackValuesExist,
		ratingValue,
		reviewsValue,
		ordersValue
	)
	return {
		name: ruleName,
		value: normilizeValue,
		weight,
		isValidRule,
		tooltipSummary
	}
}
