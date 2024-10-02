import { IProduct } from "../../../../../data/entities/product.interface"
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader"
import { getUrlByAsin } from "../rules/shared/walmart-utils"

const MIN_DELAY_SECONDS = 2.8
const MAX_DELAY_SECONDS = 4.5

export default class WalmartProductDownloader extends BaseProductDownloader {
	constructor(product: IProduct) {
		super({
			productUrl: getUrlByAsin(product.id, product.domain),
			isFetchHtml: true,
			minDelay: MIN_DELAY_SECONDS,
			maxDelay: MAX_DELAY_SECONDS
		})
	}

	public parse(): unknown {
		const html = this.remoteResponse
		this.document = html
		return this.document
	}
}
