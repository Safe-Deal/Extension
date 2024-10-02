import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../logic/site/display-site"
import { WalmartProductDisplayPage } from "./display/walmart-product-page"
import { WalmartWholesaleDisplayPage } from "./display/walmart-wholesale-page"
import { WalmartSiteUtils } from "./utils/walmart-site-utils"

export class WalmartDisplaySiteFactory {
	public create(conclusionResponse: IConclusionResponse): DisplaySite {
		const { site } = conclusionResponse
		const { pathName: sitePathName } = site
		if (WalmartSiteUtils.isWalmartWholesale(sitePathName)) {
			return new WalmartWholesaleDisplayPage(conclusionResponse)
		}
		if (WalmartSiteUtils.isWalmartItemDetails(sitePathName)) {
			return new WalmartProductDisplayPage(conclusionResponse)
		}
	}
}
