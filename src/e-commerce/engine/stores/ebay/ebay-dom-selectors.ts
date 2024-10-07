/* ebay selectors */
export const EBAY_PRODUCT_SELECTOR = ".s-item";
export const EBAY_PRODUCT_INFO_SELECTOR = ".product-main-wrap";
export const EBAY_INFO_PRODUCT_SELECTOR = ".s-item__info";
export const EBAY_ITEM_PRICE_SELECTOR = ".s-item__price";

export const getEbayInfoSelector = (element) => element?.querySelector(EBAY_INFO_PRODUCT_SELECTOR);
export const getEbayPriceSelector = (element) => element?.querySelector(EBAY_ITEM_PRICE_SELECTOR);

/* ebay display selectors */
export const EBAY_DISPLAY_SEL = {
  wholesaleDisplayContainerSelector: ".srp-main-content",
  modeButtonSelector: ".btn__icon svg use",
  modeButtonAttributeSelector: "xlink:href",
  modeButtonGalleryText: "filter-gallery"
};
