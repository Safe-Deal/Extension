import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { isExist } from "../../../../../../utils/general/general";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import WalmartProductDownloader from "../../product/walmart-product-downloader";
import { getRuleProSellerSummaryTooltip } from "./pro-seller-rule-summary-tooltip";

const PRO_SELLER_ITEM_SEL = ".SellerInfo .seller-badge-text|.SellerInfo .seller-badge-wrapper";

export const getRuleProSellerResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  const downloader = new WalmartProductDownloader(product);
  const html = await downloader.download();
  const proSellerEl = getAvailableSelector(PRO_SELLER_ITEM_SEL, html);
  const isValidRule = isExist(proSellerEl);
  const tooltipSummary: IRuleSummaryTooltip = getRuleProSellerSummaryTooltip(proSellerEl);

  // debug(`Walmart: Rule: pro seller: ${stringify(res)}`);
  return {
    name: ruleName,
    value: 0,
    weight,
    bonus: {
      isBonusRule: true,
      value: proSellerEl ? BONUS_POINTS.HUGE_BONUS : BONUS_POINTS.NONE
    },
    isValidRule,
    tooltipSummary
  };
};
