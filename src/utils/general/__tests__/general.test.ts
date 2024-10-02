import { castAsNumber, formatString } from "../../text/strings"
import { distance, isExist, isIterable, parsePrice, selectFromRange } from "../general"

describe("util", () => {
	describe("isExist", () => {
		it("returns true for a defined value", () => {
			expect(isExist("hello")).toBe(true)
		})

		it("returns false for a null value", () => {
			expect(isExist(null)).toBe(false)
		})

		it("returns false for an undefined value", () => {
			expect(isExist(undefined)).toBe(false)
		})
	})

	describe("parsePrice", () => {
		it("removes commas and returns a float", () => {
			expect(parsePrice("1,000.50")).toBe(1000.5)
			expect(parsePrice("10,000")).toBe(10000)
			expect(parsePrice("0")).toBe(0)
		})
	})

	it("should selectFromRange from reversed properly", () => {
		const rangeReversed = [
			{ start: 10, end: 1, value: 1 },
			{ start: 20, end: 11, value: 2 },
			{ start: 30, end: 21, value: 3 }
		]
		expect(selectFromRange(rangeReversed, 0)).toBe(1)
		expect(selectFromRange(rangeReversed, 0.1)).toBe(1)
		expect(selectFromRange(rangeReversed, 0.5)).toBe(1)
		expect(selectFromRange(rangeReversed, 1)).toBe(1)
		expect(selectFromRange(rangeReversed, 2)).toBe(1)
		expect(selectFromRange(rangeReversed, 3)).toBe(1)
		expect(selectFromRange(rangeReversed, 11)).toBe(2)
		expect(selectFromRange(rangeReversed, 15)).toBe(2)
		expect(selectFromRange(rangeReversed, 20)).toBe(2)
		expect(selectFromRange(rangeReversed, 5000)).toBe(3)
		expect(selectFromRange(rangeReversed, 31)).toBe(3)
		expect(selectFromRange(rangeReversed, NaN)).toBe(NaN)
		expect(selectFromRange(rangeReversed, null)).toBe(NaN)
		expect(selectFromRange(rangeReversed, undefined)).toBe(NaN)
	})

	it("should selectFromRange properly", () => {
		const range = [
			{ start: 1, end: 10, value: 1 },
			{ start: 11, end: 20, value: 2 },
			{ start: 21, end: 30, value: 3 }
		]

		expect(selectFromRange(range, 0)).toBe(1)
		expect(selectFromRange(range, 0.1)).toBe(1)
		expect(selectFromRange(range, 0.5)).toBe(1)
		expect(selectFromRange(range, 1)).toBe(1)
		expect(selectFromRange(range, 2)).toBe(1)
		expect(selectFromRange(range, 3)).toBe(1)
		expect(selectFromRange(range, 11)).toBe(2)
		expect(selectFromRange(range, 15)).toBe(2)
		expect(selectFromRange(range, 20)).toBe(2)
		expect(selectFromRange(range, 5000)).toBe(3)
		expect(selectFromRange(range, 31)).toBe(3)
		expect(selectFromRange(range, NaN)).toBe(NaN)
		expect(selectFromRange(range, null)).toBe(NaN)
		expect(selectFromRange(range, undefined)).toBe(NaN)
	})

	it("should cats strings to proper numbers using castAsNumber", () => {
		expect(castAsNumber("sdfsfsd 25.3")).toBe(25.3)
		expect(castAsNumber("sdfsfsd 25")).toBe(25)
		expect(castAsNumber("sdfsfsd")).toBe(null)
		expect(castAsNumber("100 sdfsfsd")).toBe(100)
		expect(castAsNumber("100.25 sdfsfsd")).toBe(100.25)
	})

	it("should format strings as expected", () => {
		expect(formatString("this is super {value}", { value: 10 })).toBe("this is super 10")
		expect(formatString("{val2} this is super {val1}", { val1: 10, val2: 10 })).toBe("10 this is super 10")
		expect(formatString("{val2} this is super {val1}", { val1: 11, val2: 50 })).toBe("50 this is super 11")
		expect(formatString("{val2}{val1}", { val1: 11, val2: 50 })).toBe("5011")
		const i18nMaskedFormat = { val1: 11, val2: { i18n: "years_label" } }
		expect(formatString("{val1}{val2}", i18nMaskedFormat)).toBe("11years_label")
	})

	describe("distance", () => {
		it("calculates distance between two positive numbers correctly", () => {
			expect(distance(3, 6)).toEqual(3)
		})

		it("calculates distance between a negative and a positive number correctly", () => {
			expect(distance(-3, 6)).toEqual(9)
		})

		it("calculates distance between two negative numbers correctly", () => {
			expect(distance(-6, -3)).toEqual(3)
		})

		it("returns 0 if both arguments are the same number", () => {
			expect(distance(5, 5)).toEqual(0)
		})
	})

	describe("isIterable", () => {
		it("returns true for an array", () => {
			expect(isIterable([])).toBe(true)
		})

		it("returns true for a string", () => {
			expect(isIterable("test")).toBe(true)
		})

		it("returns true for a Map", () => {
			expect(isIterable(new Map())).toBe(true)
		})

		it("returns false for null", () => {
			expect(isIterable(null)).toBe(false)
		})

		it("returns false for undefined", () => {
			expect(isIterable(undefined)).toBe(false)
		})

		it("returns false for a number", () => {
			expect(isIterable(42)).toBe(false)
		})

		it("returns false for a boolean", () => {
			expect(isIterable(true)).toBe(false)
		})
	})

	describe("selectFromRange", () => {
		const range = [
			{ start: 0, end: 10, value: "a" },
			{ start: 11, end: 20, value: "b" },
			{ start: 21, end: 30, value: "c" }
		]

		it("returns the correct value when the number is within a range", () => {
			expect(selectFromRange(range, 5)).toEqual("a")
		})

		it("returns the correct value when the number is at the upper end of a range", () => {
			expect(selectFromRange(range, 10)).toEqual("a")
		})

		it("returns the correct value when the number is at the lower end of a range", () => {
			expect(selectFromRange(range, 11)).toEqual("b")
		})

		it("returns the correct value when the number is above the highest range", () => {
			expect(selectFromRange(range, 35)).toEqual("c")
		})
	})
})
