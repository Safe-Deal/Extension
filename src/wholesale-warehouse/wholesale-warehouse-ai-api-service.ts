import { ApiDownloader } from "../utils/downloaders/apiDownloader";

// export const AI_WHOLESALE_ANALYZE_URL = (companyId: string, productId: string) =>
//   `/wholesale/${companyId}/${productId}/analyze`;

// https://{{safe_deal_domain}}/wholesale-stores/{storeName}/products/{productId}/analysis
export const AI_WHOLESALE_WAREHOUSE_ANALYZE_URL = (storeId: string, productId: string) =>
  `/wholesale-stores/${storeId}/products/${productId}/analysis`;

const createApiDownloader = (url: string) => new ApiDownloader(url);

// for ex: https://www.alibaba.com/product-detail/Watch-Skmei-9209-Fashion-Luxury-Watch_62555621024.html?spm=a2700.galleryofferlist.p_offer.d_image.6ebd14d4T961Kw&s=p
const analyzeWholesaleWarehouseProductByAI = async (wholesaleWarehouseAiDTO: any) => {
  console.log("wholesaleWarehouseAiDTO = ", wholesaleWarehouseAiDTO);
  const url: string = AI_WHOLESALE_WAREHOUSE_ANALYZE_URL(
    wholesaleWarehouseAiDTO.companyId,
    wholesaleWarehouseAiDTO.productId
  );
  const api = createApiDownloader(url);
  const response = await api.post(wholesaleWarehouseAiDTO);
  return response;
};

export { analyzeWholesaleWarehouseProductByAI };
