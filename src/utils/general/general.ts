import { IS_NODE, debug } from "../analytics/logger"
import { browserWindow } from "../dom/html"

export const isExist = (value: any): boolean => value !== null && value !== undefined

export const getPercentage = (value: number, from: number): number => (value * from) / 100

export const parsePrice = (price: unknown): number => {
	const clean = String(price).replace(",", "")
	return parseFloat(clean)
}

export const isBackgroundPage = () =>
	typeof window !== "undefined" && window.location.href.includes("chrome-extension://")

export const distance = (from: number, to: number): number => Math.abs(from - to)
export const isIterable = (obj) => obj != null && typeof obj[Symbol.iterator] === "function"
export const selectFromRange = (range: any, number: number) => {
	if (Number.isNaN(number) || number === null || number === undefined) {
		return NaN
	}

	const value = Math.round(number)
	const endValues = range.map((d) => d.end)
	const max = Math.max(...endValues)

	const startValues = range.map((d) => d.start)
	const min = Math.min(...startValues)

	if (value >= max) {
		const val = range.filter((v) => v.end === max)[0].value
		return val
	}

	if (value <= min) {
		const val = range.filter((v) => v.start === min)[0].value
		return val
	}

	const result = range
		.filter((v) => (value >= v.start && value <= v.end) || (value >= v.end && value <= v.start))
		.map((v) => v.value)

	if (result.length > 0) {
		return result[0]
	}

	throw new Error(`selectFromRange: can't find range for ${value} in ${JSON.stringify(range, null, 2)}`)
}

export const guid = (): string =>
	"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		// eslint-disable-next-line no-bitwise
		const r = (Math.random() * 16) | 0
		// eslint-disable-next-line no-bitwise
		const v = c === "x" ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})

export function isElementInViewport(el: HTMLElement, yBufferInPx: number): boolean {
	const rect = el.getBoundingClientRect()
	return (
		rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < browserWindow().innerWidth &&
    rect.top - yBufferInPx < browserWindow().innerHeight
	)
}

export const isVisible = (el, yBufferInPx: number = 820) => {
	const style = browserWindow().getComputedStyle(el)
	const hidden = style.display === "none" || style.visibility === "hidden"
	const inViewport = isElementInViewport(el, yBufferInPx)
	return !hidden && inViewport
}

export const randomTimeout = async (minSeconds: number = 0.5, maxSeconds: number = 1.8): Promise<void> => {
	const minMs = minSeconds * 1000
	const maxMs = maxSeconds * 1000
	const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs)
	await new Promise((resolve) => setTimeout(resolve, delayMs))
}

export const humanDelayRandomTimeout = (minDelaySecs = 3, maxDelaySecs = 9, name = "humanDelayRandomTimeout") => {
	if (IS_NODE) {
		return Promise.resolve()
	}

	const emulateRandomHumanBehavior = (max) => minDelaySecs + Math.random() * max

	if (maxDelaySecs <= 0) {
		maxDelaySecs = minDelaySecs
	}
	const ms = emulateRandomHumanBehavior(maxDelaySecs) * 1000
	debug(
		` - ${name}:: Human Delay: ~ ${Math.round(ms)} ms -> ${Math.round(ms) / 1000} sec | ${minDelaySecs}-${maxDelaySecs} sec`
	)
	return new Promise((resolve) => setTimeout(resolve, ms))
}

const currencySigns = {
	RUB: "₽",
	BRL: "R$",
	EUR: "€",
	TRY: "₺",
	JPY: "¥",
	KRW: "₩",
	THB: "฿",
	VND: "₫",
	AED: "د.إ",
	ILS: "₪",
	PLN: "zł",
	USD: "$",
	GBP: "£",
	AUD: "A$",
	CAD: "C$",
	CHF: "CHF",
	CNY: "¥",
	HKD: "HK$",
	INR: "₹",
	MYR: "RM",
	NZD: "NZ$",
	PHP: "₱",
	SGD: "S$",
	SEK: "kr",
	NOK: "kr",
	DKK: "kr",
	ZAR: "R",
	MXN: "MX$"
}

export const currencySign = (currency) => currencySigns[currency] || ""
