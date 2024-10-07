import { SiteUtil } from "../../../src/e-commerce/engine/logic/utils/site-utils";
import { ReviewSummaryData } from "../../../src/e-commerce/reviews/reviews-types";
import { reviewsSummaryWorker } from "../../../src/e-commerce/reviews/reviews-worker";
import { logError } from "../../../src/utils/analytics/logger";
import { downloadProduct } from "../../middleware/download-product";
import { ProcessProductData } from "../brain-worker";

export const processReviews = async (data: ProcessProductData) => {
  const store = SiteUtil.getStore(data.url.url);
  const document = await downloadProduct(data);
  const request: ReviewSummaryData = {
    productId: data.product.id,
    document,
    store,
    siteUrl: data.url.url,
    lang: data.lang,
    regenerate: data.regenerate
  };

  const result = new Promise((resolve) => {
    try {
      reviewsSummaryWorker(request, resolve);
    } catch (error) {
      resolve({
        reviewsSummary: [],
        reviewsImages: [],
        error
      });
      logError(error);
    }
  });

  return result;
};
