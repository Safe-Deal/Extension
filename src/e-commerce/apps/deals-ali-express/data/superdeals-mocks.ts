import { ISuperDealProduct } from "../common/interfaces";

export const SupeDealsMocks: ISuperDealProduct[] = [
  {
    id: "1",
    title: "Product 1",
    dealImagesType: ["SuperDeal"],
    currency: "$",
    originPriceString: "$29.33",
    originPrice: 29.33,
    finalPrice: 26.4,
    discount: 2.93,
    discountPercent: 10,
    extraDiscount: "US $3 off every US $20",
    productUrl: "https://www.aliexpress.com/dp/1005005071813811",
    imageUrl: "https://ae01.alicdn.com/kf/S7aaff9edf5ba4a1085ce2e2c16ebf149g/mens.jpg_.webp",
    rating: 4.4,
    productSoldAmount: 200,
    shippingDetails: {
      shippingDeliveryDay: "30 days",
      freeShipping: "Free Shipping"
    }
  },
  {
    id: "2",
    title: "Product 2",
    dealImagesType: ["SuperDeal"],
    currency: "$",
    originPriceString: "$30.33",
    originPrice: 30.33,
    finalPrice: 22.4,
    discount: 2.93,
    discountPercent: 10,
    extraDiscount: "US $3 off every US $20",
    productUrl: "https://www.aliexpress.com/dp/B07XQ2XZLX",
    imageUrl: "https://ae01.alicdn.com/kf/Sd8e5dbaa717e4f10b1effcee8e4675dee/SHSHD.jpg_.webp",
    rating: 4.4,
    productSoldAmount: 200,
    shippingDetails: {
      shippingDeliveryDay: "30 days",
      freeShipping: "Free Shipping"
    }
  }
];
