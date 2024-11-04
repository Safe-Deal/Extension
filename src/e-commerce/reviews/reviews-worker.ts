import { initReviewSummaryStoreBackend } from "@store/ReviewSummaryState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { debug, logError } from "../../utils/analytics/logger";
import { MemoryCache } from "../../utils/cashing/memoryCache";
import { VERSION } from "../../utils/extension/utils";
import { AlibabaReviewsService } from "../../supplier/reviews/alibaba-reviews-service";
import { ProductStore } from "../engine/logic/conclusion/conclusion-product-entity.interface";
import { AliExpressReviewsService } from "./aliexpress/aliexpress-reviews-service";
import { AmazonReviewsService } from "./amazon/amazon-reviews-service";
import { EbayReviewsService } from "./ebay/ebay-reviews-service";
import { ReviewSummaryData } from "./reviews-types";

const cache = new MemoryCache();

export enum ReviewSummaryMessageType {
  GENERATE_REVIEW_SUMMARY = "reviewSummary"
}
export interface IReviewSummaryMessageBus {
  [ReviewSummaryMessageType.GENERATE_REVIEW_SUMMARY]: (data: ReviewSummaryData) => Promise<void>;
}

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

export const initReviewsSummarizeWorker = async (): Promise<void> => {
  const store = await initReviewSummaryStoreBackend();
  debug("ReviewSummaryStore:: Review Summary Store ready!", store);
  const { onMessage } = definePegasusMessageBus<IReviewSummaryMessageBus>();

  onMessage(ReviewSummaryMessageType.GENERATE_REVIEW_SUMMARY, async (dataRequest) => {
    if (!dataRequest || !dataRequest.data) {
      // It is expected, no need to log error
      debug("Invalid dataRequest", "reviewsSummaryWorker:: Invalid dataRequest");
      return;
    }

    const { setReviewData, setIsLoading, setError } = store.getState();
    const data = dataRequest.data;
    const { store: productStore, productId, regenerate } = data;
    setIsLoading(true);

    if (!productStore || !productId) {
      // It is expected, no need to log error
      debug("Missing productStore or productId", "reviewsSummaryWorker:: Missing required data");
      setIsLoading(false);
      return;
    }

    const cachingKey = `${productStore}_${productId}`;

    setIsLoading(true);
    if (cache.has(cachingKey) && !regenerate) {
      const result = cache.get(cachingKey);
      if (result) {
        setReviewData(result);
        setIsLoading(false);
        debug(`Product #${productId} is already processed returning from cache`, "Worker::reviewsSummaryWorker");
        return;
      }
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

      switch (productStore) {
        case ProductStore.ALI_EXPRESS:
        case ProductStore.ALI_EXPRESS_RUSSIA:
          reviewsResponse = await AliExpressReviewsService.analyze(data);
          break;
        case ProductStore.AMAZON:
          reviewsResponse = await AmazonReviewsService.analyze(data);
          break;
        case ProductStore.EBAY:
          reviewsResponse = await EbayReviewsService.analyze(data);
          break;
        case ProductStore.ALIBABA:
          reviewsResponse = await AlibabaReviewsService.analyze(data);
          break;
        default:
          debug(`Unsupported product store: ${productStore}`);
      }

      if (reviewsResponse.error) {
        logError(
          new Error(
            JSON.stringify(
              {
                productStore,
                productId,
                error: reviewsResponse.error
              },
              null,
              2
            )
          ),
          `reviewsSummaryWorker:: ${reviewsResponse.error}`
        );
        setError(reviewsResponse.error);
      } else {
        debug(
          `reviewsSummaryWorker:: reviewsSummary worker Response: reviewsSummary's -> ${reviewsResponse?.reviewsSummary?.length ?? 0}`
        );
        cache.set(cachingKey, reviewsResponse);
        setReviewData(reviewsResponse);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Error in reviewsSummaryWorker: ${errorMessage}`);
      logError(error, `reviewsSummaryWorker:: Error in reviewsSummaryWorker: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  });
};
