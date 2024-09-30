import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult, NOT_VALID_RULE_RESPONSE } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { logError } from "../../../../../../utils/analytics/logger";
import { ApiDownloader, PRICE_TYPE } from "../../../../../../utils/downloaders/apiDownloader";
import { LOCALE } from "../../../../../../utils/extension/locale";
import { isIterable } from "../../../../../../utils/general/general";
import { isNumeric } from "../../../../../../utils/text/strings";
import { AliExpressProductDownloader } from "../../product/ali-express-product-downloader";
import { calculateProductPricingAlgorithm } from "./rule-pricing-algorithm";
import { getProductPricingSummaryTooltip } from "./rule-pricing-summary-tooltip";

const SAFE_DEAL_PRICE_API = `/price`;
interface ProductPrice {
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  date: string;
}

interface AveragePrice {
  date: string;
  price: number;
}

const toAveragePrices = (productPrices: ProductPrice[]): AveragePrice[] => {
  const validPrices = productPrices.filter((p) => isNumeric(p.minPrice) && isNumeric(p.maxPrice));

  const averages = validPrices.map((p) => ({
    date: p.date,
    price: Number(((Number(p.minPrice) + Number(p.maxPrice)) / 2).toFixed(2))
  }));

  return averages;
};

export const getRuleProductPricingResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  try {
    const downloader = new AliExpressProductDownloader(product);
    const productDetails = await downloader.download();
    const productId = product.id;

    if (!productDetails) {
      return { name: ruleName, ...NOT_VALID_RULE_RESPONSE };
    }

    const apiDownloader = new ApiDownloader(SAFE_DEAL_PRICE_API);
    const productsPricing = await apiDownloader.post({
      products: [productId],
      type: PRICE_TYPE.ALI_EXPRESS,
      domain: product.domain,
      lang: LOCALE
    });

    if (!isIterable(productsPricing?.price)) {
      return { name: ruleName, ...NOT_VALID_RULE_RESPONSE };
    }

    let currentProductPricing = null;
    if (isIterable(productsPricing)) {
      currentProductPricing = productsPricing[0];
    } else {
      currentProductPricing = productsPricing;
    }

    if (currentProductPricing?.price && productDetails.productPrice) {
      if (Array.isArray(currentProductPricing.price)) {
        currentProductPricing.price.push({
          minPrice: productDetails.productPrice,
          maxPrice: productDetails.productPrice,
          date: new Date().toISOString()
        });
      }
    }

    let isValidRule = true;
    let normalizeVal = null;
    let tooltipSummary: IRuleSummaryTooltip = null;

    if (currentProductPricing?.price) {
      const calcResultPricingAlgo = calculateProductPricingAlgorithm(currentProductPricing);
      if (!calcResultPricingAlgo) {
        normalizeVal = 0;
        isValidRule = false;
        weight = 0;
      } else {
        tooltipSummary = getProductPricingSummaryTooltip(calcResultPricingAlgo);
        const { normalizeValue } = calcResultPricingAlgo;
        normalizeVal = normalizeValue;
      }
    } else {
      normalizeVal = 0;
      isValidRule = false;
      weight = 0;
    }
    const price = toAveragePrices(currentProductPricing.price);
    const dataset = { ...currentProductPricing, price, currency: productsPricing?.currency };
    const res: IRuleResult = {
      bonus: {
        isBonusRule: true,
        value: 0
      },
      name: ruleName,
      value: normalizeVal,
      weight,
      isValidRule,
      tooltipSummary,
      dataset
    };
    return res;
  } catch (error) {
    logError(error, "Ali Express Pricing");
    return { name: ruleName, ...NOT_VALID_RULE_RESPONSE };
  }
};
