import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { calculateProductFeedbackValueAlgorithm } from "./rule-product-feedback-algorithm"

describe("Amazon - Rule product feedback algorithm", () => {
	describe("Positive scenario - great product 4.8 and up", () => {
		it("4.8 should pass on good rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 50
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("4.8 should pass on great rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("4.8 should pass on medium rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 30
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("4.8 should pass on low rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 20
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_9)
		})

		it("4.8 should pass on so so rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 15
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_9)
		})

		it("4.8 should pass on very low rate", () => {
			const rating = 4.8
			const onlyRate = 100
			const review = 5
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_8)
		})

		it("valid product - medium amount", () => {
			const rating = 4.5
			const onlyRate = 100
			const review = 50
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_9)
		})

		it("valid product - low amount", () => {
			const rating = 4.3
			const onlyRate = 100
			const review = 20
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_7)
		})

		it("should return value of 10 for valid product - good amount", () => {
			const rating = 4.1
			const onlyRate = 523
			const review = 388
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_8)
		})

		it("4.8 should pass on good rate 1", () => {
			const rating = 5
			const onlyRate = 100
			const review = 50
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("3.7 should  fail but with  1 rating | https://www.amazon.com/Finding-Dory-Penny-Bank-Combination/dp/B01FVYGVX4/", () => {
			const rating = 3.7
			const onlyRate = 3
			const review = 3
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("2.3 should | https://www.amazon.com/KCEN-Gravity-Auto-Clamping-Handsfree-Compatible/product-reviews/B07W8VG2XP", () => {
			const rating = 2.3
			const onlyRate = 15
			const review = 9
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_1)
		})
	})

	describe("Positive scenario - medium product 4.1 and up", () => {
		const rating = 4.1
		it("4.1 should fails on good rate", () => {
			const onlyRate = 100
			const review = 50
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_8)
		})

		it("4.1 should pass on great rate", () => {
			const onlyRate = 100
			const review = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("4.1 should pass on medium rate", () => {
			const onlyRate = 1000
			const review = 300
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_7)
		})

		it("4.1 should pass on low rate", () => {
			const onlyRate = 100
			const review = 20
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_7)
		})

		it("4.1 should pass on so so rate", () => {
			const onlyRate = 100
			const review = 15
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_7)
		})

		it("4.1 should pass on very low rate", () => {
			const onlyRate = 100
			const review = 5
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_4)
		})
	})

	describe("Positive scenario - bad product 3.8 and down", () => {
		const rating = 3.6
		it("3.6 should fails on good rate", () => {
			const onlyRate = 100
			const review = 50
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("3.6 should pass on great rate", () => {
			const onlyRate = 100
			const review = 100
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("3.6 should pass on medium rate", () => {
			const onlyRate = 1000
			const review = 300
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("3.6 should pass on low rate", () => {
			const onlyRate = 100
			const review = 20
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("3.6 should pass on so so rate", () => {
			const onlyRate = 100
			const review = 15
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_4)
		})

		it("3.6 should pass on very low rate", () => {
			const onlyRate = 100
			const review = 5
			expect(calculateProductFeedbackValueAlgorithm(rating, onlyRate, review)).toBe(RULE_VALUE.RULE_VAL_1)
		})
	})

	describe("Negative scenario", () => {
		it("should return rule value 1 when there is no ratings, reviews and orders number", () => {
			expect(calculateProductFeedbackValueAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("should return value of 1 for invalid product - tiny amount", () => {
			const rating = 1
			const reviews = 1
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1)
		})

		it("should return value of 4 when orders not exist", () => {
			const rating = 4.3
			const reviews = 3
			expect(calculateProductFeedbackValueAlgorithm(rating, reviews)).toBe(RULE_VALUE.RULE_VAL_1)
		})
	})
})
