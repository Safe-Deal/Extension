import { IProduct } from "../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../data/entities/rule-result.interface";
import { IRuleSummaryTooltip } from "../../../../../../data/entities/rule-summary-tooltip.interface";
import { getAvailableSelector } from "../../../../../../utils/dom/html";
import eBayProductDownloader from "../../product/ebay-product-downloader";
import { calculateDeliveryValueAlgorithm, ebayDeliveryTextToDate } from "./rule-delivery-algorithm";
import { getDeliverySummaryTooltip } from "./rule-delivery-summary-tooltip";

const DELIVERY_SEL = [
  ".d-vi-evo-region .d-shipping-minview .ux-labels-values__values.col-9 div:nth-child(2)",
  "[class*=d-shipping] div > div > div > div:nth-child(3)",
  "[class*=d-shipping] [data-testid*=custom-help]",
  "#delSummary .vi-acc-del-range"
].join("|");

const INTERNATIONAL_DELIVERY_SEL = ["[class*=d-shipping]", "#cbthlp"].join("|");

export const getRuleDeliveryResultValue = async (
  product: IProduct,
  hrefSelector: string,
  weight: number,
  ruleName: string
): Promise<IRuleResult> => {
  const downloader = new eBayProductDownloader(product);
  const html = await downloader.download();
  const deliveryInfoTxt: string = getAvailableSelector(
    DELIVERY_SEL,
    html,
    false,
    false,
    (el) => ebayDeliveryTextToDate(el.textContent) !== null
  )?.textContent;
  const internationalDelivery = getAvailableSelector(INTERNATIONAL_DELIVERY_SEL, html)
    ?.textContent?.toLowerCase()
    .includes("international");
  const { score, days } = calculateDeliveryValueAlgorithm(deliveryInfoTxt, internationalDelivery);

  if (Number.isNaN(days)) {
    return {
      name: ruleName,
      weight: 0,
      value: 0,
      isValidRule: false
    };
  }

  const normalizeValue: number = score;
  const isValid = normalizeValue != null;
  const tooltipSummary: IRuleSummaryTooltip = getDeliverySummaryTooltip(normalizeValue, days);

  const res: IRuleResult = {
    name: ruleName,
    value: normalizeValue,
    weight,
    isValidRule: isValid,
    tooltipSummary
  };
  return res;
};
