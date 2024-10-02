import { debug } from "../../../../utils/analytics/logger";
import { ScamSiteType } from "../../../types/anti-scam";
import { ApiScamWOT } from "../../api-scam-wot";

describe("ApiScamWOT", () => {
  const apiScamWOT = new ApiScamWOT();

  beforeEach(() => {
    // @ts-ignore
    debug.mockClear();
  });

  describe("call", () => {
    it("should return ScamSiteType.NO_DATA when the domain is invalid", async () => {
      const result = await apiScamWOT.get("invalid-domain", 1);
      expect(result.type).toEqual(ScamSiteType.NO_DATA);
    });

    it("should return ScamSiteType.SAFE when the domain is safe", async () => {
      const result = await apiScamWOT.get("google.com", 1);
      expect(result.type).toEqual(ScamSiteType.SAFE);
      expect(result.trustworthiness).toEqual(89);
      expect(result.childSafety).toEqual(93);
      expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
    });

    it("should return ScamSiteType.NO_DATA when the domain is new", async () => {
      const result = await apiScamWOT.get("joinsafedeal.com", 1);
      expect(result.type).toEqual(ScamSiteType.DANGEROUS);
      expect(result.trustworthiness).toEqual(5);
      expect(result.childSafety).toEqual(null);
      expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
    });

    it("should return ScamSiteType.SAFE when the domain is www.temu.com", async () => {
      const result = await apiScamWOT.get("www.temu.com", 1);
      expect(result.type).toEqual(ScamSiteType.SAFE);
      expect(result.trustworthiness).toBeGreaterThan(50);
      expect(result.childSafety).toEqual(null);
      expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
    });
  });
});
