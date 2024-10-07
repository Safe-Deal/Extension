import { debug } from "../../utils/analytics/logger";
import { ApiDownloader } from "../../utils/downloaders/apiDownloader";
import { LOCALE } from "../../utils/extension/locale";

export const AI_REVIEW_SUMMARIZATION_URL = (store, productId, lang = LOCALE) =>
  `/products/${store}/${productId}/reviews/summaries?lang=${lang}`;

const summarizeReviewsByAI = async (store, productId, reviews: any[], images: any[], lang = LOCALE) => {
  const url = AI_REVIEW_SUMMARIZATION_URL(store, productId, lang);
  const api = new ApiDownloader(url);
  reviews.push({ reviewsImages: images });
  debug(`Sending summarizeReviewsByAI #${productId} reviews count ${reviews?.length}`, "summarizeReviewsByAI");
  const response = await api.post(reviews);
  debug(`Received summarizeReviewsByAI #${productId}  ${response?.reviewsSummary?.length}`, "summarizeReviewsByAI");
  return response;
};

export { summarizeReviewsByAI };
