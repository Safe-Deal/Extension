import { IProduct } from "../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface"
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface"
import { debug } from "../../../../../../utils/analytics/logger"
import { getAvailableSelector } from "../../../../../../utils/dom/html"
import { castAsNumber } from "../../../../../../utils/text/strings"
import eBayProductDownloader from "../../product/ebay-product-downloader"
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm"
import { getProductFeedbackSummaryTooltip } from "./rule-product-feedback-summary-tooltip"

const FEEDBACK_SCORE_SEL = [
	"[data-testid=x-sellercard-atf__about-seller]",
	".x-sellercard-atf__about-seller",
	".si-content .mbg-l a",
	"#RightSummaryPanel .ux-seller-section__item--seller a:nth-child(3)"
].join("|")

const FEEDBACK_PERCENTAGE = [
	"[data-testid=x-sellercard-atf__data-item]",
	".x-sellercard-atf__info > ul > li:nth-child(1)",
	".si-content #si-fb",
	"#RightSummaryPanel .x-about-this-seller .ux-seller-section__item:nth-child(2)"
].join("|")

interface IFeedbackResults {
  feedbackScoreValue: number;
  productFeedbackPercentageValue: number;
}

export const getProductFeedbackValues = (html): IFeedbackResults => {
	const feedbackScoreTxt = getAvailableSelector(FEEDBACK_SCORE_SEL, html)?.textContent
	const productFeedbackPercentageTxt = getAvailableSelector(FEEDBACK_PERCENTAGE, html)?.textContent

	if (!feedbackScoreTxt && !productFeedbackPercentageTxt) {
		debug("Feedback selectors not found", "eBay::product-feedback-rule-result")
		return null
	}

	const feedbackScoreValue = castAsNumber(feedbackScoreTxt)
	const productFeedbackPercentageValue = castAsNumber(productFeedbackPercentageTxt)

	return {
		feedbackScoreValue,
		productFeedbackPercentageValue
	}
}

export const getRuleProductFeedbackResultValue = async (
	product: IProduct,
	hrefSelector: string,
	weight: number,
	ruleName: string
): Promise<IRuleResult> => {
	const downloader = new eBayProductDownloader(product)
	const html = await downloader.download()
	const result = getProductFeedbackValues(html)
	if (!result) {
		return {
			name: ruleName,
			value: 0,
			weight,
			isValidRule: false
		}
	}

	const { feedbackScoreValue, productFeedbackPercentageValue } = result
	const normalizeValue: number = calculateProductFeedbackValueAlgorithm(
		feedbackScoreValue,
		productFeedbackPercentageValue
	)
	const tooltipSummary: IRuleSummaryTooltip = getProductFeedbackSummaryTooltip(
		normalizeValue,
		feedbackScoreValue,
		productFeedbackPercentageValue
	)

	const res: IRuleResult = {
		name: ruleName,
		value: normalizeValue,
		weight,
		isValidRule: true,
		tooltipSummary
	}
	return res
}
