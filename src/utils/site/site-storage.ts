import { debug } from "../analytics/logger"
import { browserWindow } from "../dom/html"

let inMemoryStorage: { [key: string]: string } = {}
let isSupportedInBrowser: boolean = null

function storageFactory(getStorage: () => Storage): Storage {
	function isSupported() {
		if (isSupportedInBrowser != null) {
			return isSupportedInBrowser
		}

		try {
			const testKey = "__some_random_key_you_are_not_going_to_use__"
			getStorage().setItem(testKey, testKey)
			getStorage().removeItem(testKey)
			isSupportedInBrowser = true
		} catch (e) {
			isSupportedInBrowser = false
			debug("LocalStorage not supported!")
		}
		return isSupportedInBrowser
	}

	function clear(): void {
		inMemoryStorage = {}
		if (isSupported()) {
			getStorage().clear()
		}
	}

	function getItem(name: string): string | null {
		if (
			inMemoryStorage.hasOwnProperty(name) &&
      inMemoryStorage[name] &&
      inMemoryStorage[name] !== "undefined" &&
      inMemoryStorage[name] !== "null"
		) {
			return inMemoryStorage[name]
		}
		if (isSupported()) {
			const value = getStorage().getItem(name)
			inMemoryStorage[name] = String(value)
			return value
		}
		return null
	}

	function key(index: number): string | null {
		if (isSupported()) {
			return getStorage().key(index)
		}
		return Object.keys(inMemoryStorage)[index] || null
	}

	function removeItem(name: string): void {
		delete inMemoryStorage[name]
		if (isSupported()) {
			getStorage().removeItem(name)
		}
	}

	function setItem(name: string, value: string): void {
		inMemoryStorage[name] = String(value)
		if (isSupported()) {
			getStorage().setItem(name, value)
		}
	}

	function length(): number {
		if (isSupported()) {
			return getStorage().length
		}
		return Object.keys(inMemoryStorage).length
	}

	function getAll() {
		const result = {}
		const target = getStorage()
		if (target && target.length > 0) {
			for (const [keyItem, value] of Object.entries(target)) {
				result[keyItem] = value
			}
			return result
		}
		return []
	}

	return {
		getItem,
		setItem,
		removeItem,
		clear,
		key,
		getAll,
		get length() {
			return length()
		}
	}
}

export const browserLocalStorage = storageFactory(() => {
	const browser = browserWindow()
	if (browser) {
		return browser.localStorage
	}
	return null
})
