import { HTMLElement } from "node-html-parser";

// get all images types from product element
const getProductSuperDealImageTypes = (productElement: HTMLElement): string[] => {
  const dealEl: HTMLElement = productElement.querySelector(".rax-view-v2 .iconContainer:not(:empty)");
  const dealImagesEl = dealEl?.querySelectorAll("img[src]") || [];
  return Array.from(dealImagesEl).map((element) => element.getAttribute("src"));
};

// get product id from product element
const getId = (productElement: HTMLElement) => productElement.id || null;

// get marketing info container element
const getMarketingInfoContainerEl = (productElement: HTMLElement): HTMLElement =>
  productElement.querySelector(".marketingInfoContainer");

// get currency from product element
const getCurrency = (productElement: HTMLElement): string => {
  const priceWithCurrency =
    getMarketingInfoContainerEl(productElement).querySelector(".rax-text-v2--singleline").textContent;
  const regex = /[^0-9.]/g;
  return priceWithCurrency.match(regex).join(""); // 22.2$ -> $
};

// get origin price string from product element
const getOriginPriceString = (productElement: HTMLElement): string =>
  getMarketingInfoContainerEl(productElement).querySelector(".rax-text-v2.rax-text-v2--singleline:last-child")
    .textContent;

const getOriginPrice = (priceString = ""): number => (priceString ? getNumberFromString(priceString) : 0);

const getNumberFromString = (inputString: string): number =>
  parseFloat(inputString.replace(",", ".").replace(/[^0-9,.]/g, ""));

const getFinalPrice = (productElement: HTMLElement): number => {
  const priceSaleEl: HTMLElement = getMarketingInfoContainerEl(productElement);
  const finalPriceStr = priceSaleEl?.querySelector("div > div:nth-child(2)")?.textContent;
  return finalPriceStr ? getNumberFromString(finalPriceStr) : 0;
};

const getDiscount = (originPrice = 0, finalPrice = 0): number => parseFloat((originPrice - finalPrice).toFixed(2));

const getDiscountPercent = (originPrice = 1, finalPrice = 0): number => {
  const discount = finalPrice / originPrice;
  const discountPercent = 1 - discount;
  return parseFloat((discountPercent * 100).toFixed(2));
};

const getProductUrl = (productElement: HTMLElement): string => {
  const productId = getId(productElement);
  return `https://www.aliexpress.com/item/${productId}.html?sourceType=562`;
};

const getTitle = (productElement: HTMLElement): string => productElement.querySelector(".prodTitle")?.textContent || "";

const getImage = (productElement: HTMLElement): string => {
  const imageContainerEl: HTMLElement = productElement.querySelector("[id*=\"main_img_container\"]");
  const imageEl = imageContainerEl.querySelector("img");
  return imageEl ? imageEl.getAttribute("src") : "";
};

const getRating = (productElement: HTMLElement): number => {
  const ratingContainerEl: HTMLElement = productElement.querySelector(".lte-icon");
  const ratingEl = ratingContainerEl ? ratingContainerEl?.nextElementSibling : 0;
  return ratingEl ? getNumberFromString(ratingEl.textContent) : 0;
};

const getProductSoldAmount = (productElement: HTMLElement): number => {
  const ordersReviewContainerEl: HTMLElement = productElement.querySelector(".ordersReviewContainer");
  const productSoldAmountEl = ordersReviewContainerEl?.firstChild;
  return productSoldAmountEl ? getNumberFromString(productSoldAmountEl?.textContent) : 0;
};

const getShippingDetails = (productElement: HTMLElement): { shippingDeliveryDay: string; freeShipping: string } => {
  const shippingDetailsEl: HTMLElement = productElement.querySelector(".logisticsAtmContainer");
  const shippingDetailsText: string = shippingDetailsEl ? shippingDetailsEl?.textContent : "";
  const [freeShippingStr, shippingDeliveryDayStr] = shippingDetailsText.split("·");
  const shippingDeliveryDay = shippingDeliveryDayStr?.trim();
  const freeShipping = freeShippingStr?.trim();
  return { shippingDeliveryDay, freeShipping };
};

export {
  getId,
  getCurrency,
  getOriginPriceString,
  getOriginPrice,
  getFinalPrice,
  getDiscount,
  getDiscountPercent,
  getProductUrl,
  getTitle,
  getImage,
  getRating,
  getProductSoldAmount,
  getShippingDetails,
  getProductSuperDealImageTypes,
  getMarketingInfoContainerEl
};
