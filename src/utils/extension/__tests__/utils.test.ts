import { decodeMsg, encodeMsg, VERSION } from "../utils"

describe("encodeMsg", () => {
	it("should encode a message as JSON", () => {
		const data = { foo: "bar" }
		const expected = JSON.stringify(data)

		const result = encodeMsg(data)

		expect(result).toEqual(expected)
	})
})

describe("decodeMsg", () => {
	it("should decode a JSON-encoded message", () => {
		const data = JSON.stringify({ foo: "bar" })
		const expected = { foo: "bar" }

		const result = decodeMsg(data)

		expect(result).toEqual(expected)
	})

	it("should throw an error if data is not valid JSON", () => {
		const data = "not valid JSON"

		expect(decodeMsg(data)).toEqual({})
	})

	it("should return the package version", () => {
		const result = VERSION
		expect(result).toContain(".")
	})
})
