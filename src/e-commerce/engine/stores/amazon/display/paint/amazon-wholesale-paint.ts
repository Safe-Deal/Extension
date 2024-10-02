import { IPaint } from "../../../../../../data/entities/paint.interface"
import { ProductPaint } from "../../../../logic/site/paint/product-paint"
import { debug } from "../../../../../../utils/analytics/logger"
import PaintUtils from "../../../../../../utils/paint/paint-utils"
import { getAllAvailableSelectors, getAvailableSelector } from "../../../../../../utils/dom/html"

export class AmazonWholesalePaint implements IPaint {
	public draw({
		conclusionProductEntity,
		productListSel,
		productInfoSel,
		priceSel,
		wholesalePageItemListSel
	}): Element {
		const productsFullEl: NodeListOf<Element> = getAllAvailableSelectors(productListSel, document)
		const productsEl: any[] = Array.from(productsFullEl)
		const [firstProductFullEl] = productsEl
		const isGridMode = true

		if (!productsEl) {
			debug(`AmazonWholesalePaint:: Not found el:${productListSel}`)
			return
		}

		this.enableOverflowTooltipOnAmazonLeftAndRightSidePage()

		this.drawProducts(conclusionProductEntity, productInfoSel, isGridMode, wholesalePageItemListSel)

		return firstProductFullEl
	}

	private enableOverflowTooltipOnAmazonLeftAndRightSidePage() {
		const mainSlotEl: any = getAvailableSelector(".s-main-slot", document)
		mainSlotEl.style.overflow = "visible"

		const desktopContentEl: any = getAvailableSelector(".s-desktop-content", document)
		desktopContentEl.style.overflow = "visible"
	}

	private drawProducts(conclusionProductEntity, productInfoSel, isGridMode: boolean, wholesalePageItemListSel: string) {
		for (const conclusionProduct of conclusionProductEntity) {
			const { rules } = conclusionProduct

			const productId = conclusionProduct.product.id
			const productEls: any = getAllAvailableSelectors(`.s-result-item.s-asin[data-asin='${productId}']`, document)
			for (const productEl of productEls) {
				const productDomEl = productEl.closest(wholesalePageItemListSel)
				const borderContainer = document.createElement("div")
				productDomEl.appendChild(borderContainer)

				productEl.style.position = "relative"
				const iconImage = PaintUtils.createIconImage(conclusionProduct, rules)
				productEl?.appendChild(iconImage)
			}
		}
	}
}
