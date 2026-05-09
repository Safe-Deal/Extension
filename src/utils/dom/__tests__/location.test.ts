import { onHrefChange } from "../location";

describe("onHrefChange", () => {
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, "addEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  it("does not register a click listener (click causes false positives on every tap)", () => {
    onHrefChange(jest.fn());
    const registeredEvents = addEventListenerSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).not.toContain("click");
  });

  it("registers hashchange and popstate for SPA navigation", () => {
    onHrefChange(jest.fn());
    const registeredEvents = addEventListenerSpy.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain("hashchange");
    expect(registeredEvents).toContain("popstate");
  });
});
