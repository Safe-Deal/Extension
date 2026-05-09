/**
 * Tests for the lazy interval optimisation in eventRegistration.
 *
 * The interval should:
 *   - Auto-stop when the queue is drained (isAllDone returns true)
 *   - Guard against double-start (second call to startProcessingInterval is a no-op)
 */

// These module paths are relative to this test file's directory:
// src/e-commerce/client/events/__tests__/

jest.mock("../../processing/queHandler", () => ({
  sendNextRequest: jest.fn()
}));

jest.mock("../../processing/que", () => ({
  ClientQue: {
    isAllDone: jest.fn(() => true) // default: queue empty
  }
}));

jest.mock("../../../../utils/dom/html", () => ({
  browserWindow: jest.fn(() => window)
}));

describe("eventRegistration — lazy interval", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules(); // fresh processingIntervalHandle = null for each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("stops firing sendNextRequest after the queue is drained", () => {
    // Re-require after resetModules to get clean module state
    const { ClientQue } = require("../../processing/que");
    const { sendNextRequest } = require("../../processing/queHandler");
    const { startProcessingInterval } = require("../eventRegistration");

    // Queue starts with work
    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);

    startProcessingInterval();

    // Tick 1 (200ms): isAllDone=false → sendNextRequest called → queue drains
    jest.advanceTimersByTime(200);
    expect(sendNextRequest).toHaveBeenCalledTimes(1);

    // Queue is now empty — simulate
    (ClientQue.isAllDone as jest.Mock).mockReturnValue(true);

    // Tick 2 (200ms): isAllDone=true → stopProcessingInterval → no more calls
    jest.advanceTimersByTime(200);

    // Many more ticks — interval is stopped, sendNextRequest not called again
    jest.advanceTimersByTime(2000);
    expect(sendNextRequest).toHaveBeenCalledTimes(1); // still just 1
  });

  test("startProcessingInterval can be restarted after auto-stop (onEnqueue restart path)", () => {
    const { ClientQue } = require("../../processing/que");
    const { sendNextRequest } = require("../../processing/queHandler");
    const { startProcessingInterval } = require("../eventRegistration");

    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);
    startProcessingInterval();

    // Tick 1: queue has work → sendNextRequest fires
    jest.advanceTimersByTime(200);
    expect(sendNextRequest).toHaveBeenCalledTimes(1);

    // Queue drains — interval auto-stops on next tick
    (ClientQue.isAllDone as jest.Mock).mockReturnValue(true);
    jest.advanceTimersByTime(200);

    // onEnqueue arrives with new work — must create a fresh interval
    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);
    startProcessingInterval(); // must NOT be a no-op (handle was set to null by auto-stop)

    jest.advanceTimersByTime(200);
    expect(sendNextRequest).toHaveBeenCalledTimes(2); // proves a new interval is running
  });

  test("stopProcessingInterval is idempotent — calling it twice does not throw", () => {
    const { ClientQue } = require("../../processing/que");
    const { startProcessingInterval, stopProcessingInterval } = require("../eventRegistration");

    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);
    startProcessingInterval();

    expect(() => {
      stopProcessingInterval();
      stopProcessingInterval(); // second call must not throw
    }).not.toThrow();
  });

  test("beforeunload event stops the interval; subsequent startProcessingInterval creates a fresh one", () => {
    const { ClientQue } = require("../../processing/que");
    const { sendNextRequest } = require("../../processing/queHandler");
    const { registerEvents, startProcessingInterval } = require("../eventRegistration");

    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);
    registerEvents();
    startProcessingInterval();

    jest.advanceTimersByTime(200);
    expect(sendNextRequest).toHaveBeenCalledTimes(1);

    // Simulate SPA beforeunload — stops the interval
    window.dispatchEvent(new Event("beforeunload"));

    jest.advanceTimersByTime(400); // no more ticks
    expect(sendNextRequest).toHaveBeenCalledTimes(1);

    // onEnqueue restarts — must create a new interval
    startProcessingInterval();
    jest.advanceTimersByTime(200);
    expect(sendNextRequest).toHaveBeenCalledTimes(2);
  });

  test("calling startProcessingInterval multiple times only fires sendNextRequest once per tick", () => {
    const { ClientQue } = require("../../processing/que");
    const { sendNextRequest } = require("../../processing/queHandler");
    const { startProcessingInterval } = require("../eventRegistration");

    (ClientQue.isAllDone as jest.Mock).mockReturnValue(false);

    // Call 3 times — only one interval should be created
    startProcessingInterval();
    startProcessingInterval();
    startProcessingInterval();

    // Advance one tick
    jest.advanceTimersByTime(200);

    // If 3 intervals were running, sendNextRequest would be called 3 times
    expect(sendNextRequest).toHaveBeenCalledTimes(1);
  });
});
