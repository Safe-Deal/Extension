import { debounce, forEach, throttle } from "lodash"
import { DEBOUNCE_DELAY_MS } from "../../../../constants/display"
import { browserWindow, getAllAvailableSelectors, getAvailableSelector } from "../../../../utils/dom/html"
import { AliExpressSiteUtils } from "./utils/ali-express-site-utils"

const attributesWatcher: string[] = ["hasctr", "data-spm-anchor-id"]
const mutationTypesForObserve: string[] = ["attributes"]
const document = browserWindow().document as any

export const applyPageObserver = (
	fn: () => void,
	targetObserveNodeSelector: string,
	debounceDelay = DEBOUNCE_DELAY_MS,
	ignoredClass?: string
) => {
	const targetObserveNode = document.querySelector(targetObserveNodeSelector)
	if (!targetObserveNode) {
		return false
	}

	const config = { attributes: true, childList: true, subtree: true }
	const DOMChangeCb = function (mutationsList, observer) {
		for (const mutation of mutationsList) {
			if (
				mutationTypesForObserve?.includes(mutation.type) &&
        ignoredClass &&
        mutation.target.classList.contains(ignoredClass)
			) {
				continue
			}
			if (
				mutationTypesForObserve?.includes(mutation.type) &&
        (!mutation.attributeName || attributesWatcher?.includes(mutation.attributeName))
			) {
				fn()
				break
			}
		}
	}

	const observer = new MutationObserver(debounce(DOMChangeCb, debounceDelay))
	observer.observe(targetObserveNode, config)
	return true
}

const PAGES_OBSERVABLE_EL = [
	".next-pagination-pages",
	"[class*=SnowSearchProductFeed_Pagination__block]",
	"[class*=pagination--left--]",
	"[class*=red-snippet_RedSnippet__grid__]"
].join("|")

export const aliExpressWholeSaleLazy = {
	manageLazyLoadingOnAliExpressPaging: (fn, url: string) => {
		if (AliExpressSiteUtils.isAliExpressWholesale(url)) {
			const elements = getAllAvailableSelectors(PAGES_OBSERVABLE_EL, document)
			forEach(elements, (element) => {
				if (!element) {
					const refreshId = setInterval(() => {
						const refreshResult = getAvailableSelector(PAGES_OBSERVABLE_EL, document)
						if (refreshResult) {
							refreshResult?.addEventListener("click", throttle(fn, DEBOUNCE_DELAY_MS))
							clearInterval(refreshId)
						}
					}, DEBOUNCE_DELAY_MS)
				}
			})
		}
	},
	manageLazyLoadingOnAliExpress: (fn, url: string) => {
		if (AliExpressSiteUtils.isAliExpressWholesale(url)) {
			browserWindow().addEventListener("scroll", throttle(fn, DEBOUNCE_DELAY_MS))
		}
	}
}
