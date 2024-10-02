import { ext } from "../ext"
import { sendMessage, addWorkerHandler, registerClientListener } from "../messaging"

jest.mock("../../analytics/logger")

describe("Messaging System", () => {
	let mockPort
	beforeEach(() => {
		mockPort = {
			postMessage: jest.fn(),
			onMessage: {
				addListener: jest.fn((handler) => {
					const simulatedMessage = {
						type: "testType",
						params: { key: "value" }
					}
					handler(simulatedMessage)
				})
			},
			onDisconnect: { addListener: jest.fn() },
			name: "safe-deal-port"
		}
		ext.runtime.connect.mockReturnValue(mockPort)
		jest.clearAllMocks()
	})

	test("sendMessage sends encoded message when port is initialized", () => {
		sendMessage("testType", { key: "value" })
		expect(mockPort.postMessage).toHaveBeenCalledWith(JSON.stringify({ type: "testType", params: { key: "value" } }))
	})
})
