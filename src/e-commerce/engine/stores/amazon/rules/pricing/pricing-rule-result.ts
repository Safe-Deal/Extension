import { logError } from "../../../../../../utils/analytics/logger";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult, NOT_VALID_RULE_RESPONSE } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { ApiDownloader, PRICE_TYPE } from "../../../../../../utils/downloaders/apiDownloader";
import AmazonProductDownloader from "../../product/amazon-product-downloader";
import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { calculateProductPricingAlgorithm } from "./rule-pricing-algorithm";
import { getProductPricingSummaryTooltip } from "./rule-pricing-summary-tooltip";
import { LOCALE } from "../../../../../../utils/extension/locale";

const SAFE_DEAL_PRICE_API = `/price`;

export const getRuleProductPricingResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  try {
    const downloader = new AmazonProductDownloader(product);
    const html = await downloader.download();

    if (isProductPrimeVideo(html)) {
      return getProductPrimeVideoRuleResult(ruleName, weight);
    }

    if (!html) {
      return { name: ruleName, ...NOT_VALID_RULE_RESPONSE };
    }

    const productAsin = product.id;

    const apiDownloader = new ApiDownloader(SAFE_DEAL_PRICE_API);
    let apiPriceResult = await apiDownloader.post({
      products: [productAsin],
      type: PRICE_TYPE.AMAZON,
      domain: product?.domain,
      lang: product?.locale || LOCALE,
      regenerate: product?.regenerate
    });

    if (Array.isArray(apiPriceResult)) {
      [apiPriceResult] = apiPriceResult;
    }

    if (apiPriceResult) {
      for (const item of apiPriceResult?.price ?? []) {
        item.date = new Date(item.date);
      }
    }

    let isValidRule = true;
    let tooltipSummary: IRuleSummaryTooltip = null;
    const displayedPrice = apiPriceResult?.price?.sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.price;

    if (html) {
      const calcResultPricingAlgo = calculateProductPricingAlgorithm(displayedPrice, apiPriceResult);
      if (!calcResultPricingAlgo) {
        isValidRule = false;
        weight = 0;
      } else {
        tooltipSummary = getProductPricingSummaryTooltip(calcResultPricingAlgo, displayedPrice);
      }
    } else {
      isValidRule = false;
      weight = 0;
    }

    if (apiPriceResult) {
      const res: IRuleResult = {
        bonus: {
          isBonusRule: true,
          value: 0
        },
        name: ruleName,
        value: 0,
        weight,
        isValidRule,
        tooltipSummary,
        dataset: apiPriceResult
      };

      return res;
    }
    return {
      name: ruleName,
      isValidRule: false,
      value: 0,
      weight: 0
    };
  } catch (error) {
    logError(error, "Amazon Pricing");
    return {
      name: ruleName,
      isValidRule: false,
      value: 0,
      weight: 0
    };
  }
};
