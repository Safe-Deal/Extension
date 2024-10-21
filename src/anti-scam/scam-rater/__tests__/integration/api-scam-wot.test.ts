import axios from "axios";
import { ScamSiteType } from "../../../types/anti-scam";
import { debug } from "../../../../utils/analytics/logger";

jest.mock("axios");

const WOT_URL = "https://www.mywot.com/scorecard/";

// Function that mimics what `ApiScamWOT` was doing but directly uses axios
const getScamSiteInfo = async (domain: string): Promise<any> => {
  try {
    const url = `${WOT_URL}${domain}`;
    console.log(`Attempting to get data for domain: ${domain}`);
    const response = await axios.get(url);

    if (response.status !== 200) {
      return { type: ScamSiteType.NO_DATA };
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(response.data, "text/html");
    const trustworthinessElem = htmlDoc.querySelector("[data-automation=total-safety-score]");
    const childSafetyElem = htmlDoc.querySelector("[data-automation=child-safety-score]");

    const trustworthiness = trustworthinessElem ? parseInt(trustworthinessElem.textContent) : null;
    const childSafety = childSafetyElem ? parseInt(childSafetyElem.textContent) : null;

    if (trustworthiness !== null) {
      const type = trustworthiness > 10 ? ScamSiteType.SAFE : ScamSiteType.DANGEROUS;
      return { type, trustworthiness, childSafety };
    }

    return { type: ScamSiteType.NO_DATA, trustworthiness, childSafety };
  } catch (error) {
    debug(`Error fetching data for ${domain}: ${error}`);
    return { type: ScamSiteType.NO_DATA };
  }
};

describe("ScamSiteInfo using axios", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    // @ts-ignore
    debug.mockClear();
  });

  it("should return ScamSiteType.NO_DATA when the domain is invalid", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 500 });

    const result = await getScamSiteInfo("invalid-domain");
    expect(result.type).toEqual(ScamSiteType.NO_DATA);
  });

  it("should return ScamSiteType.SAFE when the domain is safe", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: `
        <div data-automation="total-safety-score">89/100</div>
        <div data-automation="child-safety-score">93/100</div>
      `
    });

    const result = await getScamSiteInfo("google.com");
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(result.trustworthiness).toEqual(89);
    expect(result.childSafety).toEqual(93);
    expect(debug).not.toHaveBeenCalled();
  });

  it("should return ScamSiteType.DANGEROUS when the domain has low trustworthiness", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: `
        <div data-automation="total-safety-score">5/100</div>
        <div data-automation="child-safety-score"></div>
      `
    });

    const result = await getScamSiteInfo("joinsafedeal.com");
    expect(result.type).toEqual(ScamSiteType.DANGEROUS);
    expect(result.trustworthiness).toEqual(5);
    expect(debug).not.toHaveBeenCalled();
  });

  it("should return ScamSiteType.SAFE when the domain is trusted (www.temu.com)", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: `
        <div data-automation="total-safety-score">75/100</div>
        <div data-automation="child-safety-score"></div>
      `
    });

    const result = await getScamSiteInfo("www.temu.com");
    expect(result.type).toEqual(ScamSiteType.SAFE);
    expect(result.trustworthiness).toBeGreaterThan(50);
    expect(debug).not.toHaveBeenCalled();
  });
});
