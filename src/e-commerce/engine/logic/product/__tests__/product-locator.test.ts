import { IDisplaySiteDomSelectorSpec } from "../../../../../data/entities/display-site-dom-selector-spec.interface";
import { IProduct } from "../../../../../data/entities/product.interface";
import { ISiteDomSelectorSpec } from "../../../../../data/entities/site-dom-selector-spec.interface";
import { ISiteSpec } from "../../../../../data/entities/site-spec.interface";
import { Site } from "../../../../../data/sites/site";
import { SiteDomSelector } from "../../../../../data/sites/site-dom-selector";
import { ProductLocator } from "../product-locator";

describe("product locator", () => {
  const siteSpecMock: ISiteSpec = {
    domain: "",
    dom: {
      querySelectorAll: (selector) => [
        {
          querySelector: () => "<div>dsads</div>"
        }
      ]
    }
  };
  const siteDomSelectorSpecMock: ISiteDomSelectorSpec = {
    wholesaleGalleryPageItemListSel: ".wholesale-items",
    itemPageProductSel: ".product-item"
  };
  const displaySiteDomSelectorSpec: IDisplaySiteDomSelectorSpec = {
    imageSel: "",
    itemLoaderProductElSel: ""
  };
  const siteDomSelectorMock = new SiteDomSelector(siteDomSelectorSpecMock, displaySiteDomSelectorSpec);

  it("parseDomToGetProducts", () => {
    const site = new Site(siteSpecMock, siteDomSelectorMock);
    const productLocator = new ProductLocator(site);
    const parsedDomProducts: IProduct[] = productLocator.parseDomToGetProducts();
    expect(parsedDomProducts).toEqual([]);
  });
});
