import { HTMLElement as ParsedHtmlFromLib, parse } from "node-html-parser"
import tldjs from "tldjs"
import { get } from "lodash"
import { debug, logError } from "../analytics/logger"
import { STATUS_NOT_200 } from "../downloaders/fetch"
import { castAsNumber } from "../text/strings"

export const browserWindow = (): Window | typeof global => {
	if (typeof window !== "undefined") {
		return window
	}
	if (typeof self !== "undefined") {
		return self
	}
	return global
}

export type ParsedHtml = ParsedHtmlFromLib | null | typeof STATUS_NOT_200 | ReturnType<typeof parse>;
export function parseAsHtml(html: string): ParsedHtml {
	return parse(html)
}

export const stripHtml = (html: string): string => {
	const parsedHtml = parse(html)
	const { text } = parsedHtml
	return text.replace(/\s+/g, " ").trim()
}

export function urlParams(urlInput: string): Record<string, string> {
	const url = String(urlInput)
	const delimiter = url.includes("#") ? "#" : "?"
	const queryString = url.split(delimiter)[1]

	const params = queryString
		? queryString.split("&").reduce((result, param) => {
			const [key, value] = param.split("=")
			return { ...result, [key]: decodeURIComponent(value) }
		}, {})
		: {}

	return params
}

export function getSelectors(range: string): string[] {
	if (!range) {
		return []
	}

	const SEPARATOR = "|"
	const rangeSelectors = range.toString()

	return rangeSelectors.includes(SEPARATOR) ? rangeSelectors.split(SEPARATOR) : [rangeSelectors]
}

export const removeElements = (elms) => elms.forEach((el) => el.remove())

export const getAllAvailableSelectors = (selectors: string, html: any, isReturnAllFound = false): any => {
	const selectorsRange = getSelectors(selectors)
	const aggregator = []
	for (const selector of selectorsRange) {
		if (selector)
			try {
				const items = html?.querySelectorAll(selector)
				if (items.length > 0) {
					if (!isReturnAllFound) {
						return items
					}
					aggregator.push(...items)
				}
			} catch (error) {
				debug(error)
			}
	}
	return aggregator
}

export const getAvailableSelector = (
	range: string,
	html: any,
	isGetLast: boolean = false,
	onlyNumbered: boolean = false,
	validateFunction: (el: Element) => boolean = null
): Element => {
	const selectors = getSelectors(range)
	const results = []
	if (selectors) {
		for (const selector of selectors) {
			if (selector)
				try {
					const el = html?.querySelector(selector)
					if (el) {
						if (validateFunction) {
							if (validateFunction(el)) {
								results.push(el)
							}
						} else if (!onlyNumbered) {
							results.push(el)
						} else {
							const text = el.textContent
							const number = castAsNumber(text)
							if (number !== null) {
								results.push(el)
							}
						}
					}
				} catch (error) {
					debug(error)
				}
		}
		if (isGetLast && results.length > 0) {
			return results[results.length - 1]
		}
		return results[0]
	}
	return null
}

export const querySelector = (selectorsArray: string[], html: any): Element =>
  getAvailableSelector(selectorsArray.join("|"), html) as Element | null

export const querySelectorAll = (selectorsArray: string[], html: any): Element[] =>
  getAllAvailableSelectors(selectorsArray.join("|"), html, true) as Element[] | null

export const getDomain = (urlString = window.location.href): string => {
	if (!urlString) {
		throw new Error("getDomain:: Invalid URL -> got empty string!")
	}
	const target = urlString?.toLowerCase()?.startsWith("http") ? urlString : `http://${urlString}`
	const url = new URL(target)
	return url.hostname
}

const getTextFromElement = (el: Element, textSeparator = " ", nodeSeparator = ""): string => {
	if (!el) return ""

	let text = ""
	const stack: ChildNode[] = [el]

	while (stack.length) {
		const node = stack.shift()

		if (node && node.nodeName !== "SCRIPT") {
			if (text && nodeSeparator && !text.endsWith(nodeSeparator)) {
				text += nodeSeparator
			}
			if (node.textContent && node.childNodes.length === 0) {
				text += node.textContent.trim() + textSeparator
			} else {
				stack.unshift(...Array.from(node.childNodes))
			}
		}
	}

	return text.trim()
}

export const querySelectorTextContent = (
	selectorsArray: string[],
	html: any,
	separator = " ",
	nodeSeparator = ""
): string => {
	const el = querySelector(selectorsArray, html)
	if (!el) {
		return ""
	}
	return getTextFromElement(el, separator, nodeSeparator)
}

export const querySelectorAsNumber = (selectorsArray: string[], html: any, replaceComma = true): number => {
	const el = querySelector(selectorsArray, html)
	if (!el || !el.textContent) {
		return null
	}

	return castAsNumber(el.textContent, replaceComma)
}

export const querySelectorAsArray = (
	selectorsArray: string[],
	html: any,
	transformationFn = (el) => getTextFromElement(el)
): string[] => {
	const el = querySelectorAll(selectorsArray, html)

	if (!el) {
		return []
	}

	return el.map((e) => transformationFn(e))
}

export const getLTD = (url) => {
	try {
		const tld = tldjs.getPublicSuffix(url)
		return tld
	} catch (e) {
		debug(e)
		logError(e)
		return null
	}
}

export const getUrlPath = (url) => {
	const obj = new URL(url)
	const path = obj.pathname + obj.search + obj.hash
	return path?.toLowerCase()
}

export const getUrlScheme = (url) => {
	const obj = new URL(url)
	return obj.protocol.replace(":", "")
}

export const urlRemoveQueryParameters = (url: string): string => {
	if (!url) {
		return ""
	}

	return url.split("?")[0]
}

export const createHTMLElementFromHTMLString = (htmlString): Element => {
	const container = document.createElement("div")
	container.innerHTML = htmlString
	return container.firstElementChild
}

export const isSelectorExists = (selectors: string, html: ParentNode): boolean => {
	const selector = getAvailableSelector(selectors, html)
	return selector !== null && selector !== undefined
}

export const waitForElement = (selector, html): Promise<Element | null> => {
	const MAX_WAIT_TIME = 60000
	const interval = 100
	let elapsedTime = 0

	return new Promise((resolve, reject) => {
		const checkElement = () => {
			const el = getAvailableSelector(selector, html)

			if (el) {
				resolve(el)
			} else if (elapsedTime >= MAX_WAIT_TIME) {
				debug(`waitForElement:: Timeout waiting for element: ${selector}, element not found!`)
				reject(new Error(`Timeout waiting for element: ${selector}`))
			} else {
				elapsedTime += interval
				setTimeout(checkElement, interval)
			}
		}

		checkElement()
	})
}
