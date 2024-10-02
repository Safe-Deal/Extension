import { IProduct } from "../../../../../data/entities/product.interface"
import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher"
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader"

const MIN_DELAY_SECONDS = 0.005
const MAX_DELAY_SECONDS = 0.9

const buildUrl = (id, domain) => `https://${domain}/itm/${id}`

export default class eBayProductDownloader extends BaseProductDownloader {
	constructor(product: IProduct) {
		super({
			productUrl: buildUrl(product.id, product.domain),
			isFetchHtml: true,
			minDelay: MIN_DELAY_SECONDS,
			maxDelay: MAX_DELAY_SECONDS,
			useBrowserHeaders: HeadersType.NONE
		})
	}

	public parse(): unknown {
		const html = this.remoteResponse
		this.document = html

		return this.document
	}
}
