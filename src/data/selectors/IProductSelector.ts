import { IProduct } from "../entities/product.interface";
import { ISiteSpec } from "../entities/site-spec.interface";

export interface IProductSelector {
  getProduct(site: ISiteSpec): IProduct;
}
