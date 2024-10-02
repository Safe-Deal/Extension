import { debug } from "../../../../../utils/analytics/logger"
import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher"
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader"

const MIN_DELAY_SECONDS = 0.005
const MAX_DELAY_SECONDS = 1.8

const POSITIVE = "ref=cm_cr_arp_d_viewopt_sr?sortBy=recent&pageNumber=1&filterByStar=positive"
const NEGATIVE = "ref=cm_cr_arp_d_viewopt_sr?sortBy=recent&pageNumber=1&filterByStar=critical"

export enum REVIEWS_TYPE {
  REGULAR,
  POSITIVE = "positive",
  NEGATIVE = "negative"
}

export default class AmazonFeedbackDownloader extends BaseProductDownloader {
	constructor(productsId: string, storeDomain: string, type = REVIEWS_TYPE.REGULAR) {
		let url = `https://${storeDomain}/product-reviews/${productsId}/`
		if (type === REVIEWS_TYPE.POSITIVE) {
			url += POSITIVE
		} else if (type === REVIEWS_TYPE.NEGATIVE) {
			url += NEGATIVE
		}
		super({
			productUrl: url,
			isFetchHtml: true,
			minDelay: MIN_DELAY_SECONDS,
			maxDelay: MAX_DELAY_SECONDS,
			urlProductTerminator: null,
			useBrowserHeaders: HeadersType.CRAWLER
		})
	}

	public parse() {
		const html = this.remoteResponse
		this.document = null
		if (html) {
			const blocked = this?.document?.innerHTML?.includes("/captcha/")
			if (blocked) {
				debug(`AmazonFeedbackDownloader::parse::blocked - ${this.productUrl}`)
			} else {
				this.document = html
			}
		}

		return this.document
	}
}
