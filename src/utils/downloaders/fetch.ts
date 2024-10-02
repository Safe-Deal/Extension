import { debug } from "../analytics/logger"
import { parseAsHtml, ParsedHtml } from "../dom/html"
import { HeadersType } from "./remote/remoteFetcher"

export const STATUS_NOT_200 = "RESPONSE_STATUS_NOT_200"

const userAgents = [
	{
		"Sec-Ch-Ua": "\"Google Chrome\";v=\"91\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"91\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Google Chrome\";v=\"92\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"92\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Mozilla\";v=\"89\", \" Not;A Brand\";v=\"99\", \"Firefox\";v=\"89\"",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
	},
	{
		"Sec-Ch-Ua": "\"Mozilla\";v=\"90\", \" Not;A Brand\";v=\"99\", \"Firefox\";v=\"90\"",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0"
	},
	{
		"Sec-Ch-Ua": "\"Microsoft Edge\";v=\"91\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"91\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Microsoft Edge\";v=\"92\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"92\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/92.0.902.67 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Opera\";v=\"77\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"91\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277"
	},
	{
		"Sec-Ch-Ua": "\"Opera\";v=\"78\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"92\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 OPR/78.0.4093.231"
	},
	{
		"Sec-Ch-Ua": "\"Safari\";v=\"14\", \" Not;A Brand\";v=\"99\", \"WebKit\";v=\"605\"",
		"User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15"
	},
	{
		"Sec-Ch-Ua": "\"Safari\";v=\"13\", \" Not;A Brand\";v=\"99\", \"WebKit\";v=\"605\"",
		"User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15"
	},
	{
		"Sec-Ch-Ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Google Chrome\";v=\"94\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"94\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Mozilla\";v=\"91\", \" Not;A Brand\";v=\"99\", \"Firefox\";v=\"91\"",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
	},
	{
		"Sec-Ch-Ua": "\"Mozilla\";v=\"92\", \" Not;A Brand\";v=\"99\", \"Firefox\";v=\"92\"",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0"
	},
	{
		"Sec-Ch-Ua": "\"Microsoft Edge\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/93.0.961.52 Safari/537.36"
	},
	{
		"Sec-Ch-Ua": "\"Microsoft Edge\";v=\"94\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"94\"",
		"User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/94.0.992.50 Safari/537.36"
	}
]

const getRandomUserAgent = () => {
	const randomIndex = Math.floor(Math.random() * userAgents.length)
	return userAgents[randomIndex]
}

const crawlerAgents = [
	{ "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" },
	{ "User-Agent": "Bingbot/2.0; +http://www.bing.com/bingbot.htm" },
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-ads/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-cpro/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-favo/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-image/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-news/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Baiduspider-video/2.0; +http://www.baidu.com/search/spider.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)"
	},
	{
		"User-Agent": "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; Ask Jeeves/Teoma; +http://about.ask.com/en/docs/about/webmasters.shtml)"
	},
	{
		"User-Agent": "Mozilla/5.0 (compatible; SeznamBot/3.2; +http://fulltext.sblog.cz/)"
	}
]

const getRandomCrawlerAgent = () => {
	const randomIndex = Math.floor(Math.random() * crawlerAgents.length)
	return crawlerAgents[randomIndex]
}

const CRAWLER_HEADERS = (): HeadersInit => {
	const randomCrawlerAgent = getRandomCrawlerAgent()
	return {
		"User-Agent": randomCrawlerAgent["User-Agent"],
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "en-US,en;q=0.5"
	}
}

const CLIENT_HEADERS = (url: string): HeadersInit => {
	const randomUserAgent = getRandomUserAgent()
	return {
		Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "en-US,en;q=0.5",
		"Cache-Control": "max-age=0",
		"Device-Memory": "8",
		Dnt: "1",
		Downlink: "10",
		Dpr: "2",
		Ect: "4g",
		Rtt: "50",
		"Sec-Ch-Device-Memory": "8",
		"Sec-Ch-Dpr": "2",
		"Sec-Ch-Ua": randomUserAgent["Sec-Ch-Ua"],
		"Sec-Ch-Ua-Mobile": "?0",
		"Sec-Ch-Ua-Platform": "\"macOS\"",
		"Sec-Ch-Viewport-Width": "451",
		"Sec-Fetch-Dest": "document",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-User": "?1",
		"Upgrade-Insecure-Requests": "1",
		"User-Agent": randomUserAgent["User-Agent"],
		"Viewport-Width": "451",
		referrer: url
	}
}

const OPTIONS = (useBrowserHeaders: HeadersType, url: string): RequestInit => {
	let headers = {}
	switch (useBrowserHeaders) {
	case HeadersType.NONE:
		headers = {}
		break
	case HeadersType.BROWSER:
		headers = CLIENT_HEADERS(url)
		break
	case HeadersType.CRAWLER:
		headers = CRAWLER_HEADERS()
		break
	default:
		headers = CLIENT_HEADERS(url)
		break
	}

	return {
		mode: "cors",
		credentials: "include",
		referrerPolicy: "strict-origin-when-cross-origin",
		cache: "no-cache",
		redirect: "follow",
		headers
	}
}

const OPTIONS_AS_API: RequestInit = {
	mode: "cors",
	credentials: "include",
	referrerPolicy: "strict-origin-when-cross-origin",
	cache: "no-cache",
	redirect: "follow",
	headers: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/json"
	}
}

const OPTIONS_AS_BROWSER: RequestInit = {
	mode: "cors",
	credentials: "include",
	referrerPolicy: "strict-origin-when-cross-origin",
	cache: "no-cache",
	redirect: "follow",
	headers: {
		Accept: "text/html,*/*",
		"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
	}
}

export function fetchHtml(
	url,
	useBrowserHeaders: HeadersType,
	treatCodeAsProper = []
): Promise<ParsedHtml | string | void> {
	return fetch(url, {
		method: "GET",
		...OPTIONS(useBrowserHeaders, url)
	})
		.then((response) => {
			if (response.status === 200) {
				return response.text()
			}
			if (treatCodeAsProper.includes(response.status)) {
				return response.text()
			}
			return STATUS_NOT_200
		})
		.then((data) => {
			if (data === STATUS_NOT_200) {
				return STATUS_NOT_200
			}
			const doc = parseAsHtml(data)
			return doc
		})
		.catch((err) => {
			debug(`fetchHtml ${url} failed with ${JSON.stringify(err, null, 2)}`)
		})
}

export function fetchText(
	url,
	useBrowserHeaders: HeadersType,
	treatCodeAsProper = []
): Promise<ParsedHtml | string | void> {
	return fetch(url, {
		method: "GET",
		...OPTIONS(useBrowserHeaders, url)
	})
		.then((response) => {
			if (response.status === 200) {
				return response.text()
			}
			if (treatCodeAsProper.includes(response.status)) {
				return response.text()
			}
			return STATUS_NOT_200
		})
		.catch((err) => {
			debug(`fetchText ${url} failed with ${JSON.stringify(err, null, 2)}`)
		})
}

export function postFetchJson(url, json): Promise<any> {
	return fetch(url, {
		method: "POST",
		body: JSON.stringify(json),
		...OPTIONS_AS_API
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((err) => {
			debug(`postFetchJson ${url} failed with ${err?.message}`)
		})
}

export function postFetchBody(url, body): Promise<any> {
	return fetch(url, {
		method: "POST",
		body,
		...OPTIONS_AS_BROWSER
	})
		.then((response) => response.text())
		.then((data) => data)
		.catch((err) => {
			debug(`postFetchBody ${url} failed with ${JSON.stringify(err, null, 2)}`)
		})
}

export function getFetchJson(url, params = {}): Promise<any> {
	return fetch(url, {
		method: "GET",
		...OPTIONS_AS_API,
		...params
	})
		.then((response) => response.json())
		.then((data) => data)
		.catch((err) => {
			debug(`getFetchJson ${url} failed with ${JSON.stringify(err, null, 2)}`)
		})
}
