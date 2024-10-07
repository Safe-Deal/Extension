import { get } from "lodash";
import { ReviewSummaryData } from "@e-commerce/reviews/reviews-types";
import { ReviewsResponse } from "@e-commerce/reviews/reviews-worker";
import { VERSION } from "../../utils/extension/utils";
import { summarizeAlibabaReviewsByAI } from "./reviews-service";

interface IReviews {
  reviewsSummary: any[];
  reviewsImages: string[];
  totalReviews?: string | number | null;
  reviewsValue?: string | number | null;
  reviewCount?: string | number | null;
}

const getReviewsFromProductAlibaba = async (data: ReviewSummaryData): Promise<IReviews> => {
  const store = get(data, "store");
  const productId = get(data, "productId");
  const storeFeedbackUrl = get(data, "storeFeedbackUrl");
  const res: IReviews = await summarizeAlibabaReviewsByAI(store, productId, storeFeedbackUrl);
  return res;
};

const analyze = async (data: ReviewSummaryData): Promise<ReviewsResponse> => {
  const res = await getReviewsFromProductAlibaba(data);

  return {
    reviewsSummary: res.reviewsSummary,
    reviewsImages: res.reviewsImages,
    error: null,
    ver: VERSION,
    totalReviews: res?.reviewCount,
    rating: res?.reviewsValue
  };
};

export const AlibabaReviewsService = {
  analyze
};
