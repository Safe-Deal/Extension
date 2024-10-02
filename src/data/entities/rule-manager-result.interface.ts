import { IProduct } from "./product.interface";
import { IRule } from "./rule.interface";

export interface IRuleManagerResult {
  product: IProduct;
  rules: IRule[];
}
