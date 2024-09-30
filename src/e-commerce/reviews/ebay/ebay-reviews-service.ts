import { get } from "lodash";
import { DownloadResult, Remote, HeadersType } from "../../../utils/downloaders/remote/remoteFetcher";
import { VERSION } from "../../../utils/extension/utils";
import { parseAsHtml, querySelectorAll } from "../../../utils/dom/html";
import { summarizeReviewsByAI } from "../reviews-service";
import { ReviewsResponse } from "../reviews-worker";
import { ReviewSummaryData } from "../reviews-types";
import { getProductFeedbackValues } from "../../engine/stores/ebay/rules/product-feedback/product-feedback-rule-result";

const STORE_FEEDBACK_SELECTORS = [".fdbk-detail-list__tabbed-btn", ".fdbk-detail-list__btn-container a"];
const FEEDBACK_TEXT_SELECTORS = [
  ".fdbk-container__details__comment",
  "[data-testid=feedback-cards] .fdbk-container__details__comment",
  ".card__comment span"
];

const IMAGE_SELECTORS = [".fdbk-container__details__image img", ".card__image img"];
const PRODUCT_REVIEWS_PANEL = [".tabs__content > .tabs__panel:first-child"];

const fetchReviewsFromEbay = async (url: string): Promise<DownloadResult[]> => {
  if (!url) {
    return [];
  }
  const urls = Array(url);
  const promises = urls.map((url) => Remote.get(url, true, true, HeadersType.NONE));
  const results = await Promise.all(promises);
  return results;
};

const fetchAllProductReviewsEbay = async (
  doc: any
): Promise<{
  reviewsTitle: string[];
  reviewsContent: string[];
  allImagesBigResolution: string[];
  rating: string;
  totalReviews: string;
}> => {
  const docDom = parseAsHtml(doc);
  const storeFeedbackUrlEl = querySelectorAll(STORE_FEEDBACK_SELECTORS, docDom);
  const storeFeedbackUrl = storeFeedbackUrlEl.map((item) => item.getAttribute("href"));
  const { feedbackScoreValue: totalReviews = 0, productFeedbackPercentageValue: ratingPercentage = 0 } =
    getProductFeedbackValues(docDom);
  let rating = 0;
  const storeFeedbackLink = storeFeedbackUrl?.[0];
  const feedbackResponses: DownloadResult[] = await fetchReviewsFromEbay(storeFeedbackLink);

  const positiveFeedbacksUrl = `${storeFeedbackLink}&sort=TIME&page_id=1&filter_image=false&overall_rating=POSITIVE`;
  const positiveFeedbacks: DownloadResult[] = await fetchReviewsFromEbay(positiveFeedbacksUrl);

  const negativeFeedbacksUrl = `${storeFeedbackLink}&sort=TIME&page_id=1&filter_image=false&overall_rating=NEGATIVE`;
  const negativeFeedbacks: DownloadResult[] = await fetchReviewsFromEbay(negativeFeedbacksUrl);

  feedbackResponses.push(...positiveFeedbacks, ...negativeFeedbacks);
  const feedbacksHtml = feedbackResponses?.map((textResponse) => parseAsHtml(textResponse?.response));

  if (ratingPercentage) {
    rating = (5 * ratingPercentage) / 100;
  }

  const result = feedbacksHtml?.map((html) => {
    const SELLER_REVIEW_TEXT = "Seller Feedback:";
    const reviewsTitle = [];
    const productReviewsContent = querySelectorAll(PRODUCT_REVIEWS_PANEL, html)
      .flatMap((panel) => querySelectorAll(FEEDBACK_TEXT_SELECTORS, panel))
      .map((itm) => itm?.textContent?.replace(/\\n/g, "").trim());

    const sellerFeedback = querySelectorAll(FEEDBACK_TEXT_SELECTORS, html).flatMap(
      (itm) => `${SELLER_REVIEW_TEXT} ${itm?.textContent?.replace(/\\n/g, "").trim()}`
    );

    return {
      reviewsTitle,
      reviewsContent: [productReviewsContent, sellerFeedback].flat()
    };
  });

  const flattenedResult = result?.reduce(
    (acc, obj) => {
      acc.reviewsTitle = acc?.reviewsTitle?.concat(obj.reviewsTitle);
      acc.reviewsContent = acc?.reviewsContent?.concat(obj.reviewsContent);
      return acc;
    },
    { reviewsTitle: [], reviewsContent: [] }
  );

  const allImagesBigResolution: string[] = [];

  feedbacksHtml.forEach((html) => {
    const images = querySelectorAll(PRODUCT_REVIEWS_PANEL, html).flatMap((panel) =>
      querySelectorAll(IMAGE_SELECTORS, panel)?.map((item) => item?.getAttribute("src"))
    );
    allImagesBigResolution.push(...images);
  });

  return {
    reviewsTitle: flattenedResult?.reviewsTitle,
    reviewsContent: flattenedResult?.reviewsContent,
    allImagesBigResolution,
    rating: rating.toFixed(1),
    totalReviews: totalReviews.toFixed(0)
  };
};

const getReviewsFromProductEbay = async (data: any) => {
  const dom = get(data, "document");
  const { reviewsTitle, reviewsContent, allImagesBigResolution, rating, totalReviews } =
    await fetchAllProductReviewsEbay(dom);

  return {
    reviewsTitle,
    reviewsContent,
    allImagesBigResolution,
    rating,
    totalReviews
  };
};

const analyze = async (data: ReviewSummaryData): Promise<ReviewsResponse> => {
  const store = get(data, "store");
  const productId = get(data, "productId");
  const { reviewsContent, allImagesBigResolution = [], rating, totalReviews } = await getReviewsFromProductEbay(data);

  if (!reviewsContent?.length) {
    return {
      reviewsSummary: [],
      error: null,
      reviewsImages: allImagesBigResolution,
      totalReviews,
      rating,
      ver: VERSION
    };
  }
  const { reviewsSummary = [], error = null } = await summarizeReviewsByAI(
    store,
    productId,
    reviewsContent,
    allImagesBigResolution,
    data.lang
  );

  const response: ReviewsResponse = {
    reviewsSummary,
    error,
    reviewsImages: allImagesBigResolution,
    ver: VERSION,
    totalReviews,
    rating
  };

  return response;
};

export const EbayReviewsService = {
  analyze,
  fetchAllProductReviewsEbay
};
