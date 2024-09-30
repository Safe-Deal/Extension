enum MESSAGE_TYPE {
  SUPER_DEALS_SEARCH_ON_WHOLESALE = "SUPER_DEALS_SEARCH_ON_WHOLESALE",
  SUPER_DEALS_ANALYZER = "SUPER_DEALS_ANALYZER"
}

interface AliSuperDealsMessageRequest {
  pageDocument: Document | any;
}

interface IBrowserMessageRequest {
  action: MESSAGE_TYPE;
  metadata: {
    pageDocument: Document | any;
  };
  data: any;
}

interface ISuperDealProduct {
  id: string;
  title: string;
  dealImagesType: string[]; // SuperDeal, Welcome, etc...
  currency: string; // "$" | € | £ | etc...
  originPriceString: string; // "$29.33"
  originPrice: number; // 29.33
  finalPrice: number; // 26.4
  discount: number; // 2.93
  discountPercent: number; // 10%
  extraDiscount?: string; // "US $3 off every US $20"
  productUrl: string; // "https://www.aliexpress.com/dp/B07XQ2XZLX"
  imageUrl: string;
  rating: number; // 4.4 (from text: "4.4 out of 5 stars")
  productSoldAmount: number; // 200 sold
  shippingDetails?: {
    shippingDeliveryDay?: string; // "Estimated Delivery Time: 15-60 days"
    freeShipping?: string; // "Free Shipping"
  };
}

export { IBrowserMessageRequest, MESSAGE_TYPE, ISuperDealProduct, AliSuperDealsMessageRequest };
