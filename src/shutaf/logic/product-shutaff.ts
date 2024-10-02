import { IShutaf, IShutafUrl, ShutafType } from "../../data/entities/shutaf.interface"
import { debug, logError } from "../../utils/analytics/logger"
import { MemoryCache } from "../../utils/cashing/memoryCache"
import { urlRemoveQueryParameters } from "../../utils/dom/html"
import { ApiDownloader } from "../../utils/downloaders/apiDownloader"
import {
	getShutafByUrl,
	getUrlFromShutafParams,
	isApiCallRequeued,
	isOnItemPage as isOnMatchingPage
} from "./ShutafUtils"
import { ShutafRemotesService } from "./ShutafRemotesService"
import { ShutafTabManger } from "./ShutafTabManger"

const URL_EXP_MINUTES = 8
const OPENED_URLS = new MemoryCache(URL_EXP_MINUTES)
const NOT_ALLOWED = "NOT_POSSIBLE_TO_GET_SHUTAFF_LINK"
const SHUTAF_URL = "/links"

export class ProductShutaf {
	private api: ApiDownloader

	private url: URL

	private shutaf: IShutaf

	private viaApi: boolean

	constructor(url: string, api: ApiDownloader = new ApiDownloader(SHUTAF_URL)) {
		try {
			this.url = new URL(url)
			this.api = api
			this.shutaf = null
		} catch (e) {
			debug(`Invalid URL: ${url}`, "ProductShutaf::constructor")
		}
	}

	private async initData() {
		const shutafArr = await ShutafRemotesService.fetchData()
		this.shutaf = getShutafByUrl(this.url, shutafArr)
		this.viaApi = isApiCallRequeued(this.shutaf)
	}

	public async execute(): Promise<string | null> {
		if (!this.url) {
			return null
		}
		await this.initData()
		if (!this.shutaf) {
			return null
		}

		if (isOnMatchingPage(this.url, this.shutaf)) {
			debug(`Page Item Invoking - Shutaf | ${this.url} ....`, "Shutaff::execute")
			const toExecute = await this.constructLink()
			if (toExecute) {
				ProductShutaf.openTab(toExecute)
				return toExecute.shutaff
			}

			return null
		}

		return null
	}

	private createShutafLink() {
		let result = ""
		if (this.shutaf.targetParam || this.shutaf.targetParamName) {
			result = getUrlFromShutafParams(
				this.shutaf.shutaf,
				this.url.href,
				this.shutaf.targetParam,
				this.shutaf.targetParamName
			)
		} else {
			result = `${this.shutaf.shutaf}${encodeURI(this.url.href)}`
		}
		return result
	}

	private async constructLink(): Promise<IShutafUrl | null> {
		if (!this.viaApi) {
			const target = this.createShutafLink()
			return {
				product: this.url.href,
				shutaff: target,
				provider: this.shutaf
			}
		}

		const link = urlRemoveQueryParameters(this.url.href)
		const request = { links: [link] }

		try {
			const data = await this.api.post(request)

			if (!data) {
				debug(
					`No Shutaff returned from the server. Request: ${JSON.stringify(request)} Response: ${JSON.stringify(data)}`,
					"Shutaff::execute"
				)
				return null
			}

			const [links] = data

			if (links.shutaff === NOT_ALLOWED) {
				debug(`${this.url.pathname} .... NOT_POSSIBLE_TO_GET_SHUTAFF_LINK Stopping.`, "Shutaff::execute")
				return null
			}

			if (links) {
				if (Array.isArray(links.links)) {
					for (const link of links.links) {
						link.provider = this.shutaf
					}
				} else {
					links.provider = this.shutaf
				}
			}

			return links
		} catch (error) {
			logError(error, "Shutaff::execute")
			return null
		}
	}

	private static openTab(shutaff: IShutafUrl) {
		const link = shutaff?.shutaff
		if (!link) {
			debug("No Link found, skipping", "Shutaff::openTab")
			return
		}

		const provider = shutaff?.provider
		let domainShutafLink = null
		if (provider) {
			if (provider.shutaf !== ShutafType.API && provider.target === "/") {
				domainShutafLink = provider.domain
				const isDomainOpened = OPENED_URLS.get(domainShutafLink)
				if (isDomainOpened) {
					debug(`Domain was opened already, skipping ${domainShutafLink}`, "Shutaff::openTab")
					return
				}
			}
		}

		const isLinkOpened = OPENED_URLS.get(link)

		if (!isLinkOpened) {
			OPENED_URLS.set(link, true)
			if (domainShutafLink) {
				OPENED_URLS.set(domainShutafLink, true)
			}
			ShutafTabManger.scheduleShutafLink(link)
		} else {
			debug(`Link was opened already, skipping ${link}`, "Shutaff::openTab")
		}
	}
}
