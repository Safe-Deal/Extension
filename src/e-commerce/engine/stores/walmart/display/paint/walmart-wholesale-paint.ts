import { PaintUtils } from "../../../../../../utils/paint/paint-utils";
import { getAllAvailableSelectors, getAvailableSelector } from "../../../../../../utils/dom/html";
import { getReliabilityProductsSummaryTooltipMessage } from "../../../../../../constants/rule-reliability-messages";
import { IPaint } from "../../../../../../data/entities/paint.interface";
import { debug } from "../../../../../../utils/analytics/logger";
import { DONE_PRODUCT_CSS_CLASS } from "../../../../../../constants/display";
import { ProductPaint } from "../../../../logic/site/paint/product-paint";

export class WalmartWholesalePaint implements IPaint {
  public draw({
    conclusionProductEntity,
    productListSel,
    productInfoSel,
    priceSel,
    wholesalePageItemListSel
  }): Element {
    let productsFullEl: NodeListOf<Element> | any[] = getAllAvailableSelectors(productListSel, document);
    productsFullEl =
      productsFullEl && !productsFullEl.length
        ? getAllAvailableSelectors(
            ".search-product-result .search-result-listview-items .search-result-listview-item",
            document
          )
        : [];

    const productsEl: any[] = Array.from(productsFullEl);
    const [firstProductFullEl] = productsEl;

    const display = getAvailableSelector(".util-bar-container .view-switcher", document);
    let isGrid = true;
    if (display) {
      isGrid = !!display.querySelector('[data-automation-id="switcher-grid-view"] .active');
    }

    if (!productsEl) {
      debug(`WalmartWholesalePaint:: Not found el:${productListSel}`);
      return;
    }

    this.drawProducts(conclusionProductEntity, productInfoSel, isGrid, wholesalePageItemListSel);

    return firstProductFullEl;
  }

  private drawProducts(conclusionProductEntity, productInfoSel, isGridMode: boolean, wholesalePageItemListSel: string) {
    for (const conclusionProduct of conclusionProductEntity) {
      const { rules } = conclusionProduct;

      const productId = conclusionProduct.product.id;
      let productElImage: any;
      let productEl: any;

      if (isGridMode) {
        productElImage = getAvailableSelector(`.search-result-gridview-item a[href*="${productId}"]`, document);
        productEl = productElImage.parentElement.parentNode;
      } else {
        productElImage = getAvailableSelector(`.search-result-listview-item a[href*="${productId}"]`, document);
        productEl = productElImage.parentElement.parentNode;
        wholesalePageItemListSel = ".search-product-result .search-result-listview-items .search-result-listview-item";
      }

      const productDomEl = productEl.closest(wholesalePageItemListSel);
      const borderContainer = document.createElement("div");
      borderContainer.className = "border-sd-walmart-container";
      borderContainer.style.pointerEvents = "none";
      borderContainer.style.boxShadow = ProductPaint.getProductBoxShadow(conclusionProduct, "inset");
      productDomEl.appendChild(borderContainer);

      productDomEl.style.position = "relative";
      const productInfo = productDomEl?.querySelector(productInfoSel);
      const priceEl: any = getAvailableSelector(
        ".a-section.a-spacing-none.a-spacing-top-micro|.a-section.a-spacing-none.a-spacing-top-mini",
        productInfo
      );
      if (priceEl && priceEl.classList) {
        priceEl.style.position = "relative";
        priceEl.classList.add(DONE_PRODUCT_CSS_CLASS);
      }
      const iconImage = this.createIconImage(conclusionProduct, rules);
      const firstRow = getAvailableSelector(".search-result-productprice", productEl, false);
      if (firstRow) {
        firstRow.parentNode.appendChild(iconImage);
      }
    }
  }

  private createIconImage = (conclusionProduct, rules): HTMLElement => {
    const iconImageContainer = document.createElement("div");
    const iconImageSpan = document.createElement("span");
    const iconImage = document.createElement("img");

    iconImageContainer.style.position = "relative";
    iconImageContainer.style.display = "contents";

    iconImage.style.height = "22px";
    iconImage.className = "safe-deal-image";
    iconImage.src = ProductPaint.getProductIconImage(conclusionProduct);

    iconImageSpan.style.position = "absolute";
    iconImageSpan.style.margin = "0 8px";
    PaintUtils.appendProductReliabilityPopover({
      targetEl: iconImageSpan,
      explanation: getReliabilityProductsSummaryTooltipMessage(rules)
    });
    iconImageSpan.appendChild(iconImage);
    iconImageContainer.appendChild(iconImageSpan);

    return iconImageContainer;
  };
}
