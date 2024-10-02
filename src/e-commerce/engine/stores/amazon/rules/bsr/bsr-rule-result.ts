import { IRuleResult, NOT_VALID_RULE_RESPONSE } from "../../../../../../data/entities/rule-result.interface";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import AmazonProductDownloader from "../../product/amazon-product-downloader";
import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { calculateBsrValueAlgorithm } from "./rule-bsr-algorithm";
import { getBSRSummaryTooltip } from "./rule-bsr-summary-tooltip";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import { castAsNumber } from "../../../../../../utils/text/strings";

export const getRuleBsrResultValue = async (
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

  if (!html) {
    return { name: ruleName, ...NOT_VALID_RULE_RESPONSE };
  }
  const selectors = ["#SalesRank", "#productDetails_detailBullets_sections1", "#detailBulletsWrapper_feature_div"].join(
    "|"
  );
  const productBsrEl = getAvailableSelector(selectors, html);

  let isValidRule = false;
  let normalizeValue = 0;
  let tooltipSummary: IRuleSummaryTooltip = null;

  if (productBsrEl && productBsrEl.textContent) {
    const bsrValues = productBsrEl.textContent
      .split(" ")
      .filter((item: string) => !item.includes("http") && item.includes("#"))
      .map((item: string) => castAsNumber(item));
    if (bsrValues && bsrValues.length > 0) {
      const sumBsrValues = bsrValues.reduce((a: number, b: number) => a + b, 0);
      const avgBsrValue = sumBsrValues / bsrValues.length;
      isValidRule = true;
      normalizeValue = calculateBsrValueAlgorithm(avgBsrValue);
      tooltipSummary = getBSRSummaryTooltip(normalizeValue);
    }
  }

  return {
    name: ruleName,
    value: 0,
    weight,
    bonus: {
      isBonusRule: true,
      value: normalizeValue
    },
    isValidRule,
    tooltipSummary
  };
};
