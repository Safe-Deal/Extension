import { ApiScamNorton } from "../../api-scam-norton";
import { ScamSiteType } from "../../../types/anti-scam";
import { debug } from "../../../../utils/analytics/logger";

describe("ApiScamNorton", () => {
  let apiScamNorton: ApiScamNorton;

  beforeEach(() => {
    apiScamNorton = new ApiScamNorton();
    // @ts-ignore
    debug.mockClear();
  });

  it("should return safe for a safe domain - temu.com", async () => {
    const result = await apiScamNorton.get("temu.com", 1);
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(debug).not.toHaveBeenCalledWith(expect.stringMatching("Error"));
  });
});
