import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { calculateWalmartItemDetailsFeedbackAlgorithm } from "./feedback-algrothm"

describe("Amazon - Rule product feedback algorithm", () => {
	describe("Positive scenario", () => {
		it("great product??", () => {
			const productRatingValue = 5
			const productNumberOfReviewsValue = 99
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_10
			)
		})
		it("great product", () => {
			const productRatingValue = 4.8
			const productNumberOfReviewsValue = 150
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_10
			)
		})

		it("product: https://www.amazon.com/gp/product/B077TQR6ZW", () => {
			const productRatingValue = 4.7
			const productNumberOfReviewsValue = 4737
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_9
			)
		})

		it("product: https://www.amazon.com/Treadmill-Protective-Dustproof-Waterproof-Water-Resistant/dp/B07BPCC4DJ", () => {
			const productRatingValue = 4.5
			const productNumberOfReviewsValue = 106
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_8
			)
		})

		it("product: www.amazon.com/DJI-Mavic-Mini-More-Combo/dp/B07ZJZQQ8K", () => {
			const productRatingValue = 4.6
			const productNumberOfReviewsValue = 934
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_9
			)
		})

		it("product: https://www.amazon.com/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ", () => {
			const productRatingValue = 4.5
			const productNumberOfReviewsValue = 99604
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_8
			)
		})

		it("almost great product", () => {
			const productRatingValue = 4.7
			const productNumberOfReviewsValue = 100
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_9
			)
		})

		it("super popular products", () => {
			const productRatingValue = 4.7
			const productNumberOfReviewsValue = 1002
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_9
			)
		})

		it("product: https://www.amazon.com/DJI-Portable-Quadcopter-Starters-Bundle/dp/B07ZPCYF7Y", () => {
			const productRatingValue = 4.5
			const productNumberOfReviewsValue = 159
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_8
			)
		})

		it("product: https://www.amazon.com/DJI-Two-Way-Charging-Charger-Accessory/dp/B07RKLRM92", () => {
			const productRatingValue = 4.8
			const productNumberOfReviewsValue = 921
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_10
			)
		})

		it("product: https://www.amazon.com/Leather-AIFENG-Magnetic-Detachable-Samsung/dp/B07P51J3GV/", () => {
			const productRatingValue = 4.5
			const productNumberOfReviewsValue = 15 + 5
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_4
			)
		})

		it("should return rule value 1 when there is no ratings, reviews and orders number", () => {
			expect(calculateWalmartItemDetailsFeedbackAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("should return value of 1 for invalid product - tiny amount", () => {
			const rating = 1
			const reviews = 1
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("bad product", () => {
			const rating = 5
			const reviews = 3
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("excellent product", () => {
			const rating = 5
			const reviews = 50
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_8)
		})

		it("poor product with huge amount of reviews", () => {
			const productRatingValue = 3.6
			const productNumberOfReviewsValue = 99604
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_4
			)
		})

		it("super poor product with huge amount of reviews", () => {
			const productRatingValue = 2.6
			const productNumberOfReviewsValue = 99604
			expect(calculateWalmartItemDetailsFeedbackAlgorithm(productRatingValue, productNumberOfReviewsValue)).toBe(
				RULE_VALUE.RULE_VAL_1
			)
		})
	})
})
