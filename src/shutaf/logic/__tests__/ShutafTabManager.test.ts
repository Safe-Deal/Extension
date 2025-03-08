import { SAFE_DEAL_OFF } from "../../../constants/sites";
import { ext } from "../../../utils/extension/ext";
import { ShutafTabManger } from "../ShutafTabManger";

jest.mock("../../../utils/extension/ext", () => ({
  ext: {
    tabs: {
      create: jest.fn(),
      update: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    }
  }
}));

describe("ShutafTabManger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ShutafTabManger.shutaffTabId = null;
    ShutafTabManger.requests = [];
    ShutafTabManger.currentLinkOpeningTime = null;
  });

  it("should add url to requests if it does not include SAFE_DEAL_OFF", () => {
    const url = "http://example.com";
    ShutafTabManger.scheduleShutafLink(url);

    expect(ShutafTabManger.requests).toContain(url);
  });

  it("should not add url to requests if it includes SAFE_DEAL_OFF", () => {
    const url = `http://example.com/${SAFE_DEAL_OFF}`;
    ShutafTabManger.scheduleShutafLink(url);

    expect(ShutafTabManger.requests).not.toContain(url);
  });

  it("should create a new tab and set shutaffTabId", async () => {
    (ext.tabs.create as jest.Mock).mockImplementation((_) => Promise.resolve({ id: 1 }));
    await (ShutafTabManger as any).openNewTab();

    expect(ext.tabs.create).toHaveBeenCalled();
    expect(ShutafTabManger.shutaffTabId).toBe(1);
  });

  it("should return false if shutaffTabId is not a number", async () => {
    ShutafTabManger.shutaffTabId = "not_a_number";

    const result = await (ShutafTabManger as any).isTabExist();
    expect(result).toBe(false);
  });

  it("should return true if tab exists", async () => {
    ShutafTabManger.shutaffTabId = 1;
    (ext.tabs.get as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await (ShutafTabManger as any).isTabExist();
    expect(result).toBe(true);
    expect(ext.tabs.get).toHaveBeenCalled();
  });

  it("should return false if tab does not exist", async () => {
    ShutafTabManger.shutaffTabId = 1;
    (ext.tabs.get as jest.Mock).mockRejectedValue(new Error("Tab not found"));

    const result = await (ShutafTabManger as any).isTabExist();
    expect(result).toBe(false);
    expect(ext.tabs.get).toHaveBeenCalled();
  });

  it("should check if there are any requests left", () => {
    ShutafTabManger.requests = ["request1", "request2"];

    const result = (ShutafTabManger as any).isThereWorkLeft();
    expect(result).toBe(true);
  });

  it("should open new tab if there are requests", async () => {
    ShutafTabManger.requests = ["request1"];
    const openNewTabSpy = jest.spyOn(ShutafTabManger as any, "openNewTab").mockResolvedValue(undefined);
    const isTabExistSpy = jest.spyOn(ShutafTabManger as any, "isTabExist").mockResolvedValue(false);

    await (ShutafTabManger as any).openTabLogic();
    expect(openNewTabSpy).toHaveBeenCalled();
    expect(isTabExistSpy).toHaveBeenCalled();
  });

  it("should not open new tab if there are no requests", async () => {
    const openNewTabSpy = jest.spyOn(ShutafTabManger as any, "openNewTab").mockResolvedValue(undefined);
    const isTabExistSpy = jest.spyOn(ShutafTabManger as any, "isTabExist").mockResolvedValue(true);

    await (ShutafTabManger as any).openTabLogic();
    expect(openNewTabSpy).not.toHaveBeenCalled();
    expect(isTabExistSpy).not.toHaveBeenCalled();
  });
});
