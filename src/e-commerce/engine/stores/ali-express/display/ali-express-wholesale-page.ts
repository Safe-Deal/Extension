import { initPageDisplay, SafeDealPages } from "../../../../../constants/display"
import { IConclusionResponse } from "../../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../../logic/site/display-site"
import { AliExpressWholesalePaint } from "./paint/ali-express-wholesale-paint"

export class AliExpressWholesaleDisplayPage extends DisplaySite {
	constructor(conclusionResponse: IConclusionResponse) {
		super(conclusionResponse)
	}

	public apply(): void {
		const { conclusionProductEntity }: IConclusionResponse = this.conclusionResponse
		const productListSel = this.getWholesaleItemListSel()
		const productInfoSel = this.getWholesaleProductListSel()
		const priceSel: any = this.getWholesalePriceSel()
		const aliExpressWholesalePaint = new AliExpressWholesalePaint()
		initPageDisplay(document, SafeDealPages.AliExpress)

		aliExpressWholesalePaint.draw({
			conclusionProductEntity,
			productListSel,
			productInfoSel,
			priceSel
		})
	}
}
