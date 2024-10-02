import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher"
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader"

const MIN_DELAY_SECONDS = 0.5
const MAX_DELAY_SECONDS = 1.8

export default class AmazonStoreDownloader extends BaseProductDownloader {
	constructor(storeName: string, storeDomain: string, storeUrl = null) {
		const url = storeName
			? `https://${storeDomain}/sp?ie=UTF8&seller=${storeName}&ref_=dp_merchant_link`
			: `https://${storeDomain}${storeUrl}`

		super({
			productUrl: url,
			isFetchHtml: true,
			minDelay: MIN_DELAY_SECONDS,
			maxDelay: MAX_DELAY_SECONDS,
			urlProductTerminator: null,
			useBrowserHeaders: HeadersType.CRAWLER
		})
	}

	public parse(): {} {
		const html: any = this.remoteResponse
		if (html) {
			this.document = html
			return this.document
		}
		this.document = null
		return null
	}
}
