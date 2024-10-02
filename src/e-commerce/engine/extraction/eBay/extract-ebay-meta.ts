import { IProduct } from "../../../../data/entities/product.interface"
import eBayProductDownloader from "../../stores/ebay/product/ebay-product-downloader"
import { IMetaData } from "../meta-data.interface"

export const extractEbayMeta = async (dataset: any, url: string, product: IProduct): Promise<IMetaData> => {
	const downloader = new eBayProductDownloader(product)
	const html = await downloader.download()
	const title = html?.querySelector("head > title")?.textContent.split("|")[0].trim()
	const description = html?.querySelector("meta[name='description']")?.getAttribute("content")
	const images = getImageUrls(html)
	const { category = undefined, categoryTree = [] } = getCategories(html)

	return {
		title,
		category,
		domain: product.domain,
		source: "eBay",
		id: product.id,
		description,
		images,
		related: [],
		categoryTree,
		...dataset
	}
}

const getCategories = (document: Document): { category: string; categoryTree: string[] } => {
	const breadcrumbItems = document.querySelectorAll(".seo-breadcrumbs-container .seo-breadcrumb-text span")
	const categories = Array.from(breadcrumbItems).map((item) => item.textContent || "")
	const category = categories.length > 0 ? categories[0] : ""
	const categoryTree = categories
	return { category, categoryTree }
}

const getImageUrls = (document: Document): string[] => {
	const images = document.querySelectorAll<HTMLImageElement>(".picture-panel-container img")
	const urls = Array.from(images).map((img) => img.src || img.getAttribute("data-src") || "")
	return urls.filter((url) => url !== "")
}
