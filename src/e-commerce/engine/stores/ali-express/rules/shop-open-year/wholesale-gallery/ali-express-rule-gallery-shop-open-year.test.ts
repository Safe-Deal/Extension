import { IDisplaySiteDomSelectorSpec } from "../../../../../../../data/entities/display-site-dom-selector-spec.interface";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { ISiteDomSelectorSpec } from "../../../../../../../data/entities/site-dom-selector-spec.interface";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import { AliExpressProductDownloader } from "../../../product/ali-express-product-downloader";
import rules_name from "../../ali-express-rules-names.const";
import { AliExpressRuleGalleryShopOpenYear } from "./ali-express-rule-gallery-shop-open-year";

describe("Ali Express Rule Shop Open Year", () => {
  const aliExpressRuleShopOpenYear: AliExpressRuleGalleryShopOpenYear = new AliExpressRuleGalleryShopOpenYear();
  beforeAll(() => {
    jest.spyOn(AliExpressProductDownloader.prototype, "download").mockReturnValue(
      Promise.resolve({
        productPrice: null,
        productRatingAverage: null,
        productRatingsAmount: null,
        productPurchases: null,
        storeOpenTime: "",
        storePositiveRate: null,
        storeIsTopRated: null,
        category: null,
        json: null
      })
    );
  });

  it("rule evaluation work correctly - no data", async () => {
    const product: IProduct = {
      id: "4000117654955",
      domain: "aliexpress.com",
      url: "https://www.aliexpress.com/item/4000117654955.html"
    };
    const domSelector: ISiteDomSelectorSpec = {
      wholesaleGalleryPageItemHref: ".wholesale-href"
    };
    const expected: IRuleResult = {
      name: rules_name.SHOP_OPEN_YEAR_WHOLESALE_GALLERY,
      value: 0,
      weight: 0,
      isValidRule: false
    };
    const displayDomSelector: IDisplaySiteDomSelectorSpec = {};
    const siteDomSelector: SiteDomSelector = new SiteDomSelector(domSelector, displayDomSelector);
    const res = await aliExpressRuleShopOpenYear.evaluate(product, siteDomSelector);
    expect(res).toEqual(expected);
  });
});
