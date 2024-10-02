import { debug, logError } from "../utils/analytics/logger"
import { browserWindow } from "../utils/dom/html"
import { onHrefChange } from "../utils/dom/location"
import { SHUTAF_GLUE } from "../utils/extension/glue"

const PING_INTERVAL_IN_SEC = 35

const setupPing = () => {
	setInterval(() => {
		SHUTAF_GLUE.ping()
	}, PING_INTERVAL_IN_SEC * 1000)
};

(async () => {
	try {
		setupPing()
		debug("Shutaf:: init... ")
		const url: string = browserWindow().location.href
		SHUTAF_GLUE.send(url)
		onHrefChange((href) => {
			debug("Shutaf:: URL changed... ")
			SHUTAF_GLUE.send(href)
			debug("Shutaf:: URL changed... Done")
		})
		debug("Shutaf:: init... Done")
	} catch (error) {
		logError(error)
	}
})()
