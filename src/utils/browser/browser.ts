import { debug } from "../analytics/logger"

type BrowserInfo = {
  browserName: string;
  browserVersion: string;
};

const getBrowserInfoSafe = (): BrowserInfo => {
	if (typeof navigator !== "undefined") {
		const { userAgent } = navigator
		let browserName: string = "Unknown"
		let browserVersion: string = "Unknown"

		try {
			if (/chrome|chromium|crios/i.test(userAgent)) {
				browserName = "Chrome"
				const match = userAgent.match(/chrom(e|ium)\/([0-9]+)\./i)
				browserVersion = match ? match[2] : "Unknown"
			} else if (/firefox|fxios/i.test(userAgent)) {
				browserName = "Firefox"
				const match = userAgent.match(/firefox\/([0-9]+)\./i)
				browserVersion = match ? match[1] : "Unknown"
			} else if (/safari/i.test(userAgent) && !/chrome|chromium|crios/i.test(userAgent)) {
				browserName = "Safari"
				const match = userAgent.match(/version\/([0-9]+)\./i)
				browserVersion = match ? match[1] : "Unknown"
			} else if (/edg/i.test(userAgent)) {
				browserName = "Edge"
				const match = userAgent.match(/edg\/([0-9]+)\./i)
				browserVersion = match ? match[1] : "Unknown"
			} else if (/opr\//i.test(userAgent)) {
				browserName = "Opera"
				const match = userAgent.match(/opr\/([0-9]+)\./i)
				browserVersion = match ? match[1] : "Unknown"
			}
		} catch (error) {
			debug("Error getting browser info", error)
		}

		return { browserName, browserVersion }
	}

	return { browserName: "Unknown", browserVersion: "Unknown" }
}

export const getBrowserVer = (): string => {
	const { browserName, browserVersion } = getBrowserInfoSafe()
	return `${browserName}-v${browserVersion}`
}

export const onDocumentInactivity = (callback, inactivityTimeMs = 500) => {
	if (inactivityTimeMs === 0) {
		callback()
		return
	}

	let timeout
	const observer = new MutationObserver(() => {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			callback()
		}, inactivityTimeMs)
	})

	observer.observe(document, {
		childList: true,
		subtree: true,
		characterData: true
	})
}
