import { debug } from "../../../../../../utils/analytics/logger";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import { castAsNumber, numberFromString } from "../../../../../../utils/text/strings";
import WalmartProductDownloader from "../../product/walmart-product-downloader";
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm";
import { getProductFeedbackSummaryTooltip } from "./rule-product-feedback-summary-tooltip";

const PRODUCT_FEEDBACK_SEL = ".ReviewRatings-wrapper";

export const getRuleProductFeedbackResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string,
  isGallery?: boolean
): Promise<IRuleResult> => {
  const downloader = new WalmartProductDownloader(product);
  const html = await downloader.download();

  const productFeedbackEl = getAvailableSelector(PRODUCT_FEEDBACK_SEL, html);

  const productRatingValue = getRating(productFeedbackEl);
  const globalRatingsValue = getRatingsAmount(productFeedbackEl);
  const recommendedValue = getRecommendedValue(productFeedbackEl);

  const normalizeValue = calculateProductFeedbackValueAlgorithm(
    productRatingValue,
    globalRatingsValue,
    recommendedValue
  );
  const tooltipSummary: IRuleSummaryTooltip = getProductFeedbackSummaryTooltip(normalizeValue);

  const res: IRuleResult = {
    name: ruleName,
    value: normalizeValue,
    weight,
    isValidRule: true,
    tooltipSummary
  };

  return res;
};

export const getRating = (productFeedbackEl: any): number => {
  const selectors = ".ReviewsRating-rounded-overall";
  const productRatingEl = getAvailableSelector(selectors, productFeedbackEl, false, true);
  if (productRatingEl) {
    const productRatingValue = castAsNumber(productRatingEl.textContent);
    return productRatingValue;
  }
  return 0;
};

export const getRecommendedValue = (productFeedbackEl: any) => {
  const selectors = ".ReviewRecommend-percentage";

  const recommendedPercentageEl = getAvailableSelector(selectors, productFeedbackEl, false, true);
  if (recommendedPercentageEl) {
    const value = numberFromString(recommendedPercentageEl.textContent);
    const productRecommendedValue = castAsNumber(value);
    return productRecommendedValue;
  }
  debug("No RecommendedValue found !!!", "Walmart product feedback");
  return 0;
};

export const getRatingsAmount = (productFeedbackEl: any) => {
  const selectors = ".ReviewRatingWYR-container > div > div:nth-child(2)";
  const productRatingAmountEl = getAvailableSelector(selectors, productFeedbackEl, false, true);
  if (productRatingAmountEl) {
    const value = numberFromString(productRatingAmountEl.textContent);
    const productRatingValue = castAsNumber(value);
    return productRatingValue;
  }
  debug("No global rating found !!!", "Walmart product feedback");
  return 0;
};
