import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import eBayProductDownloader from "../../product/ebay-product-downloader";
import { getRuleTopSellerSummaryTooltip } from "./rule-sold-by-brand-summary-tooltip";

export const getRuleSoldByBrandResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string,
  isItemDetails?: boolean
): Promise<IRuleResult> => {
  const downloader = new eBayProductDownloader(product);
  const html = await downloader.download();
  const shopWithConfidenceSections = html?.querySelectorAll(hrefSelector);
  let isValidRule = false;
  let bonusValue: any = BONUS_POINTS.NONE;
  let soldByBrand: string = "";
  if (shopWithConfidenceSections && shopWithConfidenceSections.length > 0) {
    const confidenceText = [...shopWithConfidenceSections].map((it) => it?.textContent?.toLowerCase());
    const soldByBrands: string[] = confidenceText.filter((item) => item.includes("direct from"));
    isValidRule = soldByBrands && soldByBrands.length > 0;
    soldByBrand = isValidRule ? soldByBrands[0] : "";
    bonusValue = isValidRule ? BONUS_POINTS.HUGE_BONUS : BONUS_POINTS.NONE;
  }
  const tooltipSummary: IRuleSummaryTooltip = getRuleTopSellerSummaryTooltip(isValidRule, soldByBrand);
  return {
    name: ruleName,
    value: 0,
    weight,
    bonus: {
      isBonusRule: true,
      value: bonusValue
    },
    isValidRule,
    tooltipSummary
  };
};
