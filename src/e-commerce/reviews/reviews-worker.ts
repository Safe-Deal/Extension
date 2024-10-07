import { debug, logError } from "../../utils/analytics/logger";
import { MemoryCache } from "../../utils/cashing/memoryCache";
import { REVIEW_SUMMARY_GLUE } from "../../utils/extension/glue";
import { VERSION } from "../../utils/extension/utils";
import { AlibabaReviewsService } from "../../supplier/reviews/alibaba-reviews-service";
import { ProductStore } from "../engine/logic/conclusion/conclusion-product-entity.interface";
import { AliExpressReviewsService } from "./aliexpress/aliexpress-reviews-service";
import { AmazonReviewsService } from "./amazon/amazon-reviews-service";
import { EbayReviewsService } from "./ebay/ebay-reviews-service";
import { ReviewSummaryData } from "./reviews-types";

const cash = new MemoryCache();

export interface ReviewsResponse {
  reviewsSummary: any[];
  error: string | null;
  reviewsImages: string[];
  ver: string;
  totalReviews: string | number | null;
  rating: string | number | null;
  reviewCount?: string;
  reviewsValue?: string;
}

export const reviewsSummaryWorker = async (dataRequest: ReviewSummaryData, sendResponse) => {
  const { store, productId, isSupplier, storeFeedbackUrl } = dataRequest;
  const cashingKey = `${store}_${productId}`;

  if (cash.has(cashingKey) && !dataRequest.regenerate) {
    const result = cash.get(cashingKey);
    sendResponse(result);
    debug(`Product #${productId} is already in processed returning from cash`, "Worker::reviewsSummaryWorker");
    return;
  }

  try {
    let reviewsResponse: ReviewsResponse = {
      reviewsSummary: [],
      error: null,
      reviewsImages: [],
      ver: VERSION,
      totalReviews: null,
      rating: null
    };

    switch (store) {
      case ProductStore.ALI_EXPRESS:
      case ProductStore.ALI_EXPRESS_RUSSIA:
        reviewsResponse = await AliExpressReviewsService.analyze(dataRequest);
        break;
      case ProductStore.AMAZON:
        reviewsResponse = await AmazonReviewsService.analyze(dataRequest);
        break;
      case ProductStore.EBAY:
        reviewsResponse = await EbayReviewsService.analyze(dataRequest);
        break;
      case ProductStore.ALIBABA:
        reviewsResponse = await AlibabaReviewsService.analyze(dataRequest);
        break;
      default:
        reviewsResponse = {
          reviewsImages: [],
          reviewsSummary: [],
          error: null,
          ver: VERSION,
          totalReviews: null,
          rating: null
        };
        break;
    }

    const response = {
      ...reviewsResponse
    };

    if (response?.error) {
      logError(
        new Error(
          JSON.stringify(
            {
              store,
              productId,
              error: response.error
            },
            null,
            2
          )
        ),
        `reviewsSummaryWorker:: ${response.error}`
      );
    } else {
      debug(
        `reviewsSummaryWorker:: reviewsSummary worker Response: reviewsSummary's -> ${response?.reviewsSummary?.length}`
      );
    }

    cash.set(cashingKey, response);
    sendResponse(response);
  } catch (error) {
    sendResponse({
      reviewsSummary: [],
      error: "Error in reviewsSummaryWorker",
      reviewsImages: [],
      ver: VERSION,
      totalReviews: null,
      rating: null
    });
    logError(error, "reviewsSummaryWorker:: Error in reviewsSummaryWorker");
  }
};

export const initReviewsSummarizeWorker = (): void => {
  REVIEW_SUMMARY_GLUE.worker(reviewsSummaryWorker);
};
