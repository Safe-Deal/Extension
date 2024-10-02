import BONUS_POINTS from "../../../../../../constants/rule-bonus-value";
import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { isExist } from "../../../../../../utils/general/general";
import AmazonProductDownloader from "../../product/amazon-product-downloader";
import { getProductPrimeVideoRuleResult, isProductPrimeVideo } from "../amazon-rules-utils";
import { getRuleAmazonChoiceSummaryTooltip } from "./amazon-choice-rule-summary-tooltip";

const AMAZON_CHOICE_WHOLESALE_SEL = ".a-badge-label";
const AMAZON_CHOICE_WHOLESALE_SEL1 = ".a-badge-text";
const AMAZON_CHOICE_ITEM_SEL = ".ac-badge-wrapper";
const AMAZON_CHOICE_ITEM_SEL2 = ".ac-badge-rectangle";
const AMAZON_CHOICE_ITEM_SEL3 = ".ac-badge-text-primary";
const AMAZON_CHOICE_ITEM_SEL4 = ".ac-badge-text-secondary";

export const getRuleAmazonChoiceResultValue = async (
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

  const amazonChoiceEl =
    html?.querySelector(AMAZON_CHOICE_WHOLESALE_SEL) ||
    html?.querySelector(AMAZON_CHOICE_WHOLESALE_SEL1) ||
    html?.querySelector(AMAZON_CHOICE_ITEM_SEL2) ||
    html?.querySelector(AMAZON_CHOICE_ITEM_SEL3) ||
    html?.querySelector(AMAZON_CHOICE_ITEM_SEL4) ||
    html?.querySelector(AMAZON_CHOICE_ITEM_SEL);
  const isValidRule = isExist(amazonChoiceEl);
  const tooltipSummary: IRuleSummaryTooltip = getRuleAmazonChoiceSummaryTooltip(amazonChoiceEl);

  return {
    name: ruleName,
    value: 0,
    weight,
    bonus: {
      isBonusRule: true,
      value: amazonChoiceEl ? BONUS_POINTS.HUGE_BONUS : BONUS_POINTS.NONE
    },
    isValidRule,
    tooltipSummary
  };
};
