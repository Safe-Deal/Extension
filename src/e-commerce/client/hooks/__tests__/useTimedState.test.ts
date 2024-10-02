import { act, renderHook } from "@testing-library/react-hooks"
import { useTimedState } from "../useTimedState"

describe("useTimedState hook", () => {
	beforeAll(() => {
		jest.useFakeTimers()
	})
	afterAll(() => {
		jest.useRealTimers()
	})

	it("should initialize with the given value", () => {
		const { result } = renderHook(() => useTimedState("initial", "default", 1000))
		expect(result.current[0]).toBe("initial")
	})

	it("should update the value when setValue is called", () => {
		const { result } = renderHook(() => useTimedState("initial", "default", 1000))
		act(() => {
			result.current[1]("updated")
		})
		expect(result.current[0]).toBe("updated")
	})

	it("should reset to default value after timeout", () => {
		const { result } = renderHook(() => useTimedState("initial", "default", 1000))
		act(() => {
			jest.advanceTimersByTime(1000)
		})
		expect(result.current[0]).toBe("default")
	})

	it("should restart the timer when value is updated", () => {
		const { result } = renderHook(() => useTimedState("initial", "default", 1000))
		act(() => {
			result.current[1]("updated")
		})

		act(() => {
			jest.advanceTimersByTime(500)
		})
		expect(result.current[0]).toBe("updated")

		act(() => {
			result.current[1]("updated again")
		})
		expect(result.current[0]).toBe("updated again")
		act(() => {
			jest.advanceTimersByTime(500)
		})
		expect(result.current[0]).toBe("updated again")
		act(() => {
			jest.advanceTimersByTime(500)
		})
		expect(result.current[0]).toBe("default")
	})

	it("should clear the timer on unmount", () => {
		const { unmount } = renderHook(() => useTimedState("initial", "default", 1000))

		const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")
		unmount()
		expect(clearTimeoutSpy).toHaveBeenCalled()
		clearTimeoutSpy.mockRestore()
	})
})
