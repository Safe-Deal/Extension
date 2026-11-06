import { get } from "lodash";
import { getAllAvailableSelectors, getDomain, parseAsHtml } from "../../../utils/dom/html";
import { DownloadResult } from "../../../utils/downloaders/remote/remoteFetcher";
import { VERSION } from "../../../utils/extension/utils";
import { summarizeReviewsByAI } from "../reviews-service";
import { ReviewsResponse } from "../reviews-worker";
import { debug } from "../../../utils/analytics/logger";
import { ReviewSummaryData } from "../reviews-types";
import AmazonFeedbackDownloader, { REVIEWS_TYPE } from "../../engine/stores/amazon/product/amazon-feedback-downloader";
import { cleanNonVisibleChars } from "../../../utils/text/strings";

const fetchReviewsFromAmazon = async (
  productId: string,
  siteUrl: string,
  regenerate = false
): Promise<DownloadResult[]> => {
  const domain = getDomain(siteUrl);
  const downloaders = [
    new AmazonFeedbackDownloader(productId, domain),
    new AmazonFeedbackDownloader(productId, domain, REVIEWS_TYPE.POSITIVE),
    new AmazonFeedbackDownloader(productId, domain, REVIEWS_TYPE.NEGATIVE)
  ];
  if (regenerate) {
    downloaders.forEach((downloader) => downloader.invalidateCache());
  }

  const results = await Promise.all(downloaders.map((downloader) => downloader.download()));

  return results;
};

const REVIEW_TITLE_SELECTORS = [".review-title-content", "[data-hook=review-title]", ".review-title"].join("|");
const REVIEW_CONTENT_SELECTORS = [".review-text", "[data-hook=review-body]", ".review-text-content"].join("|");
const COUNT_PATTERN = /\d[\d.,]*[KkMm]?/;

const extractProductPageStats = (doc: string) => {
  const docDom: any = parseAsHtml(doc);
  const imageSelectors = `img[class*="-thumbnail-image"]`;
  const totalReviewsSelector = "span#acrCustomerReviewText";
  const ratingSelector = "span.a-icon-alt";

  const allImagesEl = getAllAvailableSelectors(imageSelectors, docDom, true);
  const allImages: string[] = allImagesEl.map((item) => item.getAttribute("src"));
  const allImagesBigResolution: string[] = allImages.map((item) => item.replace(/._SY\d+_/g, ""));

  const totalReviewsEl = getAllAvailableSelectors(totalReviewsSelector, docDom, true);
  const ratingEl = getAllAvailableSelectors(ratingSelector, docDom, true);

  const totalReviews = totalReviewsEl.length > 0 ? (totalReviewsEl[0].textContent.match(COUNT_PATTERN)?.[0] ?? "") : "";
  const rating = ratingEl.length > 0 ? ratingEl[0].textContent.split(" ")?.[0] : "";

  return { allImagesBigResolution, totalReviews, rating };
};

const fetchAllProductReviewsAmazon = async (
  productId: string,
  doc: any,
  siteUrl: string,
  regenerate = false
): Promise<{
  reviewsTitle: string[];
  reviewsContent: string[];
  allImagesBigResolution: string[];
  totalReviews: string;
  rating: string;
}> => {
  const productPageStats = extractProductPageStats(doc);
  const textResponsesHtml = ((await fetchReviewsFromAmazon(productId, siteUrl, regenerate)) ?? []).filter(Boolean);
  if (textResponsesHtml.length === 0) {
    debug("fetchAllProductReviewsAmazon::textResponseList is empty - returning no review text");
  }
  const result = textResponsesHtml.map((textResponse) => {
    const reviewsTitle = getAllAvailableSelectors(REVIEW_TITLE_SELECTORS, textResponse).map((itm) =>
      cleanNonVisibleChars(itm?.textContent)
    );

    const reviewsContent = getAllAvailableSelectors(REVIEW_CONTENT_SELECTORS, textResponse).map((itm) =>
      cleanNonVisibleChars(itm?.textContent)
    );

    return {
      reviewsTitle,
      reviewsContent
    };
  });

  const flattenedResult = result.reduce(
    (acc, obj) => {
      acc.reviewsTitle = acc.reviewsTitle.concat(obj.reviewsTitle);
      acc.reviewsContent = acc.reviewsContent.concat(obj.reviewsContent);
      return acc;
    },
    { reviewsTitle: [], reviewsContent: [] }
  );

  return {
    reviewsTitle: flattenedResult.reviewsTitle,
    reviewsContent: flattenedResult.reviewsContent,
    ...productPageStats
  };
};

const getReviewsFromProductAmazon = async (data: any) => {
  const productId = get(data, "productId");
  const doc = get(data, "document");
  const siteUrl = get(data, "siteUrl");
  const regenerate = Boolean(get(data, "regenerate"));
  const { reviewsTitle, reviewsContent, allImagesBigResolution, totalReviews, rating } =
    await fetchAllProductReviewsAmazon(productId, doc, siteUrl, regenerate);
  return { reviewsTitle, reviewsContent, allImagesBigResolution, totalReviews, rating };
};

const analyze = async (data: ReviewSummaryData): Promise<ReviewsResponse> => {
  const store = get(data, "store");
  const productId = get(data, "productId");
  const { reviewsContent, allImagesBigResolution = [], totalReviews, rating } = await getReviewsFromProductAmazon(data);
  if (!reviewsContent?.length) {
    // Amazon lists ratings on the product page but served no review text (sign-in wall, block, failed
    // download): that is "unavailable", not "no reviews". Zero is only confirmed when the page lists no ratings.
    return {
      reviewsSummary: [],
      error: null,
      reviewsImages: allImagesBigResolution,
      totalReviews: totalReviews || null,
      rating: rating || null,
      unavailable: Boolean(totalReviews),
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

export const AmazonReviewsService = {
  fetchAllProductReviewsAmazon,
  analyze
};
