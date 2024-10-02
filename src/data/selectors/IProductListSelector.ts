import { IProduct } from "../entities/product.interface"
import { ISiteSpec } from "../entities/site-spec.interface"

export interface IProductSelector {
  getProductList(site: ISiteSpec): IProduct;
}
