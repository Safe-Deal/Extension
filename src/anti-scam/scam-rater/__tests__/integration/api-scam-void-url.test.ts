import { debug } from "../../../../utils/analytics/logger";
import { ScamSiteType } from "../../../types/anti-scam";
import { ApiScamVoidUrl } from "../../api-scam-void-url";

describe("ApiScamVoidUrl", () => {
  let apiScamVoidUrl: ApiScamVoidUrl;

  beforeEach(() => {
    apiScamVoidUrl = new ApiScamVoidUrl();
    // @ts-ignore
    debug.mockClear();
  });

  it("should return a safe conclusion for a safe domain google.com", async () => {
    const result = await apiScamVoidUrl.get("google.com", 1);
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(result.trustworthiness).toEqual(100);

    expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
  });

  it("should return a safe conclusion for a safe domain joinsafedeal.com", async () => {
    const result = await apiScamVoidUrl.get("joinsafedeal.com", 1);
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(result.trustworthiness).toEqual(100);
    expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
  });

  it("should return a safe conclusion for a safe domain temu.com", async () => {
    const result = await apiScamVoidUrl.get("temu.com", 1);
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(result.trustworthiness).toEqual(100);
    expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
  });
});
