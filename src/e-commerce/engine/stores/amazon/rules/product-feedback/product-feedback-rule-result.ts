import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { debug } from "../../../../../../utils/analytics/logger";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import { castAsNumber } from "../../../../../../utils/text/strings";
import AmazonFeedbackDownloader from "../../product/amazon-feedback-downloader";

import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { getAsin } from "../shared/amazon-utils";
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm";
import { getProductFeedbackSummaryTooltip } from "./rule-product-feedback-summary-tooltip";

export const getRuleProductFeedbackResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  const asin = getAsin(product);
  const downloader = new AmazonFeedbackDownloader(asin, product.domain);
  const html = await downloader.download();
  if (isProductPrimeVideo(html)) {
    return getProductPrimeVideoRuleResult(ruleName, weight);
  }

  if (isPreOrderProduct(html)) {
    return preOrderResult({ ruleName, weight });
  }

  const productRatingValue = getRating(html);
  const globalRatingsValue = ratings(html);
  const globalReviewsValue = reviews(html);

  // Check if all feedback values are 0
  if (productRatingValue === 0 && globalRatingsValue === 0 && globalReviewsValue === 0) {
    return {
      name: ruleName,
      value: 0,
      weight,
      isValidRule: false,
      tooltipSummary: getProductFeedbackSummaryTooltip(0, productRatingValue, globalReviewsValue, globalRatingsValue)
    };
  }

  const normalizeValue = calculateProductFeedbackValueAlgorithm(
    productRatingValue,
    globalRatingsValue,
    globalReviewsValue
  );
  const tooltipSummary: IRuleSummaryTooltip = getProductFeedbackSummaryTooltip(
    normalizeValue,
    productRatingValue,
    globalReviewsValue,
    globalRatingsValue
  );

  return {
    name: ruleName,
    value: normalizeValue,
    weight,
    isValidRule: true,
    tooltipSummary
  };
};

const getSubstringFrom = (subStr: string, text: string): string => {
  const regex = new RegExp(`^.*${subStr}`);
  return text.replace(regex, "");
};

export const getRating = (html: any): number => {
  const selectors = ["#cm_cr-product_info .a-fixed-left-grid-col.aok-align-center.a-col-right > div"].join("|");
  const productRatingEl = getAvailableSelector(selectors, html, false, true);
  if (productRatingEl) {
    const value = productRatingEl.textContent.split(" ")[0];
    const productRatingValue: number = castAsNumber(value);
    return productRatingValue;
  }
  return 0;
};

const reviewsAndFeedbacksSelectors = [
  "#filter-info-section > div > span",
  "#filter-info-section > div.a-row.a-spacing-base.a-size-base"
].join("|");

const feedbacksSelectors = "[data-hook='total-review-count']";

export const reviews = (html: any) => {
  const globalReviews = getAvailableSelector(reviewsAndFeedbacksSelectors, html, false, true);
  const feedbacks = getAvailableSelector(feedbacksSelectors, html, false, true);
  if (globalReviews?.textContent?.includes("|")) {
    const value = globalReviews.textContent.split("|");
    if (value.length > 0) {
      const number = value[1];
      const globalReviewsValue = castAsNumber(number);
      return globalReviewsValue;
    }
  } else if (globalReviews?.textContent) {
    const number = globalReviews?.textContent;
    const globalReviewsValue = `${castAsNumber(number)}`;
    const feedbacksValue = `${castAsNumber(feedbacks?.textContent)}`;
    const result = castAsNumber(getSubstringFrom(feedbacksValue, globalReviewsValue));

    return result;
  } else {
    debug("No global reviews found !!!", "Amazon product feedback");
    return 0;
  }
};

export const ratings = (html: Document) => {
  const globalRatings = getAvailableSelector(reviewsAndFeedbacksSelectors, html);
  const feedbacks = getAvailableSelector(feedbacksSelectors, html, false, true);

  if (globalRatings && globalRatings.textContent) {
    if (globalRatings.textContent.includes("|")) {
      let value: any = globalRatings.textContent.split("|");
      if (value && value.length > 0) {
        value = value[0];
        const globalRatingsValue = castAsNumber(value);
        return globalRatingsValue;
      }
    } else if (globalRatings?.textContent) {
      const value = globalRatings?.textContent;
      const globalReviewsValue = `${castAsNumber(value)}`;
      const feedbacksValue = `${castAsNumber(feedbacks?.textContent)}`;
      const result = castAsNumber(getSubstringFrom(globalReviewsValue, feedbacksValue));
      return result;
    } else {
      debug("No global rating found !!!", "Amazon product feedback");
      return 0;
    }
  } else {
    debug("No global rating found !!!", "Amazon product feedback");
    return 0;
  }
};

function isPreOrderProduct(html: any): boolean {
  const preOrderContainerEl = html?.querySelector("#promoPriceBlockMessage_feature_div");
  return preOrderContainerEl && preOrderContainerEl.childElementCount > 0;
}

function preOrderResult({ ruleName, weight }): IRuleResult {
  return {
    name: ruleName,
    value: 0,
    weight,
    isValidRule: true,
    tooltipSummary: null
  };
}
