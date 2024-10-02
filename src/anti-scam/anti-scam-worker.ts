import { debug, logError } from "../utils/analytics/logger"
import { ext } from "../utils/extension/ext"
import { ANTI_SCAM_GLUE } from "../utils/extension/glue"
import { ApiScamPartners } from "./logic/anti-scam-logic"

export const CLOSE_TAB = "close-tab"

export const initAntiScamWorker = () => {
	ANTI_SCAM_GLUE.worker((domain: string, sendResponse, sender) => {
		if (domain === CLOSE_TAB) {
			const tabId = sender.tab.id
			ext.tabs.remove(tabId, () => {
				debug(`AntiScamWorker :: Closed dangerous tab ${tabId} `)
			})
			return
		}

		debug(`AntiScamWorker :: Examining ${domain} ...`)
		const verifier = new ApiScamPartners()
		verifier
			.evaluate(domain, sender.tab.id)
			.then((result) => {
				debug(`AntiScamWorker :: ${domain} is ${JSON.stringify(result)}`)
				sendResponse(result)
				debug(`AntiScamWorker :: Examining ${domain} Response Sent.`)
			})
			.catch((error) => {
				debug(`AntiScamWorker :: Error: ${error}`)
				logError(error)
			})
	})
}
