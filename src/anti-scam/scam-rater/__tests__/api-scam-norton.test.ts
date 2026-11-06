import { Remote } from "../../../utils/downloaders/remote/remoteFetcher";
import { ScamSiteType } from "../../types/anti-scam";
import { ApiScamNorton } from "../api-scam-norton";

const TAB_ID = 7;

const mockNortonBody = (body: unknown) =>
  jest.spyOn(Remote, "getJson").mockResolvedValue({ fromCache: false, response: body });

describe("ApiScamNorton.get", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rating g is SAFE with full trustworthiness", async () => {
    mockNortonBody({ rating: "g" });
    await expect(new ApiScamNorton().get("example.com", TAB_ID)).resolves.toEqual(
      expect.objectContaining({ type: ScamSiteType.SAFE, trustworthiness: 100, tabId: TAB_ID })
    );
  });

  test("rating b is DANGEROUS with zero trustworthiness", async () => {
    mockNortonBody({ rating: "b" });
    await expect(new ApiScamNorton().get("example.com", TAB_ID)).resolves.toEqual(
      expect.objectContaining({ type: ScamSiteType.DANGEROUS, trustworthiness: 0, tabId: TAB_ID })
    );
  });

  test.each(["r", "w", "u", "unexpected"])("rating %s is NO_DATA", async (rating) => {
    mockNortonBody({ rating });
    const result = await new ApiScamNorton().get("example.com", TAB_ID);
    expect(result.type).toBe(ScamSiteType.NO_DATA);
    expect(result.tabId).toBe(TAB_ID);
  });

  test.each([
    ["no rating field", {}],
    ["null body", null]
  ])("%s is NO_DATA", async (_label, body) => {
    mockNortonBody(body);
    const result = await new ApiScamNorton().get("example.com", TAB_ID);
    expect(result.type).toBe(ScamSiteType.NO_DATA);
  });

  test("a failed request is NO_DATA", async () => {
    jest.spyOn(Remote, "getJson").mockRejectedValue(new Error("network down"));
    const result = await new ApiScamNorton().get("example.com", TAB_ID);
    expect(result).toEqual({ type: ScamSiteType.NO_DATA, tabId: TAB_ID });
  });
});
