import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../logic/site/display-site"
import { AliExpressProductDisplayPage } from "./display/ali-express-product-page"
import { AliExpressWholesaleDisplayPage } from "./display/ali-express-wholesale-page"
import { AliExpressSiteUtils } from "./utils/ali-express-site-utils"

export class AliExpressDisplaySiteFactory {
	public create(conclusionResponse: IConclusionResponse): DisplaySite {
		const { site } = conclusionResponse
		const { pathName: sitePathName } = site
		if (AliExpressSiteUtils.isAliExpressWholesale(sitePathName)) {
			return new AliExpressWholesaleDisplayPage(conclusionResponse)
		}
		if (AliExpressSiteUtils.isAliExpressItemDetails(sitePathName)) {
			return new AliExpressProductDisplayPage(conclusionResponse)
		}
	}
}
