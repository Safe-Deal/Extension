import { debug } from "../utils/analytics/logger"
import { hideBadge, showBadge } from "../utils/extension/badges"
import { SHUTAF_GLUE } from "../utils/extension/glue"
import { ShutafTabManger } from "./logic/ShutafTabManger"
import { ProductShutaf } from "./logic/product-shutaff"

export const initShutafWorker = () => {
	debug("initShutafWorker", "Shutaf::worker is starting... ")
	ShutafTabManger.initialize()
	SHUTAF_GLUE.worker(async (url: string, sendResponse) => {
		if (url === SHUTAF_GLUE.PING) {
			const notOpenedLinks = JSON.stringify(ShutafTabManger.requests, null, 2)
			debug("ShutafWorker", `Shutaf::worker is alive. notOpenedLinks: ${notOpenedLinks}`)
			return
		}

		const executor = new ProductShutaf(url)
		const affiliatedLink = await executor.execute()
		if (affiliatedLink) {
			await showBadge()
		} else {
			await hideBadge()
		}
		sendResponse(affiliatedLink)
	})
	debug("initShutafWorker", "Shutaf::worker is listening... init done.")
}
