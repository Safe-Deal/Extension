import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import { isExist } from "../../../../../../utils/general/general";
import { castAsNumber } from "../../../../../../utils/text/strings";
import AmazonProductDownloader from "../../product/amazon-product-downloader";
import AmazonStoreDownloader from "../../product/amazon-store-downloader";
import { AmazonSiteUtils } from "../../utils/amazon-site-utils";
import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { calculateStorePositiveFeedbackValueAlgorithm } from "./rule-store-positive-feedback-algorithm";
import { getStorePositiveFeedbackSummaryTooltip } from "./rule-store-positive-feedback-summary-tooltip";

export const PERCENT_EL_SELECTOR = "#seller-info-feedback-summary b";
export const NO_PERCENT_EL_SELECTOR = "#feedback-no-review|#feedback-no-rating";

const STORE_ID_SELECTORS = [
  "a#merchantID",
  "a#sellerProfileTriggerId",
  "#fulfillerInfoFeature_feature_div .offer-display-feature-text"
].join("|");

const isSoldByAmazonItself = (storeUrl: string, storeName) => !storeUrl && storeName?.toLowerCase().includes("amazon.");
const getStoreEl = (domEl) => getAvailableSelector(STORE_ID_SELECTORS, domEl);

export const getRuleStorePositiveFeedbackResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  const downloader = new AmazonProductDownloader(product);
  const html = await downloader.download();
  if (isProductPrimeVideo(html)) {
    return getProductPrimeVideoRuleResult(ruleName, weight);
  }

  const storeEl = getStoreEl(html);
  const storeUrl = storeEl?.getAttribute("href");
  const storeName = storeEl?.textContent;

  if (!storeUrl && !storeName) {
    return { name: ruleName, isValidRule: false, value: 0, weight };
  }

  let isValidRule = true;
  let percentValue;

  if (isSoldByAmazonItself(storeUrl, storeName)) {
    percentValue = 88;
    isValidRule = false;
  } else {
    const storeDownloader = storeUrl
      ? new AmazonStoreDownloader(null, product.domain, storeUrl)
      : new AmazonStoreDownloader(storeName, product.domain);
    const html = await storeDownloader.download();
    const percentEl = getAvailableSelector(PERCENT_EL_SELECTOR, html);
    isValidRule = isExist(percentEl);
    if (!isValidRule) {
      const isNotRatedAtAll = getAvailableSelector(NO_PERCENT_EL_SELECTOR, html);
      if (isNotRatedAtAll) {
        percentValue = null;
      } else {
        return { name: ruleName, isValidRule: false, value: 0, weight };
      }
    }
    percentValue = percentEl?.textContent;
  }
  const storePositiveRateValue = castAsNumber(percentValue);
  const normalizeValue = calculateStorePositiveFeedbackValueAlgorithm(storePositiveRateValue);
  const tooltipSummary: IRuleSummaryTooltip = getStorePositiveFeedbackSummaryTooltip(
    normalizeValue,
    storePositiveRateValue
  );

  return {
    name: ruleName,
    value: normalizeValue,
    weight,
    isValidRule,
    tooltipSummary
  };
};
