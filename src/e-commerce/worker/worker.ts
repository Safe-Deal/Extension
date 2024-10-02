import PQueue from "p-queue"
import { IProduct } from "../../data/entities/product.interface"
import { ISiteResponse } from "../../data/entities/site-response.interface"
import { ConclusionManager } from "../../data/rules-conclusion/conclusion-manager"
import { IConclusionResponse } from "../../data/rules-conclusion/conclusion-response.interface"
import { RuleManager } from "../../data/rules/rule-manager"
import { Site } from "../../data/sites/site"
import { SiteFactory } from "../../data/sites/site-factory"
import { debug, logError } from "../../utils/analytics/logger"
import { MemoryCache } from "../../utils/cashing/memoryCache"
import { ECOMMERCE_GLUE } from "../../utils/extension/glue"
import { SiteMetadata } from "../../utils/site/site-information"
import { IConclusionProductEntity } from "../engine/logic/conclusion/conclusion-product-entity.interface"
import { convertSiteToSiteResponse } from "../engine/logic/utils/convertors"
import { SiteUtil } from "../engine/logic/utils/site-utils"

const MAX_PARALLEL_PROCESSING = 8

const queue = new PQueue({ concurrency: MAX_PARALLEL_PROCESSING })
const cash = new MemoryCache()

export interface IBackgroundListenerMessage {
  document: string;
  url: {
    domain: string;
    domainURL: string;
    pathName: string;
    queryParams: string;
    url: string;
  };
  product: IProduct;
}

const reportError = ({ error, productId, postMessage, siteResponse, cashingKey }) => {
	const conclusionResponse: IConclusionResponse = {
		conclusionProductEntity: [],
		error: error?.toString(),
		site: siteResponse,
		productId
	}
	cash.delete(cashingKey)
	postMessage(conclusionResponse)
	logError(error)
}

const processProduct = async (data: IBackgroundListenerMessage, postMessage: (message: object) => void) => {
	let siteResponse: ISiteResponse = null
	let productId: string = null
	let cashingKey: string = null
	try {
		productId = data?.product?.id
		debug(`Processing Product #${data?.product?.id}`, "Worker::analyze")
		const isItem = SiteUtil.isItemDetails(data.url.url)
		cashingKey = `${data.url.domain}_${productId}_${isItem ? "item" : "list"}`
		if (cash.has(cashingKey)) {
			const result = cash.get(cashingKey)
			postMessage(result)
			debug(`Product #${productId} is already in processed returning from cash`, "Worker::analyze")
			return
		}

		const dom = SiteMetadata.getDom(data)
		const site: Site = new SiteFactory().create({
			url: data?.url?.url,
			pathName: data?.url?.pathName,
			dom
		})
		siteResponse = convertSiteToSiteResponse(site)

		debug(`Found: ${data?.url?.domainURL} with ${site?.rules?.length} rules for: ${site?.pathName}`, "Worker::analyze")

		const { rules } = site
		const { siteDomSelector } = site

		const { product } = data
		debug(`Product: ${productId || data?.url?.pathName} `)

		if (!rules) {
			debug(`Rules Not Found !!! on: ${site.url}`)
		}

		debug(`Running Rules: ${productId} ....`, "Worker::analyze")
		product.domain = data.url.domain
		product.document = data.document
		const ruleManager = new RuleManager([product], rules, siteDomSelector)
		const conclusionManager = new ConclusionManager(ruleManager)
		const conclusionProductEntities: IConclusionProductEntity[] = await conclusionManager.conclusion()
		const conclusionResponse: IConclusionResponse = {
			conclusionProductEntity: conclusionProductEntities,
			site: siteResponse,
			productId: product.id
		}
		cash.set(cashingKey, conclusionResponse)
		postMessage(conclusionResponse)
		debug(`Processing of: ${product?.id} .... Done - Response sent.`, "Worker::analyze")
	} catch (error) {
		reportError({ error, productId, postMessage, siteResponse, cashingKey })
	}
}

export const initCommerce = () => {
	ECOMMERCE_GLUE.worker(async (data, postMessage) => {
		const { product, type } = data
		if (type === ECOMMERCE_GLUE.PRODUCT) {
			try {
				queue.pause()
				await processProduct(product, postMessage)
				queue.start()
			} catch (error) {
				reportError({
					error,
					productId: product?.id,
					postMessage,
					siteResponse: null,
					cashingKey: null
				})
			}
		} else {
			queue.add(() =>
				processProduct(product, postMessage).catch((error) => {
					reportError({
						error,
						productId: product?.id,
						postMessage,
						siteResponse: null,
						cashingKey: null
					})
				})
			)
		}
	})
}
