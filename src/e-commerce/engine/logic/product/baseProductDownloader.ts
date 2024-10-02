import { debug, logError } from "../../../../utils/analytics/logger"
import { MemoryCache } from "../../../../utils/cashing/memoryCache"
import { getDomain } from "../../../../utils/dom/html"
import { HeadersType, Remote } from "../../../../utils/downloaders/remote/remoteFetcher"
import { humanDelayRandomTimeout } from "../../../../utils/general/general"
import { validateManyParams } from "../../../../utils/validators/validators"

const MAX_CYCLES = 3
const URL_PRODUCT_TERMINATOR = "?"
const MIN_DELAY_DEFAULT_SECONDS = 1
const MAX_DELAY_DEFAULT_SECONDS = 7

const cache = new MemoryCache()
const downloadPromises = new Map<string, Promise<any>>()

export type ProductDownloaderParams = {
  productUrl: string;
  isFetchHtml?: boolean;
  minDelay?: number;
  maxDelay?: number;
  urlProductTerminator?: string;
  useBrowserHeaders?: HeadersType;
};
export abstract class BaseProductDownloader {
	protected remoteResponse: string

	protected minDelaySecs: number

	protected maxDelaySecs: number

	protected productUrl: string

	protected document: Document | string | any

	protected isFetchText: boolean

	protected name: string

	protected isCameFromCash: boolean = false

	protected urlProductTerminator: string = null

	protected useBrowserHeaders: HeadersType = HeadersType.BROWSER

	constructor({
		productUrl,
		isFetchHtml = false,
		minDelay = MIN_DELAY_DEFAULT_SECONDS,
		maxDelay = MAX_DELAY_DEFAULT_SECONDS,
		urlProductTerminator = URL_PRODUCT_TERMINATOR,
		useBrowserHeaders = HeadersType.BROWSER
	}: ProductDownloaderParams) {
		this.name = `Downloader:${getDomain(productUrl).toUpperCase().replace("WWW.", "")}:: `
		this.urlProductTerminator = urlProductTerminator
		this.document = null
		this.useBrowserHeaders = useBrowserHeaders

		validateManyParams([
			{ value: minDelay, name: "minDelay" },
			{ value: maxDelay, name: "maxDelay" }
		])

		this.minDelaySecs = minDelay
		this.maxDelaySecs = maxDelay

		this.isFetchText = !isFetchHtml
		this.document = null
		this.remoteResponse = null
		if (this.urlProductTerminator) {
			const [directProductUrl] = productUrl?.split(URL_PRODUCT_TERMINATOR)
			this.productUrl = directProductUrl
		} else {
			this.productUrl = productUrl
		}
	}

  public abstract parse(): {};

  public async download(): Promise<any> {
  	try {
  		const cached = cache.has(this.productUrl)
  		if (cached) {
  			this.isCameFromCash = true
  			const response = cache.get(this.productUrl)
  			return response
  		}

  		if (!downloadPromises.has(this.productUrl)) {
  			const downloadPromise = this.singleDownload()
  			downloadPromises.set(this.productUrl, downloadPromise)

  			downloadPromise.finally(() => {
  				downloadPromises.delete(this.productUrl)
  			})
  		}

  		const response = await downloadPromises.get(this.productUrl)
  		cache.set(this.productUrl, response)
  		return response
  	} catch (error) {
  		logError(error)
  		return Promise.resolve(null)
  	}
  }

  public isFetchOk(): boolean {
  	const isDocumentOk = this.remoteResponse !== null && this.remoteResponse !== undefined
  	if (this.document && isDocumentOk) {
  		Remote.setCachedGet(this.productUrl, this.remoteResponse)
  	}

  	return isDocumentOk
  }

  public invalidateCash() {
  	Remote.setCachedGet(this.productUrl, null)
  }

  private async fetchData() {
  	const res = await Remote.get(this.productUrl, this.isFetchText, true, this.useBrowserHeaders)
  	this.remoteResponse = res?.response
  }

  private async singleDownload(): Promise<any> {
  	let isDownloaded = false
  	let counter = 0
  	isDownloaded = this.isFetchOk()
  	while (!isDownloaded && counter <= MAX_CYCLES) {
  		await this.getHumanDelayPromise(this.productUrl)
  		await this.fetchData()
  		this.parse()
  		isDownloaded = this.isFetchOk()
  		counter += 1
  		if (!isDownloaded) {
  			debug(`${this.name} Download failed of product ${this.productUrl} | counter:${counter}`)
  			Remote.setCachedGet(this.productUrl, { error: "Download failed" })
  			await BaseProductDownloader.clearHumanDelayPromise(this.productUrl)
  		}
  	}

  	return this.document
  }

  private static getHumanDelayCacheKey(url: string): string {
  	return `humanDelayPromise:${url}`
  }

  private static async clearHumanDelayPromise(url: string): Promise<void> {
  	const cacheKey = BaseProductDownloader.getHumanDelayCacheKey(url)
  	if (cache.has(cacheKey)) {
  		cache.delete(cacheKey)
  	}
  }

  private async getHumanDelayPromise(url: string): Promise<void> {
  	const cacheKey = BaseProductDownloader.getHumanDelayCacheKey(url)
  	if (!cache.has(cacheKey)) {
  		const promise = new Promise<void>((resolve) => {
  			humanDelayRandomTimeout(this.minDelaySecs, this.maxDelaySecs, this.name).then(() => {
  				resolve()
  			})
  		})
  		cache.set(cacheKey, promise)
  	}
  	return cache.get(cacheKey)
  }
}
