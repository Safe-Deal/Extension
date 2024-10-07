import { RULE_VALUE } from "../../../../../../constants/rule-value";
import { debug } from "../../../../../../utils/analytics/logger";

const reject = () => {
  debug("Rule Pricing: Current Product Pricing is Invalid");
  return false;
};

const isValid = (priceHistory) => {
  if (!priceHistory) {
    return reject();
  }

  if (priceHistory.error) {
    return reject();
  }

  if (!priceHistory.minPrice || !priceHistory.maxPrice) {
    return reject();
  }

  if (priceHistory?.price && priceHistory?.price?.length === 0) {
    return reject();
  }

  return true;
};

const getPriceClosestToToday = (data): number => {
  const today = new Date();
  data.sort((a, b) => {
    const distanceA = Math.abs(new Date(a.date).getTime() - today.getTime());
    const distanceB = Math.abs(new Date(b.date).getTime() - today.getTime());
    return distanceA - distanceB;
  });
  const closest = data[0];
  return (parseFloat(closest.minPrice) + parseFloat(closest.maxPrice)) / 2;
};

export const calculateProductPricingAlgorithm = (priceHistory): any => {
  try {
    if (!isValid(priceHistory)) {
      return null;
    }

    const productPrice = getPriceClosestToToday(priceHistory.price);
    const productPrices = priceHistory?.price;

    const minPrices = productPrices.filter((p) => !isNaN(parseFloat(p.minPrice))).map((p) => parseFloat(p.minPrice));
    const maxPrices = productPrices.filter((p) => !isNaN(parseFloat(p.maxPrice))).map((p) => parseFloat(p.maxPrice));

    const sumMin = minPrices.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const minAvg = sumMin / minPrices.length;

    const sumMax = maxPrices.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const maxAvg = sumMax / maxPrices.length;

    const minMaxAvg = parseFloat(((minAvg + maxAvg) / 2).toFixed(2));

    const percentage = (productPrice / minMaxAvg) * 100;
    const ratioFromAvgPrice = percentage - 100;

    let normalizeValue: number = RULE_VALUE.RULE_VAL_1;
    const isDiscounted = ratioFromAvgPrice < 0;
    const ratio = Math.abs(ratioFromAvgPrice);

    if (isDiscounted) {
      if (ratio <= 20) {
        normalizeValue = RULE_VALUE.RULE_VAL_3;
      }

      if (ratio >= 20) {
        normalizeValue = RULE_VALUE.RULE_VAL_5;
      }

      if (ratio >= 55) {
        normalizeValue = RULE_VALUE.RULE_VAL_6;
      }
    } else if (ratio >= 38) {
      normalizeValue = RULE_VALUE.RULE_VAL_2;
    } else if (ratio <= 8) {
      normalizeValue = RULE_VALUE.RULE_VAL_7;
    } else {
      normalizeValue = RULE_VALUE.RULE_VAL_1;
    }

    return { normalizeValue, ratio: ratioFromAvgPrice };
  } catch (error) {
    debug(error);
    return null;
  }
};
