import { DONE_PRODUCT_CSS_CLASS } from "../../../../../constants/display"
import { IProduct } from "../../../../../data/entities/product.interface"
import { Site } from "../../../../../data/sites/site"
import { isVisible } from "../../../../../utils/general/general"
import { getAvailableSelector } from "../../../../../utils/dom/html"
import { AmazonSiteUtils } from "../../amazon/utils/amazon-site-utils"

const isProcessingRequired = (isInViewPortAndVisible) => (pr: any) =>
	isInViewPortAndVisible
		? isVisible(pr) && !pr?.querySelector(".lazyload-placeholder") && !pr?.querySelector(`.${DONE_PRODUCT_CSS_CLASS}`)
		: !pr?.querySelector(".lazyload-placeholder") && !pr?.querySelector(`.${DONE_PRODUCT_CSS_CLASS}`)

export class WalmartProductLocator {
	constructor(private site: Site) {
		this.site = site
	}

	public parseDomToGetProducts(isOnlyVisibleOnes: boolean = false): IProduct[] {
		const siteSelectors = this.site.siteDomSelector
		const { dom } = this.site
		const productPageItemSelector = siteSelectors.getProductPageItemSel()
		const productIdSelector = siteSelectors.getWholesaleProductIdPage()
		const [wholesalePageItemListSelectorGallery, wholesalePageItemListSelectorList] = siteSelectors
			.getWholesalePageItemListSel()
			.split("|")
		let items = dom.querySelectorAll(wholesalePageItemListSelectorGallery)
		if (!items.length) {
			items = dom.querySelectorAll(wholesalePageItemListSelectorList)
		}
		if (!items.length) {
			items = dom.querySelectorAll(productPageItemSelector)
		}
		const productsElement: any[] = Array.from(items)

		function getWholesaleEbayProductIdFromHref(link) {
			if (!link) {
				return ""
			}
			const [substringHrefProduct] = link.split("?")
			const substringHref = substringHrefProduct.split("/")
			return substringHref.pop()
		}
		let productsElementEntities = productsElement.filter(isProcessingRequired(isOnlyVisibleOnes))
		if (AmazonSiteUtils.isAmazonItemDetails(`${this.site.url}${this.site.pathName}`)) {
			productsElementEntities = productsElement
		}

		const products: IProduct[] = productsElementEntities.map((pr: any): IProduct => {
			const productIdEl = getAvailableSelector(productIdSelector, pr, false)
			let productId
			if (productIdEl) {
				productId =
          getWholesaleEbayProductIdFromHref(productIdEl?.getAttribute("href")) ||
          productIdEl?.getAttribute("content") ||
          ""
			}

			return {
				id: productId,
				domain: this.site.domain,
				url: this.site.url
			}
		})
		return products
	}
}
