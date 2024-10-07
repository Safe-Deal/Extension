import { useAuthStore } from "@store/AuthState";
import { debug } from "../../utils/analytics/logger";
import { ApiDownloader } from "../../utils/downloaders/apiDownloader";

export const buildAiReviewsAlibabaSummarizationUrl = (store, productId) =>
  `/wholesale-stores/${store}/products/${productId}/reviews/summaries`;

const summarizeAlibabaReviewsByAI = async (store, productId, storeFeedbackUrl) => {
  const url: string = buildAiReviewsAlibabaSummarizationUrl(store, productId);
  const api = new ApiDownloader(url);
  const session = useAuthStore.getState().session;
  const headers = {
    Authorization: `Bearer ${session?.access_token}`
  };

  debug(`Sending summarizeAlibabaReviewsByAI #${productId} `, "summarizeAlibabaReviewsByAI");
  const response = await api.post(
    {
      storeFeedbackUrl
    },
    headers
  );
  debug(
    `Received summarizeAlibabaReviewsByAI #${productId}  ${response?.storeReviewsList?.length}`,
    "summarizeAlibabaReviewsByAI"
  );
  return response;
};

export { summarizeAlibabaReviewsByAI };
