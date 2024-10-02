import { castAsNumber } from "../../../../../../utils/text/strings";

const getCouponsPerPage = (dom: Document): HTMLElement[] => {
  const allCouponsInPageNodeList: NodeListOf<Element> = dom?.querySelectorAll(
    "[data-component-type='s-coupon-component']"
  );
  return Array.from(allCouponsInPageNodeList) as HTMLElement[];
};

const getDiscountString = (productElement: HTMLElement): string =>
  productElement.querySelector(".s-coupon-highlight-color")?.textContent?.trim();

const getRatingNumber = (ratingFullText: string): number => {
  const ratingText: string = parseFloat(ratingFullText?.trim()?.split(" ")[0]?.replace(",", ".")).toFixed(1);
  return Number(ratingText);
};

const getReviewsCountAndRating = (productElement: HTMLElement): { reviewCountNumber: number; ratingNumber: number } => {
  const reviewAndRatingsElement = productElement.querySelectorAll("span[aria-label]");
  const [ratingElement, reviewCountElement] = Array.from(reviewAndRatingsElement) as HTMLElement[];
  const reviewCountText: string = reviewCountElement?.getAttribute("aria-label");
  const reviewCountNumber: number = castAsNumber(reviewCountText);

  const ratingFullText: string = ratingElement?.getAttribute("aria-label"); // 4.4 out of 5 stars
  const ratingNumber: number = getRatingNumber(ratingFullText);

  return { reviewCountNumber, ratingNumber };
};

// get title from productElement
const getTitle = (productElement: HTMLElement): string => {
  const titleElement: HTMLElement = productElement.querySelector("h2 a") as HTMLElement;
  return titleElement?.textContent?.trim();
};

// getUrl from productElement
const getUrl = (productElement: HTMLElement): string => {
  const titleElement: HTMLElement = productElement.querySelector("h2 a") as HTMLElement;
  return titleElement?.getAttribute("href");
};

// getImage from productElement
const getImage = (productElement: HTMLElement): string => {
  const imageElement: HTMLElement = productElement.querySelector("a img") as HTMLElement;
  return imageElement?.getAttribute("src");
};

// getAsin from productElement
const getAsin = (productElement: HTMLElement): string => productElement.getAttribute("data-asin");

// getCurrency from productElement
const getCurrency = (productElement: HTMLElement): string => {
  const priceElement: HTMLElement = productElement.querySelector("span.a-price span.a-price-symbol") as HTMLElement;
  return priceElement?.textContent?.trim();
};

// getPriceString from productElement
const getPriceString = (productElement: HTMLElement): string => {
  const priceElement: HTMLElement = productElement.querySelector("span.a-price span.a-offscreen") as HTMLElement;
  return priceElement?.textContent?.trim();
};

const getFinalPrice = (price: number, discount: number, isPercentage: boolean): number => {
  if (isPercentage) {
    const result: number = price - (price * discount) / 100;
    return parseFloat(result.toFixed(2));
  }
  const result: number = price - discount;
  return parseFloat(result.toFixed(2));
};

const getDiscountPrice = (price: number, discount: number, isPercentage: boolean): number => {
  if (isPercentage) {
    const result: number = (price * discount) / 100;
    return parseFloat(result.toFixed(2));
  }
  return parseFloat(discount.toFixed(2));
};

const getProductUrl = (url: string, domainUrl: string): string => {
  const queryParam: URLSearchParams = new URLSearchParams(url);
  const innerUrl = queryParam.get("url");
  return `${domainUrl}/${innerUrl}`;
};

const discountPercent = (discountPrice: number, price: number): number => {
  const result: number = Math.round(discountPrice ? (discountPrice / price) * 100 : 0);
  return parseFloat(result.toFixed(2));
};

export {
  discountPercent,
  getAsin,
  getCouponsPerPage,
  getCurrency,
  getDiscountPrice,
  getDiscountString,
  getFinalPrice,
  getImage,
  getPriceString,
  getProductUrl,
  getReviewsCountAndRating,
  getTitle,
  getUrl
};
