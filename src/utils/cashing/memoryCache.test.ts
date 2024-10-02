import { MemoryCache } from "./memoryCache"

describe("MemoryCache", () => {
	it("should set and get a value", () => {
		const cache = new MemoryCache()
		const key = "testKey"
		const value = "testValue"

		cache.set(key, value)
		expect(cache.get(key)).toBe(value)
	})

	it("should respect the max size", () => {
		const maxSize = 3
		const cache = new MemoryCache(undefined, maxSize)

		for (let i = 0; i < maxSize; i++) {
			cache.set(`key${i}`, `value${i}`)
		}

		for (let i = 0; i < maxSize; i++) {
			expect(cache.get(`key${i}`)).toBe(`value${i}`)
		}

		cache.set("extraKey", "extraValue")
		expect(cache.get("key0")).toBeUndefined()
		expect(cache.get("extraKey")).toBe("extraValue")
	})

	it("should function with max size set to 1", () => {
		const cache = new MemoryCache(undefined, 1)

		cache.set("key0", "value0")
		expect(cache.get("key0")).toBe("value0")

		cache.set("key1", "value1") // This should evict key0
		expect(cache.get("key0")).toBeUndefined()
		expect(cache.get("key1")).toBe("value1")
	})

	it("should replace existing key value pair", () => {
		const key = "testKey"
		const value1 = "testValue1"
		const value2 = "testValue2"
		const cache = new MemoryCache()

		cache.set(key, value1)
		expect(cache.get(key)).toBe(value1)

		cache.set(key, value2)
		expect(cache.get(key)).toBe(value2)
	})

	it("should handle non-string keys gracefully", () => {
		const keyObject = { id: 1 }
		const keyValue = "testValue"
		const cache = new MemoryCache()

		cache.set(keyObject as any, keyValue)
		expect(cache.get(keyObject as any)).toBe(keyValue)
	})
})
