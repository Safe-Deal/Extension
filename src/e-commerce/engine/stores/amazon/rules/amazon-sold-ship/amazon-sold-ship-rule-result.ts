import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import AmazonProductDownloader from "../../product/amazon-product-downloader";
import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { getRuleAmazonSoldShipSummaryTooltip } from "./amazon-sold-ship-rule-summary-tooltip";
import { isSoldOrShipByAmazon, isSoldShipByAmazon } from "./amazon-sold-ship-rule-algorithm";
import { getAvailableSelector } from "../../../../../../utils/dom/html";

const SHIP = [
  "#fulfillerInfoFeature_feature_div .offer-display-feature-text span",
  "#tabular-buybox-container > tbody > tr:nth-child(1) > td.tabular-buybox-column",
  "#SSOFpopoverLink_ubb"
].join("|");

const SOLD = [
  "#merchantInfoFeature_feature_div .offer-display-feature-text span",
  "#tabular-buybox-container > tbody > tr:nth-child(2) > td.tabular-buybox-column",
  "#usedbuyBox > div.a-section.a-spacing-base"
].join("|");

export const getRuleAmazonSoldShopResultValue = async (
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

  const soldEl = getAvailableSelector(SOLD, html);
  const shipEl = getAvailableSelector(SHIP, html);

  const isValidRule = isSoldOrShipByAmazon(shipEl, soldEl);
  const soldShipByAmazonValue = isSoldShipByAmazon(shipEl, soldEl);
  const soldOrShipByAmazonValue = isSoldOrShipByAmazon(shipEl, soldEl);

  const tooltipSummary: IRuleSummaryTooltip = getRuleAmazonSoldShipSummaryTooltip(
    soldShipByAmazonValue,
    soldOrShipByAmazonValue
  );

  return {
    name: ruleName,
    value: 0,
    weight,
    bonus: {
      isBonusRule: true,
      value: soldShipByAmazonValue ? BONUS_POINTS.TEN : soldOrShipByAmazonValue ? BONUS_POINTS.SEVEN : BONUS_POINTS.NONE
    },
    isValidRule,
    tooltipSummary
  };
};
