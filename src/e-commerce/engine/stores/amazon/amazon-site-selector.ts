import { SiteDomSelector } from "../../../../data/sites/site-dom-selector"

export class AmazonSiteSelector extends SiteDomSelector {
	constructor() {
		super(
			{
				// Gallery
				wholesaleGalleryPageItemListSel: ".s-search-results .s-result-item.s-asin",
				wholesaleGalleryPageItemRatingSel: "",
				wholesaleGalleryPageItemHref: ".a-link-normal.a-text-normal:not(.a-size-base)",
				wholesaleGalleryPageItemTopSeller: "",
				wholesaleGalleryPageItemOrdersSel: "",

				productPriceSel: "",

				// List
				wholesaleListPageItemListSel: "",
				wholesaleListPageItemHref: "",
				wholesaleListPageItemTopSeller: "",
				wholesaleListPageItemRatingSel: "",
				wholesaleListPageItemOrdersSel: "",

				// Wholesale - General
				wholesalePageProductId: "data-asin", // Will get null but we grab it from attribute element

				// Item Details
				itemPageProductSel: "#dp | .reviewNumericalSummary",

				// HERE
				// itemPageProductHref: ".a-link-emphasis.a-text-bold",
				itemPageProductHref: null,
				itemPageProductTopSeller: ".vi-swc-wrapper",

				itemPageProductRatingSel: ".rating"
			},
			{
				imageSel: "",
				wholesalePageItemListSel: ".s-main-slot.s-result-list .s-result-item.s-asin",
				wholesalePageProductListSel: ".s-main-slot.s-result-list .s-result-item.s-asin .sg-col-inner",
				// wholesalePageProductListSel: ".sg-col-inner",
				wholesalePagePriceSel: ".s-item__price",

				itemPageProductSel: "",
				itemPageProductInfoActionsSel: "",
				itemLoaderProductElSel: ""
			}
		)
	}
}
