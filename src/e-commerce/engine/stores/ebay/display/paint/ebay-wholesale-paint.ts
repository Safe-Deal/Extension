import { DONE_PRODUCT_CSS_CLASS } from "../../../../../../constants/display"
import { IPaint } from "../../../../../../data/entities/paint.interface"
import { debug } from "../../../../../../utils/analytics/logger"
import { getAllAvailableSelectors, getAvailableSelector } from "../../../../../../utils/dom/html"
import PaintUtils from "../../../../../../utils/paint/paint-utils"
import { EBAY_DISPLAY_SEL } from "../../ebay-dom-selectors"

export class EbayWholesalePaint implements IPaint {
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

		if (!productsEl) {
			debug(`EbayWholesalePaint:: Not found el:${productListSel}`)
			return
		}

		const display = getAvailableSelector(EBAY_DISPLAY_SEL.wholesaleDisplayContainerSelector, document)
		let isGridMode = false
		if (display) {
			const displayModeText = getAvailableSelector(EBAY_DISPLAY_SEL.modeButtonSelector, document)?.getAttribute(
				EBAY_DISPLAY_SEL.modeButtonAttributeSelector
			)
			isGridMode = displayModeText?.includes(EBAY_DISPLAY_SEL.modeButtonGalleryText)
		} else {
			const displayModeText = getAvailableSelector("#e1-3", document)
			isGridMode = !displayModeText?.textContent?.toLowerCase()?.includes("view")
		}

		this.drawProducts(
			conclusionProductEntity,
			productsEl,
			productInfoSel,
			priceSel,
			isGridMode,
			wholesalePageItemListSel
		)

		return firstProductFullEl
	}

	private drawProducts(
		conclusionProductEntity,
		productsEl: any[],
		productInfoSel,
		priceSel,
		isGridMode: boolean,
		wholesalePageItemListSel: string
	) {
		for (const conclusionProduct of conclusionProductEntity) {
			const { rules } = conclusionProduct

			const productId = conclusionProduct.product.id
			const productEls: any = getAllAvailableSelectors(`.s-item__link[href*='${productId}']`, document)
			for (const productEl of productEls) {
				const productDomEl = productEl.closest(wholesalePageItemListSel)
				const borderContainer = document.createElement("div")
				borderContainer.style.pointerEvents = "none"

				if (!isGridMode) {
					borderContainer.className = "border-sd-ebay-container-list"
				} else {
					borderContainer.className = "border-sd-ebay-container-grid"
				}

				productDomEl.appendChild(borderContainer)
				const productInfo = productDomEl?.querySelector(productInfoSel)
				const priceEl: any = productInfo?.querySelector(priceSel)
				priceEl.style.position = "relative"
				priceEl.style.display = "block"

				productEl.style.position = "relative"
				const iconImage: HTMLElement = PaintUtils.createIconImage(conclusionProduct, rules)
				productInfo?.parentNode?.parentNode?.appendChild(iconImage)
				if (productEl.classList) {
					productEl.classList.add(DONE_PRODUCT_CSS_CLASS)
				}
			}
		}
	}
}
