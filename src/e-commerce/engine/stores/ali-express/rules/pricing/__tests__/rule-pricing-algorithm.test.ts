import { RULE_VALUE } from "../../../../../../../constants/rule-value"
import { calculateProductPricingAlgorithm } from "../rule-pricing-algorithm"

const mockPricing = {
	price: [
		{
			minPrice: 2,
			maxPrice: 2
		},
		{
			minPrice: 1,
			maxPrice: 3
		},
		{
			minPrice: 2,
			maxPrice: 4
		}
	],
	minPrice: 1,
	maxPrice: 3
}

describe("Rule: Pricing", () => {
	describe("Positive scenario", () => {
		it("should return value 10", () => {
			const currentProductPricing = mockPricing
			const expected = calculateProductPricingAlgorithm(currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_3)
		})

		it("should return negative value", () => {
			const currentProductPricing = {
				...mockPricing,
				...{ minPrice: 10, maxPrice: 15 }
			}
			const expected = calculateProductPricingAlgorithm(currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_3)
		})

		it("should return value 5", () => {
			const currentProductPricing = {
				...mockPricing,
				...{ minPrice: 3, maxPrice: 3 }
			}
			const expected = calculateProductPricingAlgorithm(currentProductPricing).normalizeValue
			expect(expected).toEqual(RULE_VALUE.RULE_VAL_3)
		})
	})

	describe("Negative scenario", () => {
		it("Negative scenario", () => {
			expect(calculateProductPricingAlgorithm(null)).toEqual(null)
		})

		it("Negative scenario - not found", () => {
			expect(
				calculateProductPricingAlgorithm([
					{
						productID: "4001007173709",
						error: "Not Found "
					}
				])
			).toEqual(null)
		})

		it("Negative scenario null data", () => {
			expect(
				calculateProductPricingAlgorithm([
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
