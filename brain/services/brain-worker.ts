import { IProduct } from "../../src/data/entities/product.interface";
import { MemoryCache } from "../../src/utils/cashing/memoryCache";
import { VERSION } from "../../src/utils/extension/utils";
import { ServerLogger } from "../utils/logging";
import { validateProductResponse } from "../utils/validators";
import { processReviews } from "./analysis/reviews";
import { processRules } from "./analysis/rules";

interface UrlData {
  url: string;
  pathName: string;
  domain: string;
}

export interface ProcessProductData {
  product: IProduct;
  url: UrlData;
  lang: string;
  regenerate: boolean;
}

export interface BrainProductResponse {
  product: IProduct;
  reviews: any;
  wasCashed: boolean;
  locale: string;
  ver: string;
  error?: string;
}

const cash = new MemoryCache();

export const processProduct = async (data: ProcessProductData): Promise<BrainProductResponse> => {
  const productId = data?.product?.id;
  const url = data?.url?.url;

  try {
    const cashingKey = `${data.url.domain}_${productId}`;
    if (cash.has(cashingKey) && !data.regenerate) {
      const result = cash.get(cashingKey);
      const isValid = validateProductResponse(result);
      if (isValid) {
        result.wasCashed = true;
        ServerLogger.log(`Product #${productId} is already in processed returning from cash`);
        return result;
      }
      ServerLogger.warn(`Product #${productId} cashed but invalid - reprocessing`);
      cash.delete(cashingKey);
    }

    ServerLogger.log(`Processing Product #${productId}`);
    const [reviews, rulesResult] = await Promise.all([processReviews(data), processRules({ data, url, productId })]);
    ServerLogger.log(`Processing of: ${productId} .... Done - Response sent.`);
    const productData = rulesResult[0];
    productData.locale = data.lang;
    const response: BrainProductResponse = {
      product: productData,
      reviews,
      error: null,
      wasCashed: false,
      locale: data.lang,
      ver: VERSION
    };

    const isValid = validateProductResponse(response);
    if (isValid) {
      cash.set(cashingKey, response);
    }

    return response;
  } catch (error) {
    ServerLogger.error(`Error processing product: ${url} -  ${productId} - ${error.message}`);
    return {
      error: "Error processing product:",
      product: { url, domain: data?.url?.domain, id: productId },
      locale: data.lang,
      reviews: null,
      wasCashed: false,
      ver: VERSION
    };
  }
};
