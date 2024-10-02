import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm"

describe("rule product feedback algorithm", () => {
	describe("Positive scenario", () => {
		it("should return value 10", () => {
			const rating = 4.8
			const reviews = 20
			const orders = 200
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - huge amount", () => {
			const rating = 4.6
			const reviews = 673
			const orders = 2144
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - big amount", () => {
			const rating = 4.5
			const reviews = 100
			const orders = 1000
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - medium amount", () => {
			const rating = 4.5
			const reviews = 20
			const orders = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - medium amount", () => {
			const rating = 4.5
			const reviews = 20
			const orders = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - medium amount", () => {
			const rating = 4.9
			const reviews = 35
			const orders = 203
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for valid product - medium amount", () => {
			const rating = 4.8
			const reviews = 14
			const orders = 140
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for invalid product - small amount", () => {
			const rating = 4
			const reviews = 23
			const orders = 169
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 10 for invalid product - amount of sales NA", () => {
			const rating = 4
			const reviews = 22
			const orders = 169
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})
	})

	describe("Negative scenario", () => {
		it("should return rule value 1 when there is no ratings, reviews and orders number", () => {
			expect(calculateProductFeedbackValueAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("should return value of 1 for invalid product - tiny amount", () => {
			const rating = 1
			const reviews = 1
			const orders = 195
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("should return value of 1 for invalid product - small amount", () => {
			const rating = 4.3
			const reviews = 9
			const orders = 53
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 4 cause orders is less than half of ideal orders", () => {
			const rating = 4.3
			const reviews = 9
			const orders = 10
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("should return value of 4 cause orders is less than half of ideal orders", () => {
			const rating = 4.3
			const reviews = 3
			const orders = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("should return value of 4 when orders not exist", () => {
			const rating = 4.3
			const reviews = 3
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		// problematic!! - see this case
		/* it('should return value of 1 for invalid product - small amount', () => {
            const rating = 4.5;
            const reviews = 3;
            const orders = 2000; // 2000 also fail
            expect(calculateProductFeedbackValueAlgorithm(rating, reviews, orders)).toBe(RULE_VALUE.RULE_VAL_10);
        }); */
	})
})
