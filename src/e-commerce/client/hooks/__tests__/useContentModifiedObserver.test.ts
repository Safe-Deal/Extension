import { renderHook } from "@testing-library/react-hooks";
import { useContentModifiedObserver } from "../useContentModifiedObserver";

describe("useContentModifiedObserver", () => {
  let observeSpy: jest.Mock;
  let disconnectSpy: jest.Mock;
  let OriginalMutationObserver: typeof MutationObserver;

  beforeEach(() => {
    observeSpy = jest.fn();
    disconnectSpy = jest.fn();
    OriginalMutationObserver = global.MutationObserver;
    global.MutationObserver = jest.fn().mockImplementation(() => ({
      observe: observeSpy,
      disconnect: disconnectSpy
    })) as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    global.MutationObserver = OriginalMutationObserver;
  });

  it("does not observe attribute mutations by default (attributes:true causes excessive callbacks on every hover/lazy-load)", () => {
    renderHook(() => useContentModifiedObserver(jest.fn()));
    expect(observeSpy).toHaveBeenCalledTimes(1);
    const observeOptions = observeSpy.mock.calls[0][1];
    expect(observeOptions).not.toHaveProperty("attributes", true);
  });

  it("observes childList and subtree by default", () => {
    renderHook(() => useContentModifiedObserver(jest.fn()));
    const observeOptions = observeSpy.mock.calls[0][1];
    expect(observeOptions).toMatchObject({ childList: true, subtree: true });
  });
});
