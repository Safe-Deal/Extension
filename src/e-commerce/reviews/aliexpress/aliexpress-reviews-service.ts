import { get } from "lodash";
import { DownloadResult, Remote } from "../../../utils/downloaders/remote/remoteFetcher";
import { VERSION } from "../../../utils/extension/utils";
import { summarizeReviewsByAI } from "../reviews-service";
import { getReviewImagesUrls, getReviewsFeedbackText } from "../reviews-utils";
import { ReviewsResponse } from "../reviews-worker";
import { getDomain, getLTD } from "../../../utils/dom/html";
import { getAliExpressLangByDomainLtd } from "../../../utils/multilang/languages";
import { ReviewSummaryData } from "../reviews-types";
import { ProductStore } from "../../engine/logic/conclusion/conclusion-product-entity.interface";

interface IReviews {
  flatReviews: any[];
  rating: number | string;
  totalReviews: number | string;
}

const getAliExpressRussiaReviews = async (productId: string): Promise<IReviews> => {
  const url = `https://aliexpress.ru/aer-jsonapi/review/v2/desktop/product/reviews?product_id=${productId}&_bx-v=2.5.13`;
  const json1 = { productId, pageSize: 20, page: 1, sortValue: "USEFUL", filtrationValues: [] };
  const json2 = { productId, pageSize: 20, page: 1, sortValue: "NEW", filtrationValues: [] };
  const json3 = { productId, pageSize: 20, page: 1, sortValue: "LOW_GRADE", filtrationValues: [] };
  const json4 = { productId, pageSize: 20, page: 1, sortValue: "HIGH_GRADE", filtrationValues: [] };
  const promises = [
    Remote.postJson(url, json1),
    Remote.postJson(url, json2),
    Remote.postJson(url, json3),
    Remote.postJson(url, json4)
  ];
  const results = await Promise.all(promises);

  const allReviews = results.map((result) => result?.response?.data?.payload?.reviews).flat();
  const flatReviews = allReviews.map((review) => ({
    buyerTranslationFeedback: review?.text,
    buyerProductFeedBack: review?.text,
    images: review?.images ? review.images.map((img: any) => img.url) : []
  }));

  const totalReviews = allReviews?.length || 0;
  const totalRating = allReviews?.reduce((sum, review) => sum + (review?.grade || 0), 0) || 0;
  const rating = totalReviews ? totalRating / totalReviews : 0;

  return { flatReviews, rating, totalReviews };
};

const fetchAllProductReviewsAliExpress = async (
  productId: string,
  dom: any,
  domain: string
): Promise<DownloadResult[]> => {
  const hostname = getDomain(domain);
  if (!hostname) {
    throw new Error("Hostname is null or undefined");
  }
  let ltd = getLTD(hostname);
  const lang = getAliExpressLangByDomainLtd(hostname);
  const country = ltd === "com" ? "US" : ltd.toUpperCase();
  if (ltd === "us") {
    ltd = "com";
  }
  const urls = [
    `https://feedback.aliexpress.${ltd}/pc/searchEvaluation.do?productId=${productId}&lang=${lang}&country=${country}&page=1&pageSize=20&filter=all&sort=complex_default`
  ];

  const promises = urls.map((url) => Remote.getJson(url));
  const results = await Promise.all(promises);
  return results;
};

const getReviewsFromProductAliExpress = async (data: any): Promise<IReviews> => {
  const productId = get(data, "productId");
  const dom = get(data, "document");
  const domain = get(data, "siteUrl");
  const allReviews = await fetchAllProductReviewsAliExpress(productId, dom, domain);
  const arrayOfArray: any[] = allReviews?.map((items) => items?.response?.data?.evaViewList);
  const rating: string = allReviews
    ?.map((item) => item?.response?.data?.productEvaluationStatistic?.evarageStar)
    .join("");
  const totalReviews: string = allReviews?.map((item) => item?.response?.data?.totalNum).join("");
  const flatReviews = arrayOfArray.flat();

  return { flatReviews, rating, totalReviews };
};

const analyze = async (data: ReviewSummaryData): Promise<ReviewsResponse> => {
  const store = get(data, "store");
  const productId = get(data, "productId");
  let reviewsSummary = [];
  let error: string;
  const engine =
    store === ProductStore.ALI_EXPRESS ? getReviewsFromProductAliExpress(data) : getAliExpressRussiaReviews(productId);
  const { flatReviews, rating, totalReviews } = await engine;
  const reviewsDtoForAISummarization = getReviewsFeedbackText(flatReviews);
  const reviewsImages = getReviewImagesUrls(flatReviews) || [];

  if (reviewsDtoForAISummarization && reviewsDtoForAISummarization.length > 0) {
    ({ reviewsSummary = [], error = null } = await summarizeReviewsByAI(
      store,
      productId,
      reviewsDtoForAISummarization,
      reviewsImages,
      data.lang
    ));

    return {
      reviewsSummary,
      error,
      reviewsImages,
      ver: VERSION,
      totalReviews,
      rating
    };
  }

  return {
    reviewsSummary: [],
    reviewsImages,
    error: null,
    ver: VERSION,
    totalReviews: null,
    rating: null
  };
};

export const AliExpressReviewsService = {
  analyze
};
