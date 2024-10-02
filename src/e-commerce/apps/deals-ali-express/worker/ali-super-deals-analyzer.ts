import { HTMLElement } from "node-html-parser";
import { ISuperDealProduct } from "../common/interfaces";
import {
  getId,
  getProductSuperDealImageTypes,
  getCurrency,
  getOriginPriceString,
  getOriginPrice,
  getFinalPrice,
  getDiscount,
  getDiscountPercent,
  getShippingDetails,
  getProductUrl,
  getTitle,
  getImage,
  getRating,
  getProductSoldAmount
} from "./ali-super-deals-scrape-data";
import { getPartialSuperDeals } from "./ali-super-deals-utils";

const getAliExpressSuperDeals = ({ dom }: { dom: Document }): ISuperDealProduct[] => {
  const partialSuperDealsComponentElements: HTMLElement[] | any[] = getPartialSuperDeals(dom);

  return partialSuperDealsComponentElements.map((productElement: HTMLElement) => {
    const id = getId(productElement);
    const dealImagesType: string[] = getProductSuperDealImageTypes(productElement); // SuperDeal, Welcome, etc...
    const currency: string = getCurrency(productElement); // US $
    const originPriceString: string = getOriginPriceString(productElement);
    const originPrice = getOriginPrice(originPriceString);
    const finalPrice: number = getFinalPrice(productElement);
    const discount: number = getDiscount(originPrice, finalPrice); // "10"
    const discountPercent: number = getDiscountPercent(originPrice, finalPrice); // 10 -> which means 10%
    const shippingDetails = getShippingDetails(productElement); // "Free Shipping"
    const productUrl: string = getProductUrl(productElement);
    const title: string = getTitle(productElement);
    const imageUrl: string = getImage(productElement);

    const ratingNumber = getRating(productElement);
    const productSoldAmount = getProductSoldAmount(productElement);

    return {
      id,
      dealImagesType,
      currency, // "$" | € | £ | etc...
      originPriceString, // "$29.33"
      originPrice, // 29.33
      finalPrice, // 26.4
      discount, // 2.93
      discountPercent, // 10%
      shippingDetails, // { shippingDeliveryDay: "4 days left", freeShipping: "Free Shipping" }
      productUrl, // "https://www.aliexpress.com/dp/B07XQ2XZLX"
      title,
      imageUrl,
      rating: ratingNumber, // 4.4 (from text: "4.4 out of 5 stars")
      productSoldAmount // 200 sold
    };
  });

  // Run multiple times(5-10 pages forward, its can be configured) to get all coupons!!!

  // Optional: Save it on Cache - Need to verify if we need this cause in the API it came Out of the box

  // Send Back To Content to show them on screen
};

export { getAliExpressSuperDeals };
