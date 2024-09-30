import { SiteDomSelector } from "../../../../data/sites/site-dom-selector";

export class AliExpressSiteSelector extends SiteDomSelector {
  constructor() {
    super(
      {
        // Gallery
        wholesaleGalleryPageItemListSel:
          '[data-product-id]|li.list-item|.product-container a[title]|ul>li[data-product-id]|.product-container  a[target="_blank"]|.productContainer|[class*="cards--gallery--"]|.search-card-item|[class*=red-snippet_RedSnippet__gallery__]',
        wholesaleGalleryPageItemHref: '.place-container a|.product-container a[title]|a[class*="link"]',
        wholesaleGalleryPageItemRatingSel: ".product-info .rating-value",
        wholesaleGalleryPageItemOrdersSel: ".sale-value",

        // List
        wholesaleListPageItemListSel: "li.list-item",
        wholesaleListPageItemHref: ".item-title-wrap a",
        wholesaleListPageItemRatingSel: ".product-info .rating-value",
        wholesaleListPageItemOrdersSel: ".sale-value",

        // Wholesale - General
        wholesalePageProductId: ".product-card[data-product-id]|.product-container a[title]|ul>li[data-product-id]",

        // Item Details
        itemPageProductSel:
          ".product-main-wrap|[class*=Product-module]|[class*=Product_Info]|[class*='MainLayout__']|[data-spm=detail]|[class*=snow-more-container_SnowMoreContainer__container]",
        itemPageProductHref: 'meta[property="og:url"]',
        itemPageProductRatingSel: ".overview-rating-average"
      },
      {
        imageSel: ".ali-image1",
        wholesalePageItemListSel: "li.list-item|ul>li[data-product-id]",
        wholesalePageProductListSel: ".product-info",
        wholesalePagePriceSel: ".item-price-row",

        itemPageProductSel:
          "#root|.product-main-wrap|[class*=Product-module]|[class*=Product_Info]|[class*='MainLayout__']|[data-spm=detail]|[class*=Product_Info__hr]|[class*=snow-more-container_SnowMoreContainer__container]",
        itemPageProductInfoActionsSel:
          ".product-action|#reviews_anchor|.product-main|[class*=Info-module_hr]|[class*=Product_Info__hr]|[class*=snow-more-container_SnowMoreContainer__container]",
        itemLoaderProductElSel:
          ".product-action|#reviews_anchor|.product-main|[class*=Info-module_hr]|[class*=Product_Info__hr]|[class*=snow-more-container_SnowMoreContainer__container]"
      }
    );
  }
}
