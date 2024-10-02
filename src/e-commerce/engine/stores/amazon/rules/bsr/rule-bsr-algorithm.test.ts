import { RULE_VALUE } from "../../../../../../constants/rule-value"
import { calculateBsrValueAlgorithm } from "./rule-bsr-algorithm"

describe("Amazon - Rule product feedback algorithm", () => {
	describe("Positive scenario", () => {
		it("should return value 10", () => {
			const bsr = 91
			expect(calculateBsrValueAlgorithm(bsr)).toBe(RULE_VALUE.RULE_VAL_10)
		})

		it("should return value of 6 for valid product - medium amount", () => {
			const bsr = 12000
			expect(calculateBsrValueAlgorithm(bsr)).toBe(RULE_VALUE.RULE_VAL_6)
		})

		it("should return value of 6 for valid product - medium amount 1", () => {
			const bsr = 92571
			expect(calculateBsrValueAlgorithm(bsr)).toBe(RULE_VALUE.RULE_VAL_3)
		})

		it("should return value of 1", () => {
			const bsr = 25000
			expect(calculateBsrValueAlgorithm(bsr)).toBe(RULE_VALUE.RULE_VAL_5)
		})
	})

	describe("Negative scenario", () => {
		it("should return rule value 1 when there is no ratings, reviews and orders number", () => {
			expect(calculateBsrValueAlgorithm()).toBe(RULE_VALUE.RULE_VAL_1)
		})
	})
})
