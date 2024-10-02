import { debug } from "../../../../../utils/analytics/logger"
import { browserWindow } from "../../../../../utils/dom/html"
import { ALIEXPRESS_CAMPAIGN_URL } from "../../common/constants"

const isSuperDealsPage = (window: Window): boolean => {
	const isSuperDeals = window.location.href.includes("wow/gcp-plus/ae/")
	debug("  AliSuperDeals::isSuperDealsPage -> ", isSuperDeals ? "true" : "false")
	return isSuperDeals
}

const isAliexpressCampaignPage = (): boolean => {
	const window = browserWindow()
	const isAliexpressCampaign = window.location.href.includes(ALIEXPRESS_CAMPAIGN_URL)
	debug("  AliSuperDeals::isAliexpressCampaignPage -> ", isAliexpressCampaign ? "true" : "false")
	return isAliexpressCampaign
}

export { isAliexpressCampaignPage, isSuperDealsPage }
