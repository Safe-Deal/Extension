import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import eBayProductDownloader from "../../product/ebay-product-downloader";
import { getRuleReturnPolicySummaryTooltip } from "./rule-retrun-policy-summary-tooltip";
import { calculateReturnPolicyValueAlgorhtim as calculateReturnPolicyValueAlgorithm } from "./rule-return-policy-algorithm";

const RETURN_POLICY_SEL = ["[class*=x-returns]", "#vi-ret-accrd-txt"].join("|");
export const getRuleReturnPolicyResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  let productReturnPolicy: string = "";
  const downloader = new eBayProductDownloader(product);
  const html = await downloader.download();

  productReturnPolicy = getAvailableSelector(RETURN_POLICY_SEL, html)?.textContent?.toLowerCase();

  let normalizeValue: number = 0;
  let tooltipSummary: IRuleSummaryTooltip = null;
  const isValidRule = !!productReturnPolicy;

  normalizeValue = calculateReturnPolicyValueAlgorithm(productReturnPolicy);
  tooltipSummary = getRuleReturnPolicySummaryTooltip(normalizeValue);

  const res: IRuleResult = {
    name: ruleName,
    value: normalizeValue,
    weight,
    bonus: {
      isBonusRule: true,
      value: normalizeValue
    },
    isValidRule,
    tooltipSummary
  };
  return res;
};
