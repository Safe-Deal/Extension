import { ProductStore } from "../engine/logic/conclusion/conclusion-product-entity.interface";

export interface ReviewSummaryData {
  productId: string;
  document: string;
  siteUrl: string;
  store: ProductStore;
  lang?: string;
  regenerate?: boolean;
}
