import { IRuleManagerResult } from "../../../../data/entities/rule-manager-result.interface"
import { ConclusionProduct } from "./conclusion-product"
import { ProductConclusionEnum } from "./conclusion-product-entity.interface"

describe("Conclusion Product", () => {
	const ruleManagerResultMock: IRuleManagerResult = {
		product: {
			id: "4000117654955",
			domain: "aliexpress.com",
			url: "https://www.aliexpress.com/item/4000117654955.html"
		},
		rules: [
			{
				value: 2,
				weight: 3,
				bonus: {
					isBonusRule: false,
					value: 0
				},
				isValidRule: true
			},
			{
				value: 2,
				weight: 3,
				bonus: {
					isBonusRule: false,
					value: 0
				},
				isValidRule: true
			}
		]
	}

	it("conclusion algorithm need to return unsafe result for the product", () => {
		const conclusionProduct = new ConclusionProduct(ruleManagerResultMock)
		const x = conclusionProduct.conclusion()
		expect(x.productConclusion).toBe(ProductConclusionEnum.NOT_RECOMMENDED)
	})

	it("conclusion algorithm need to return safe result for the product", () => {
		ruleManagerResultMock.rules = [
			{
				value: 10,
				weight: 10,
				bonus: {
					isBonusRule: false,
					value: 0
				},
				isValidRule: true
			},
			{
				value: 10,
				weight: 10,
				bonus: {
					isBonusRule: false,
					value: 0
				},
				isValidRule: true
			}
		]
		const conclusionProduct = new ConclusionProduct(ruleManagerResultMock)
		const x = conclusionProduct.conclusion()
		expect(x.productConclusion).toBe(ProductConclusionEnum.RECOMMENDED)
	})

	it("conclusion algorithm need to return safe result for the product if the bonus rules are great", () => {
		ruleManagerResultMock.rules = [
			{
				value: 4,
				weight: 10,
				bonus: {
					isBonusRule: true,
					value: 50
				},
				isValidRule: true
			},
			{
				value: 4,
				weight: 10,
				bonus: {
					isBonusRule: true,
					value: 50
				},
				isValidRule: true
			}
		]
		const conclusionProduct = new ConclusionProduct(ruleManagerResultMock)
		const x = conclusionProduct.conclusion()
		expect(x.productConclusion).toBe(ProductConclusionEnum.RECOMMENDED)
	})

	it("conclusion algorithm need to return safe result for the product if the bonus rules ase so so", () => {
		ruleManagerResultMock.rules = [
			{
				value: 3,
				weight: 10,
				bonus: {
					isBonusRule: false,
					value: 1
				},
				isValidRule: true
			},
			{
				value: 3,
				weight: 10,
				bonus: {
					isBonusRule: false,
					value: 1
				},
				isValidRule: true
			}
		]
		const conclusionProduct = new ConclusionProduct(ruleManagerResultMock)
		const x = conclusionProduct.conclusion()
		expect(x.productConclusion).toBe(ProductConclusionEnum.DOUBTFUL)
	})

	it("conclusion algorithm need to throw error when bonus value is incorrect like a negative number", () => {
		ruleManagerResultMock.rules = [
			{
				value: 10,
				weight: 10,
				bonus: {
					isBonusRule: true,
					value: -50
				},
				isValidRule: true
			},
			{
				value: 10,
				weight: 10,
				bonus: {
					isBonusRule: true,
					value: -50
				},
				isValidRule: true
			}
		]
		const conclusionProduct = new ConclusionProduct(ruleManagerResultMock)
		try {
			const x = conclusionProduct.conclusion()
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
			expect(error).toHaveProperty("message", "Bonus Cannot be a negative number")
		}
	})
})
