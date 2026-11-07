/**
 * @jest-environment-options {"url": "https://www.ebay.com/sch/i.html?_nkw=shoe+storage"}
 */
import { DONE_PRODUCT_CSS_CLASS } from "../../../../../../../constants/display";
import { Site } from "../../../../../../../data/sites/site";
import { ProductLocator } from "../../../../../logic/product/product-locator";
import { EbaySiteSelector } from "../../../ebay-site-selector";
import { EbayWholesalePaint } from "../ebay-wholesale-paint";

jest.mock("../../../../../../../utils/paint/paint-utils", () => ({
  __esModule: true,
  default: {
    createIconImage: () => {
      const icon = document.createElement("img");
      icon.className = "safe-deal-image-wholesale-product";
      return icon;
    }
  }
}));

const sCard = (id: string) => `
  <li class="s-card s-card--horizontal" id="item${id}" data-listingid="${id}">
    <div class="su-card-container su-card-container--horizontal">
      <div class="su-card-container__media">
        <a class="s-card__link image-treatment" href="https://www.ebay.com/itm/${id}?_skw=shoe+storage"></a>
      </div>
      <div class="su-card-container__content">
        <div class="su-card-container__header">
          <a class="s-card__link" href="https://www.ebay.com/itm/${id}?_skw=shoe+storage">
            <div class="s-card__title"><span>Shoe Storage ${id}</span></div>
          </a>
        </div>
        <div class="su-card-container__attributes">
          <div class="s-card__attribute-row"><span class="s-card__price">ILS 15.95</span></div>
        </div>
      </div>
    </div>
  </li>`;

const sItem = (id: string) => `
  <li class="s-item">
    <div class="s-item__wrapper">
      <div class="s-item__image-section"></div>
      <div class="s-item__info">
        <a class="s-item__link" href="https://www.ebay.com/itm/${id}?hash=item"></a>
        <span class="s-item__price">$10.00</span>
      </div>
    </div>
  </li>`;

const renderResults = (resultsClassName: string, items: string) => {
  document.body.innerHTML = `
    <div class="srp-main-content">
      <ul class="srp-results ${resultsClassName}">${items}</ul>
    </div>`;
};

const drawConclusions = (productIds: string[]) => {
  const { displayDomSelector } = new EbaySiteSelector();
  new EbayWholesalePaint().draw({
    conclusionProductEntity: productIds.map((id) => ({ product: { id }, rules: [] })),
    productListSel: displayDomSelector.wholesalePageItemListSel,
    productInfoSel: displayDomSelector.wholesalePageProductListSel,
    priceSel: displayDomSelector.wholesalePagePriceSel,
    wholesalePageItemListSel: displayDomSelector.wholesalePageItemListSel
  });
};

const locateProductIds = (): string[] => {
  const site = new Site({ domain: "www.ebay.com", url: "https://www.ebay.com", dom: document }, new EbaySiteSelector());
  return new ProductLocator(site).parseDomToGetProducts().map((product) => product.id);
};

describe("eBay wholesale search results", () => {
  it("locates every product on the s-card layout", () => {
    renderResults("srp-list", sCard("227589512649") + sCard("136964418379"));
    expect(locateProductIds()).toEqual(["227589512649", "136964418379"]);
  });

  it("paints one border and one badge per s-card in list view", () => {
    renderResults("srp-list", sCard("227589512649") + sCard("136964418379"));
    drawConclusions(["227589512649", "136964418379"]);

    const cards = Array.from(document.querySelectorAll(".s-card"));
    cards.forEach((card) => {
      expect(card.querySelectorAll(".border-sd-ebay-container-list")).toHaveLength(1);
      expect(card.querySelectorAll(".safe-deal-image-wholesale-product")).toHaveLength(1);
      card.querySelectorAll(".s-card__link").forEach((link) => {
        expect(link.classList.contains(DONE_PRODUCT_CSS_CLASS)).toBe(true);
      });
    });
  });

  it("paints the grid border in gallery view", () => {
    renderResults("srp-grid", sCard("227589512649"));
    drawConclusions(["227589512649"]);

    expect(document.querySelectorAll(".s-card .border-sd-ebay-container-grid")).toHaveLength(1);
    expect(document.querySelectorAll(".border-sd-ebay-container-list")).toHaveLength(0);
  });

  it("still locates and paints the legacy s-item layout", () => {
    renderResults("srp-list", sItem("166565620716"));
    expect(locateProductIds()).toEqual(["166565620716"]);

    drawConclusions(["166565620716"]);
    expect(document.querySelectorAll(".s-item .safe-deal-image-wholesale-product")).toHaveLength(1);
  });
});
