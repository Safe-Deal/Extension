import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../logic/site/display-site"
import { EbayProductDisplayPage } from "./display/ebay-product-page"
import { EbayWholesaleDisplayPage } from "./display/ebay-wholesale-page"
import { EbaySiteUtils } from "./utils/ebay-site-utils"

export class EbayDisplaySiteFactory {
	public create(conclusionResponse: IConclusionResponse): DisplaySite {
		const { site } = conclusionResponse
		const { pathName: sitePathName } = site
		if (EbaySiteUtils.isEbayWholesale(sitePathName)) {
			return new EbayWholesaleDisplayPage(conclusionResponse)
		}
		if (EbaySiteUtils.isEbayItemDetails(sitePathName)) {
			return new EbayProductDisplayPage(conclusionResponse)
		}
	}
}
