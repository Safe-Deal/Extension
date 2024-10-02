import { STATUS_NOT_200, fetchHtml, fetchText, postFetchJson } from "../../fetch";
import { HeadersType, Remote } from "../remoteFetcher";

jest.mock("../../fetch", () => ({
  fetchHtml: jest.fn(),
  fetchText: jest.fn(),
  postFetchJson: jest.fn()
}));

describe("Remote class", () => {
  beforeEach(() => {
    Remote.clear();
    (fetchHtml as jest.Mock).mockClear();
    (fetchText as jest.Mock).mockClear();
    (postFetchJson as jest.Mock).mockClear();
  });

  it("should handle STATUS_NOT_200 properly", async () => {
    (fetchText as jest.Mock).mockResolvedValue(STATUS_NOT_200);
    const result = await Remote.get("http://example.com", true, false, HeadersType.NONE);

    expect(result).toBeNull();
    expect(fetchText).toHaveBeenCalledWith("http://example.com", HeadersType.NONE, []);
  });

  it("should perform a GET request and return the result", async () => {
    (fetchHtml as jest.Mock).mockResolvedValue("html content");
    const result = await Remote.get("https://example.com", false, false, HeadersType.BROWSER);
    expect(result.response).toBe("html content");
    expect(result.fromCache).toBe(false);
  });

  it("should perform a POST request and return the result", async () => {
    (postFetchJson as jest.Mock).mockResolvedValue({ success: true });
    const result = await Remote.postJson("https://example.com", {
      data: "test"
    });
    expect(result.response).toEqual({ success: true });
    expect(result.fromCache).toBe(false);
  });

  it("should cache GET requests and return cached result on subsequent requests", async () => {
    (fetchHtml as jest.Mock).mockResolvedValue("html content");
    const result1 = await Remote.get("https://example.com", false, true, HeadersType.BROWSER);
    const result2 = await Remote.get("https://example.com", false, true, HeadersType.BROWSER);
    expect(result1.fromCache).toBe(false);
    expect(result2.fromCache).toBe(true);
    expect(fetchHtml).toHaveBeenCalledTimes(1);
  });

  it("should cache POST requests and return cached result on subsequent requests", async () => {
    (postFetchJson as jest.Mock).mockResolvedValue({ success: true });
    const result1 = await Remote.postJson("https://example.com", {
      data: "test"
    });
    const result2 = await Remote.postJson("https://example.com", {
      data: "test"
    });
    expect(result1.fromCache).toBe(false);
    expect(result2.fromCache).toBe(true);
    expect(postFetchJson).toHaveBeenCalledTimes(1);
  });

  it("should clear the cache and in-progress map", () => {
    Remote.clear();
    expect(Remote.storeLength()).toBe(0);
  });

  it("should handle GET request failure gracefully", async () => {
    (fetchHtml as jest.Mock).mockRejectedValue(new Error("Network error"));
    const result = await Remote.get("https://example.com", false, false, HeadersType.BROWSER);
    expect(result).toBeNull();
  });

  it("should handle POST request failure gracefully", async () => {
    (postFetchJson as jest.Mock).mockRejectedValue(new Error("Network error"));
    const result = await Remote.postJson("https://example.com", {
      data: "test"
    });
    expect(result).toBeNull();
  });
});
