import { RULE_VALUE } from "../../../../../../../constants/rule-value"
import { calculateProductPricingAlgorithm } from "../rule-pricing-algorithm"

const mockPricing = {
	price: [
		{
			price: 2
		},
		{
			price: 1
		},
		{
			price: 2
		}
	],
	minPrice: 1,
	maxPrice: 3
}

describe("Rule: Pricing", () => {
	describe("Positive scenario", () => {
		it("should return value 10", () => {
			const currentProductPricing = mockPricing
			const expected = calculateProductPricingAlgorithm(2, currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_1)
		})

		it("should return negative value", () => {
			const currentProductPricing = {
				...mockPricing,
				...{ minPrice: 10, maxPrice: 15 }
			}
			const expected = calculateProductPricingAlgorithm(100, currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_2)
		})

		it("should return value 5", () => {
			const currentProductPricing = {
				...mockPricing,
				...{ minPrice: 3, maxPrice: 3 }
			}
			const expected = calculateProductPricingAlgorithm(1.2, currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_5)
		})
	})

	describe("Negative scenario", () => {
		it("Negative scenario", () => {
			expect(calculateProductPricingAlgorithm(1, null)).toEqual(null)
		})

		it("Negative scenario - not found", () => {
			expect(
				calculateProductPricingAlgorithm(1, [
					{
						productID: "4001007173709",
						error: "Not Found "
					}
				])
			).toEqual(null)
		})

		it("Negative scenario null data", () => {
			expect(
				calculateProductPricingAlgorithm(1, [
					{
						productID: "32840510837",
						minPrice: null,
						maxPrice: null,
						price: []
					}
				])
			).toEqual(null)
		})
	})
})
