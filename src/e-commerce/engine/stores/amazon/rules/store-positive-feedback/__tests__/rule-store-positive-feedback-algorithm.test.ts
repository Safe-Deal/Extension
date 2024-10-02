import { RULE_VALUE } from "../../../../../../../constants/rule-value"
import { calculateStorePositiveFeedbackValueAlgorithm } from "../rule-store-positive-feedback-algorithm"

describe("rule product feedback algorithm", () => {
	it("should return value 10", () => {
		const storePositiveFeedback = 99
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(RULE_VALUE.RULE_VAL_10)
	})

	it("should return value 7 when store positive feedback between 95 and 98", () => {
		const storePositiveFeedback = 96
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(RULE_VALUE.RULE_VAL_9)
	})

	it("should return value 5 when store positive feedback between 92 and 95", () => {
		const storePositiveFeedback = 93
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(RULE_VALUE.RULE_VAL_8)
	})

	it("should return value 2 when store positive feedback lower then 89", () => {
		const storePositiveFeedback = 89
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(RULE_VALUE.RULE_VAL_2)
	})

	it("should return value 2 when store positive feedback lower then 89 1", () => {
		const storePositiveFeedback = 92.3
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(RULE_VALUE.RULE_VAL_6)
	})

	it("should return value -10 when store positive feedback lower then 90", () => {
		const storePositiveFeedback = 74
		expect(calculateStorePositiveFeedbackValueAlgorithm(storePositiveFeedback)).toBe(
			RULE_VALUE.RULE_VAL_NEGATIVE_CRITICAL
		)
	})
})
