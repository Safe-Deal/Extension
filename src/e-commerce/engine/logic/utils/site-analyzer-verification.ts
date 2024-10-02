import { SAFE_DEAL_OFF } from "../../../../constants/sites"
import { debug } from "../../../../utils/analytics/logger"

const OFF_SITES = [".aws.amazon."]
export class SiteAnalyzerVerification {
	public static verify(siteUrl: string): boolean {
		const offByRequest = siteUrl.includes(SAFE_DEAL_OFF)
		if (offByRequest) {
			debug(`${siteUrl} Site Turned off by url parameter: ${SAFE_DEAL_OFF}`)
			return false
		}
		const isDIsabledSite = OFF_SITES.some((d) => siteUrl.includes(d))
		if (isDIsabledSite) {
			debug(`${siteUrl} Site Turned off by url OFF_SITES list: ${OFF_SITES}`)
			return false
		}
		return true
	}
}
