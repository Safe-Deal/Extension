import { IProduct } from "../../../../data/entities/product.interface";
import { IRule } from "../../../../data/entities/rule.interface";

export enum ProductConclusionEnum {
  RECOMMENDED = "RECOMMENDED",
  DOUBTFUL = "DOUBTFUL",
  NOT_RECOMMENDED = "NOT_RECOMMENDED",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
}

export enum ProductStore {
  AMAZON = "amazon",
  ALI_EXPRESS = "ali-express",
  ALI_EXPRESS_RUSSIA = "ali-express-russia",
  EBAY = "ebay",
  WALMART = "walmart",
  ALIBABA = "alibaba",
  NOT_SUPPORTED = "not-supported"
}

export interface IConclusionProductEntity {
  productConclusion: ProductConclusionEnum;
  product: IProduct;
  rules?: IRule[];
}
