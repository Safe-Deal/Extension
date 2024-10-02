import { debug } from "../../utils/analytics/logger"
import { browserLocalStorage } from "../../utils/site/site-storage"
import { WHITELISTED_DOMAINS } from "./anti-scam-white-list"

const WHITELISTING_PERIOD_IN_DAYS = 4 * 30

export const USER_DECLARED_AS_SAFE = "SD_USER_DECLARED_AS_SAFE"
export const USER_DECLARED_AS_SAFE_TIMESTAMP = "SD_USER_DECLARED_AS_SAFE_TIMESTAMP"
export const MARK_AS_SAFE = "SG_MARKED_AS_SAFE"

export const isWhitelisted = (domain) => {
	const inspected = new String(domain)?.toLowerCase().replace("www.", "")
	const whitelistedBigSite = WHITELISTED_DOMAINS.some((trusted) => inspected.includes(trusted?.toLowerCase()))
	if (whitelistedBigSite) {
		debug(`AntiScam :: ${inspected} is Whitelisted cause it's big trusted website`)
		return true
	}

	const selfWhitelisted = browserLocalStorage.getItem(USER_DECLARED_AS_SAFE)
	if (selfWhitelisted) {
		debug(`AntiScam :: ${inspected} is Whitelisted By User`)
		return true
	}

	const markedAsSafe = browserLocalStorage.getItem(MARK_AS_SAFE)
	if (markedAsSafe) {
		const at = new Date(Number.parseInt(markedAsSafe))
		const today = new Date()
		const diff = new Date(Math.abs(today.getTime() - at.getTime()))
		const daysPassed = diff.getUTCDate() - 1
		if (daysPassed <= WHITELISTING_PERIOD_IN_DAYS) {
			debug(`AntiScam :: ${inspected} is Whitelisted by SafeDeal ${daysPassed} days ago`)
			return true
		}
		debug(`AntiScam :: ${inspected} Whitelisting is Expired ${daysPassed} days ago, was marked safe by SafeDeal`)
		return false
	}

	debug(`AntiScam :: ${inspected} is fist time inspected`)
	return false
}

export const whitelist = () => {
	const today = new Date().getTime().toString()
	browserLocalStorage.setItem(USER_DECLARED_AS_SAFE, "true")
	browserLocalStorage.setItem(USER_DECLARED_AS_SAFE_TIMESTAMP, today)
}

export const markAsSafe = () => {
	const today = new Date().getTime().toString()
	browserLocalStorage.setItem(MARK_AS_SAFE, today)
}
