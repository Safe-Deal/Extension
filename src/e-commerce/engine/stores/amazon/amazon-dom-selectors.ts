/* amazon selectors */
export const AMAZON_PRODUCT_SELECTOR = ".s-item"
export const AMAZON_PRODUCT_INFO_SELECTOR = ".product-main-wrap"
export const AMAZON_INFO_PRODUCT_SELECTOR = ".s-item__info"
export const AMAZON_ITEM_PRICE_SELECTOR = ".s-item__price"

export const getAmazonInfoSelector = (element) => element?.querySelector(AMAZON_INFO_PRODUCT_SELECTOR)
export const getAmazonPriceSelector = (element) => element?.querySelector(AMAZON_ITEM_PRICE_SELECTOR)

/* amazon display selectors */
export const AMAZON_DISPLAY_SEL = {
	wholesaleDisplayContainerSelector: ".s-main-slot.s-result-list",
	modeButtonSelector: ".btn__icon svg use",
	modeButtonAttributeSelector: "xlink:href",
	modeButtonGalleryText: "filter-gallery"
}
