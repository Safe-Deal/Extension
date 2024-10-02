import { SiteDomSelector } from "../../../../data/sites/site-dom-selector"

export const EBAY_PAGE_SELECTORS = ["#CenterPanel", "#mainContent"].join("|")
export class EbaySiteSelector extends SiteDomSelector {
	constructor() {
		super(
			{
				// Gallery
				wholesaleGalleryPageItemListSel: [".srp-results .s-item", ".b-list__items_nofooter .s-item"].join("|"),
				wholesaleGalleryPageItemRatingSel: ".rating",
				wholesaleGalleryPageItemHref: ".s-item__info a",
				wholesaleGalleryPageItemTopSeller: ".ux-section-icon-with-details",
				wholesaleGalleryPageItemOrdersSel: "",
				wholesaleGalleryPageItemSoldByBrand: ".ux-section-icon-with-details",

				productPriceSel: "",

				// List
				wholesaleListPageItemListSel: "",
				wholesaleListPageItemHref: ".s-item__info a",
				wholesaleListPageItemTopSeller: ".ux-section-icon-with-details",
				wholesaleListPageItemRatingSel: "",
				wholesaleListPageItemOrdersSel: "",
				wholesaleListPageItemSoldByBrand: ".ux-section-icon-with-details",

				// Wholesale - General
				wholesalePageProductId: ".s-item__link",

				// Item Details
				itemPageProductSel: EBAY_PAGE_SELECTORS,

				// Item Page
				itemPageProductHref: null,
				itemPageProductTopSeller: ".ux-section-icon-with-details__data-title",
				itemPageProductSoldByBrand: ".ux-section-icon-with-details__data-title",

				itemPageProductRatingSel: ".rating"
			},
			{
				imageSel: ".ebay-image1",
				wholesalePageItemListSel: ".s-item__wrapper",
				wholesalePageProductListSel: ".s-item__info",
				wholesalePagePriceSel: ".s-item__price",

				itemPageProductSel: "#LeftSummaryPanel|#mainContent .x-price-section |#PicturePanel .merch-placement-layout",
				itemPageProductInfoActionsSel: ".x-buybox__section",
				itemLoaderProductElSel: ".x-buybox__section"
			}
		)
	}
}
