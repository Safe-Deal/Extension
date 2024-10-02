import { IProduct } from "../../../../data/entities/product.interface"
import { getDomain } from "../../../../utils/dom/html"
import { ProductStore } from "../../logic/conclusion/conclusion-product-entity.interface"
import { IMetaData } from "../meta-data.interface"

const getLatestCategory = (data) => {
	const categoryTree = data?.product?.details?.categoryTree
	return categoryTree && categoryTree.length > 0 ? categoryTree[categoryTree.length - 1].name : undefined
}

export default async function extractAmazonMeta(
	dataset: any,
	url: string,
	productRequest: IProduct
): Promise<IMetaData> {
	const domain = productRequest.domain || getDomain(url)
	const product = dataset?.product || productRequest
	const categoryName = dataset?.product?.category || getLatestCategory(product)
	const productData = product.details || {
		...product,
		title: undefined,
		description: undefined,
		images: undefined,
		asin: undefined
	}
	const images = typeof product?.images === "string" ? product?.images?.split(",") : product?.images
	const description = product?.description?.trim() ? product?.description?.trim() : product?.features?.join("\n")

	const result = {
		domain,
		source: ProductStore.AMAZON,
		id: product?.asin || product?.id || productRequest?.id,
		category: categoryName || product?.productGroup,
		title: product?.title,
		description,
		images,
		related: product?.frequentlyBoughtTogether,
		price: {
			currency: dataset?.currency,
			maxPrice: dataset?.maxPrice,
			minPrice: dataset?.minPrice,
			price: dataset?.price
		},
		details: {
			...productData,
			images: undefined,
			title: undefined,
			description: undefined,
			asin: undefined,
			frequentlyBoughtTogether: undefined
		}
	}
	return Promise.resolve(result)
}
