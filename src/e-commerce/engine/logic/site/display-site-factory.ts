import { DONE_PRODUCT_CONTAINER_CSS_CLASS, LOADER_ELEMENT_ID } from "../../../../constants/display"
import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface"
import { Site } from "../../../../data/sites/site"
import { browserWindow } from "../../../../utils/dom/html"
import { AliExpressDisplaySiteFactory } from "../../stores/ali-express/ali-express-display-site-factory"
import { AmazonDisplaySiteFactory } from "../../stores/amazon/amazon-display-site-factory"
import { EbayDisplaySiteFactory } from "../../stores/ebay/ebay-display-site-factory"
import { WalmartDisplaySiteFactory } from "../../stores/walmart/walmart-display-site-factory"
import { ProductStore } from "../conclusion/conclusion-product-entity.interface"
import { SiteUtil } from "../utils/site-utils"
import { DisplaySite } from "./display-site"

export class DisplaySiteFactory {
	public create(conclusionResponse: IConclusionResponse): DisplaySite {
		const { site } = conclusionResponse
		const { url } = site
		const store = SiteUtil.getStore(url)
		switch (store) {
		case ProductStore.ALI_EXPRESS_RUSSIA:
		case ProductStore.ALI_EXPRESS:
			return new AliExpressDisplaySiteFactory().create(conclusionResponse)
		case ProductStore.AMAZON:
			return new AmazonDisplaySiteFactory().create(conclusionResponse)
		case ProductStore.EBAY:
			return new EbayDisplaySiteFactory().create(conclusionResponse)
		case ProductStore.WALMART:
			return new WalmartDisplaySiteFactory().create(conclusionResponse)
		default:
			return null
		}
	}
}

export class PreDisplaySiteFactory {
	private static site: Site

	public static create(site: Site) {
		PreDisplaySiteFactory.site = site
	}

	public static start(): void {
		const url = browserWindow().location.href
		const html = browserWindow().document
		this.removeExistingResult()
		if (SiteUtil.isItemDetails(url) && !this.isPainted()) {
			const selectors = PreDisplaySiteFactory.site.siteDomSelector.displayDomSelector.itemLoaderProductElSel
		}
	}

	public static removeExistingResult() {
		const currentSafeDealEl = document.querySelectorAll(`.${DONE_PRODUCT_CONTAINER_CSS_CLASS}`)
		if (currentSafeDealEl)
			currentSafeDealEl.forEach((el) => {
				if (el && el.remove) {
					el.remove()
				}
			})
	}

	private static isPainted() {
		const loader = document.getElementById(LOADER_ELEMENT_ID)
		if (loader) {
			return true
		}
		return false
	}

	public static destroy(): void {
		const loader = document.getElementById(LOADER_ELEMENT_ID)
		if (loader) {
			loader.remove()
		}
	}
}
