import { SiteDomSelector } from "../../../../data/sites/site-dom-selector";

export class WalmartSiteSelector extends SiteDomSelector {
  constructor() {
    super(
      {
        // Gallery
        wholesaleGalleryPageItemListSel:
          ".search-product-result .search-result-gridview-items>li.Grid-col|.search-product-result .search-result-listview-items .search-result-listview-item",
        wholesaleGalleryPageItemHref: ".search-result-gridview-item .product-title-link",
        wholesaleGalleryPageItemRatingSel: "",
        wholesaleGalleryPageItemOrdersSel: "",

        // List
        wholesaleListPageItemListSel:
          ".search-product-result .search-result-listview-items .search-result-listview-item",
        wholesaleListPageItemHref: ".search-result-listview-item .product-title-link",
        wholesaleListPageItemRatingSel: "",
        wholesaleListPageItemOrdersSel: "",

        // Wholesale - General
        wholesalePageProductId:
          ".search-result-gridview-item a|.search-result-listview-item a|#product-overview meta[itemprop=\"sku\"]",

        // Item Details
        itemPageProductSel: ".js-body-content",
        itemPageProductHref: "meta[itemprop=\"url\"]",
        itemPageProductRatingSel: ".overview-rating-average"
      },
      {
        imageSel: "",
        wholesalePageItemListSel: ".search-product-result .search-result-gridview-items>li.Grid-col",
        // wholesalePageItemListSel: ".search-product-result .search-result-listview-items .search-result-listview-item",
        wholesalePageProductListSel: ".search-result-gridview-item",
        // wholesalePageProductListSel: ".search-result-listview-item",
        wholesalePagePriceSel: ".search-result-productprice",

        itemPageProductSel: ".js-body-content",
        itemPageProductInfoActionsSel: "#add-on-atc-container",
        itemLoaderProductElSel: "#add-on-atc-container"
      }
    );
  }
}
