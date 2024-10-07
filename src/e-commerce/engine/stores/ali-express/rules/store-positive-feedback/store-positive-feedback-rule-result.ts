import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { isExist } from "../../../../../../utils/general/general";
import { calculateStorePositiveFeedbackValueAlgorithm } from "./rule-store-positive-feedback-algorithm";
import { getStorePositiveFeedbackSummaryTooltip } from "./rule-store-positive-feedback-summary-tooltip";
import { AliExpressProductDownloader } from "../../product/ali-express-product-downloader";

export const getRuleStorePositiveFeedbackResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  const downloader = new AliExpressProductDownloader(product);
  const result = await downloader.download();

  const storePositiveRate = result?.storePositiveRate;
  const isValidRule = isExist(storePositiveRate);
  if (!isValidRule) {
    return { name: ruleName, isValidRule: false, value: 0, weight };
  }

  const storePositiveRateValue = storePositiveRate;
  const normalizeValue = calculateStorePositiveFeedbackValueAlgorithm(storePositiveRateValue);
  const tooltipSummary: IRuleSummaryTooltip = getStorePositiveFeedbackSummaryTooltip(normalizeValue, storePositiveRate);
  const res: IRuleResult = {
    name: ruleName,
    value: normalizeValue,
    weight,
    isValidRule,
    tooltipSummary
  };
  return res;
};
