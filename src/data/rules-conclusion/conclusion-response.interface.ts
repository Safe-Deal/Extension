import { ISiteResponse } from "../entities/site-response.interface"
import { IConclusionProductEntity } from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface"

export interface IConclusionResponse {
  conclusionProductEntity: IConclusionProductEntity[];
  site: ISiteResponse;
  productId: string;
  error?: any;
}
