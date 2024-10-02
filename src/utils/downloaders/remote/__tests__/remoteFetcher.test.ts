import { fetchHtml } from "../../fetch"
import { HeadersType, Remote } from "../remoteFetcher"

const value = { fetchHtml, fetchText: fetchHtml }
// @ts-ignore
jest.useFakeTimers("modern" as any)
describe("Downloader should download remote resources and cash them", () => {
	let originalFetch: typeof fetch

	afterAll(() => {
		// Restore the original fetch implementation
		global.fetch = originalFetch
		jest.useRealTimers()
	})

	beforeAll(() => {
		originalFetch = global.fetch

		// @ts-ignore
		global.fetch = jest.fn(() =>
			Promise.resolve({
				status: 200,
				text: () => Promise.resolve("some text"),
				json: () => Promise.resolve({ some: "json" })
			})
		)

		jest.useFakeTimers()
	})

	it("should Download content only once", async () => {
		const url = `https://www.google.com/?${Math.random()}`
		let value = await Remote.get(url, false, true, HeadersType.BROWSER)
		expect(value.fromCache).toBe(false)
		value = await Remote.get(url, false, true, HeadersType.BROWSER)
		expect(value.fromCache).toEqual(true)
		expect(value.response).toBeDefined()
	})

	it("should Download content only once on text result also", async () => {
		const url = `https://www.google.com/?${Math.random()}`
		let value = await Remote.get(url, true, true, HeadersType.BROWSER)
		expect(value.fromCache).toBe(false)
		value = await Remote.get(url, true, true, HeadersType.BROWSER)
		expect(value.fromCache).toEqual(true)
		expect(value.response).toBeDefined()
	})

	it("should Download content again after clear", async () => {
		const url = `https://www.google.com/?${Math.random()}`
		let value = await Remote.get(url, false, true, HeadersType.BROWSER)
		expect(value.fromCache).toBe(false)
		Remote.clear()
		expect(Remote.storeLength()).toEqual(0)
		value = await Remote.get(url, false, true, HeadersType.BROWSER)
		expect(value.fromCache).toBe(false)
		expect(value.response).toBeDefined()
	})

	it("should Download in parallel only once", async () => {
		Remote.clear()
		const url = `https://www.google.com/?${Math.random()}`
		const value = Remote.get(url, false, true, HeadersType.BROWSER)
		const value2 = Remote.get(url, false, true, HeadersType.BROWSER)

		const result1 = await value
		const result2 = await value2

		expect(result1.fromCache).toBe(false)
		expect(result2.fromCache).toBe(true)
		expect(Remote.storeLength()).toEqual(1)
	})

	it("should expire after 0.45 hours", async () => {
		Remote.clear()
		jest.useFakeTimers("modern" as any)
		const url = `https://www.google.com/?${Math.random()}`
		let value = Remote.get(url, false, true, HeadersType.BROWSER)
		let value2 = Remote.get(url, false, true, HeadersType.BROWSER)
		let result1 = await value
		let result2 = await value2
		expect(result1.fromCache).toBe(false)
		expect(result2.fromCache).toBe(true)
		expect(Remote.storeLength()).toEqual(1)
		const mockDate = new Date()
		mockDate.setHours(mockDate.getHours() + 2)
		jest.setSystemTime(mockDate)

		value = Remote.get(url, false, true, HeadersType.BROWSER)
		value2 = Remote.get(url, false, true, HeadersType.BROWSER)
		result1 = await value
		result2 = await value2

		expect(result1.fromCache).toBe(true)
		expect(result2.fromCache).toBe(true)
	})

	it("should  not expire before 0.45 hours", async () => {
		Remote.clear()
		jest.useFakeTimers("modern" as any)
		const url = `https://www.google.com/?${Math.random()}`
		let value = Remote.get(url, false, true, HeadersType.BROWSER)
		let value2 = Remote.get(url, false, true, HeadersType.BROWSER)
		let result1 = await value
		let result2 = await value2
		expect(result1.fromCache).toBe(false)
		expect(result2.fromCache).toBe(true)
		expect(Remote.storeLength()).toEqual(1)
		const mockDate = new Date()
		mockDate.setHours(mockDate.getHours() + 0.45)
		jest.setSystemTime(mockDate)
		value = Remote.get(url, false, true, HeadersType.BROWSER)
		value2 = Remote.get(url, false, true, HeadersType.BROWSER)
		result1 = await value
		result2 = await value2
		expect(result1.fromCache).toBe(true)
		expect(result2.fromCache).toBe(true)
	})

	it("should Download content many times if ignore cash is set only once", async () => {
		const url = `https://www.google.com/?${Math.random()}`
		const value = await Remote.postJson(url, {}, true)
		expect(value.fromCache).toBe(false)
		expect(value.response).toBeDefined()
	})
})
