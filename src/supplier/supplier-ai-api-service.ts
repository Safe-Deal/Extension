import { useAuthStore } from "@store/AuthState";
import { ApiDownloader } from "../utils/downloaders/apiDownloader";

// export const AI_WHOLESALE_ANALYZE_URL = (companyId: string, productId: string) =>
//   `/wholesale/${companyId}/${productId}/analyze`;

// https://{{safe_deal_domain}}/wholesale-stores/{storeName}/products/{productId}/analysis
export const AI_SUPPLIER_ANALYZE_URL = (storeId: string, productId: string): string =>
  `/wholesale-stores/${storeId}/products/${productId}/analysis`;

const createApiDownloader = (url: string) => new ApiDownloader(url);

// for ex: https://www.alibaba.com/product-detail/Watch-Skmei-9209-Fashion-Luxury-Watch_62555621024.html?spm=a2700.galleryofferlist.p_offer.d_image.6ebd14d4T961Kw&s=p
const analyzeSupplierProductByAI = async (supplierAiDTO: any) => {
  console.log("supplierAiDTO = ", supplierAiDTO);
  const url: string = AI_SUPPLIER_ANALYZE_URL(supplierAiDTO.companyId, supplierAiDTO.productId);
  const api = createApiDownloader(url);
  const session = useAuthStore.getState().session;
  const headers = {
    Authorization: `Bearer ${session?.access_token}`
  };

  const response = await api.post(supplierAiDTO, headers);
  return response;
};

export { analyzeSupplierProductByAI };
