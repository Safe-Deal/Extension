import {
	IConclusionProductEntity,
	ProductConclusionEnum
} from "../../../../engine/logic/conclusion/conclusion-product-entity.interface"

export const DEFAULT_PRODUCT: IConclusionProductEntity = {
	productConclusion: ProductConclusionEnum.INSUFFICIENT_DATA,
	product: {
		id: "",
		domain: "",
		url: ""
	},
	rules: []
}
