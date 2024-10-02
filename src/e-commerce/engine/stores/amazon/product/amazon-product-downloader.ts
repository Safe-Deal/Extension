import { IProduct } from "../../../../../data/entities/product.interface"
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader"
import { getUrlByAsin } from "../rules/shared/amazon-utils"

const MIN_DELAY_SECONDS = 0.5
const MAX_DELAY_SECONDS = 1.8

export default class AmazonProductDownloader extends BaseProductDownloader {
	constructor(product: IProduct) {
		super({
			productUrl: getUrlByAsin(product.domain, product.id),
			isFetchHtml: true,
			minDelay: MIN_DELAY_SECONDS,
			maxDelay: MAX_DELAY_SECONDS
		})
	}

	public parse(): {} {
		const html = this.remoteResponse
		this.document = html
		return this.document
	}
}
