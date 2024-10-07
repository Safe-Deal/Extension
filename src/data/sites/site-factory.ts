import { get } from "lodash";
import { ISiteSpec } from "../entities/site-spec.interface";
import { AliExpressSiteCreator } from "../../e-commerce/engine/stores/ali-express/ali-express-site-creator";
import { AmazonSiteCreator } from "../../e-commerce/engine/stores/amazon/amazon-site-creator";
import { EbaySiteCreator } from "../../e-commerce/engine/stores/ebay/ebay-site-creator";
import { Site } from "./site";
import { SiteUtil } from "../../e-commerce/engine/logic/utils/site-utils";
import { ProductStore } from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";

export class SiteFactory {
  public create(siteSpec: ISiteSpec): Site {
    const { url } = siteSpec;
    const store = SiteUtil.getStore(url);

    switch (store) {
      case ProductStore.ALI_EXPRESS_RUSSIA:
      case ProductStore.ALI_EXPRESS:
        return new AliExpressSiteCreator().createSite(siteSpec);
      case ProductStore.AMAZON:
        return new AmazonSiteCreator().createSite(siteSpec);
      case ProductStore.EBAY:
        return new EbaySiteCreator().createSite(siteSpec);
      default:
        return null;
    }
  }
}
