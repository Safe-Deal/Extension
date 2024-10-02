import { initPageDisplay, SafeDealPages } from "../../../../../constants/display"
import { IConclusionResponse } from "../../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../../logic/site/display-site"

import { WalmartWholesalePaint } from "./paint/walmart-wholesale-paint"

export class WalmartWholesaleDisplayPage extends DisplaySite {
	constructor(conclusionResponse: IConclusionResponse) {
		super(conclusionResponse)
	}

	public apply(): void {
		const { conclusionProductEntity }: IConclusionResponse = this.conclusionResponse
		const productListSel = this.getWholesaleItemListSel()
		const productInfoSel = this.getWholesaleProductListSel()
		const priceSel: any = this.getWholesalePriceSel()
		const wholesalePageItemListSel: string = this.getWholesalePageItemListSel()
		initPageDisplay(document, SafeDealPages.Walmart)

		const walmartWholesalePaint = new WalmartWholesalePaint()
		walmartWholesalePaint.draw({
			conclusionProductEntity,
			productListSel,
			productInfoSel,
			priceSel,
			wholesalePageItemListSel
		})
	}
}
