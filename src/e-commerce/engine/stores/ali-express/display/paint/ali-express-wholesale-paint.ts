import { isEmpty } from "lodash"
import { debug } from "../../../../../../utils/analytics/logger"
import { IPaint } from "../../../../../../data/entities/paint.interface"
import { getAllAvailableSelectors, getAvailableSelector } from "../../../../../../utils/dom/html"
import PaintUtils from "../../../../../../utils/paint/paint-utils"
import { DONE_PRODUCT_CSS_CLASS } from "../../../../../../constants/display"

export class AliExpressWholesalePaint implements IPaint {
	public draw({ conclusionProductEntity, productListSel, productInfoSel, priceSel }): Element {
		const productsFullEl: NodeListOf<Element> = getAllAvailableSelectors(productListSel, document)
		const firstProductFullEl = productsFullEl[0]
		const display = document?.getElementsByClassName("product-list")
		const isNew = !document?.querySelector("[data-product-id]")
		let isGrid = display[0]?.classList?.contains("gallery-wrap")
		if (isNew || isGrid === undefined) {
			const buttons = getAllAvailableSelectors(
				[
					"#root div.right-menu .display-mode > svg.svg-icon",
					"[class*=SearchMainFilters_ProductFeedView__productFeedView] svg"
				].join("|"),
				document
			)
			isGrid = buttons[0]?.classList?.contains("active")
		}

		this.drawProducts(conclusionProductEntity, productInfoSel, priceSel, isGrid)
		return firstProductFullEl
	}

	private drawProducts(conclusionProductEntity, productInfoSel, priceSel, isGrid: boolean) {
		const isNew = !document?.querySelector("[data-product-id]")

		conclusionProductEntity.forEach((conclusionProduct) => {
			const { rules } = conclusionProduct

			const productId = conclusionProduct.product.id
			const productSel = `[data-product-id="${productId}"]|a[href*="/${productId}."]`
			let productEl: any = getAvailableSelector(productSel, document)
			let productInfo = getAvailableSelector(productInfoSel, productEl)

			const productElementsHref = document?.querySelectorAll(`a[href*="${productId}"]`)

			if (!isEmpty(productElementsHref) && !productInfo) {
				const node = productElementsHref[1]?.parentElement?.parentElement || productEl.children[1]
				productEl = node
				productInfo = node
			}

			if (!productEl) {
				debug(`AliExpressWholesalePaint:: Not found el:${productSel}`)
				return
			}

			productEl.style.position = "relative"
			const iconImage = PaintUtils.createIconImage(conclusionProduct, rules)
			productInfo?.appendChild(iconImage)

			if (productInfo?.classList) {
				productInfo.classList.add(DONE_PRODUCT_CSS_CLASS)
			}
		})
	}
}
