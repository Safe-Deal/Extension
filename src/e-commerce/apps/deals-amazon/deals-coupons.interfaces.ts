export interface IAmazonCouponProduct {
  title: string;
  url: string;
  productUrl?: string;
  imageUrl?: string;
  asin?: string;
  currency?: string;
  price: number;
  priceString?: string;
  finalPrice?: number;
  discountPrice?: number;
  discountPercent?: number;
  reviewsCount?: number;
  rating?: number;
  reviewCountNumber?: number;
  ratingNumber?: number;
}

export interface IAmazonCouponAnalyzerProps {
  url?: string;
  domainUrl: string;
  dom: any;
}
