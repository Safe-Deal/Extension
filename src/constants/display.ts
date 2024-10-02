export enum SafeDealPages {
  AliExpress = "safe-deal-page-container__ali-express",
  Amazon = "safe-deal-page-container__amazon",
  eBay = "safe-deal-page-container__ebay",
  Walmart = "safe-deal-page-container__walmart",
  ScamPage = "safe-deal__scam__page"
}

export const DONE_PRODUCT_CSS_CLASS: string = "safe-deal-product-work-done"
export const DONE_PRODUCT_CONTAINER_CSS_CLASS: string = "safe-deal-container"
export const DEBOUNCE_DELAY_MS: number = 350
export const MODIFIED_PAGES_CSS_CLASS: string = "safe-deal-page-container"
export const LOADER_ELEMENT_ID = "safe-deal-loader-element"

export const initPageDisplay = (document: Document, typeOfWebsiteCss?: SafeDealPages): void => {
	const { body } = document
	if (!body || !body.classList) {
		return
	}

	if (!body.classList.contains(MODIFIED_PAGES_CSS_CLASS)) {
		body.classList.add(MODIFIED_PAGES_CSS_CLASS)
	}

	if (typeOfWebsiteCss && !body.classList.contains(typeOfWebsiteCss)) {
		body.classList.add(typeOfWebsiteCss)
	}
}
