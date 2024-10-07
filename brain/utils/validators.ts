import { z } from "zod";
import { logError } from "@utils/analytics/logger";

const productSchema = z.object({
  product: z.object({
    id: z.string(),
    category: z.string(),
    source: z.string(),
    domain: z.string(),
    title: z.string(),
    conclusion: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    locale: z.string(),
    product: z.object({}),
    rules: z.array(
      z.object({
        name: z.string(),
        i18n: z.string()
      })
    ),
    ver: z.string()
  }),
  reviews: z.object({
    reviewsSummary: z.array(
      z.object({
        reviews: z.array(z.string()),
        section: z.string()
      })
    ),
    reviewsImages: z.array(z.string()),
    ver: z.string(),
    totalReviews: z.string(),
    rating: z.string()
  })
});

export const validateProductResponse = (data) => {
  try {
    productSchema.parse(data);
    return true;
  } catch (e) {
    const formattedErrors = e.errors.map((err) => ({
      path: err.path.join(" -> "),
      message: err.message
    }));

    logError(new Error(`Product validation failed: ${JSON.stringify(formattedErrors)}`), "ProductResponseValidation");
    return false;
  }
};
