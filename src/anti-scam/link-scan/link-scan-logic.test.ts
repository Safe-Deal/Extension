import { ScamSiteType } from "../types/anti-scam";

import { LinkScanEvaluator } from "./link-scan-logic";

jest.mock("../../utils/analytics/logger", () => ({
  debug: jest.fn()
}));

jest.mock("../logic/anti-scam-white-list", () => ({
  WHITELISTED_DOMAINS: []
}));

jest.mock("../scam-rater/api-scam-wot", () => ({
  mockWotGet: jest.fn(),
  ApiScamWOT: jest.fn().mockImplementation(() => ({
    name: "ApiScamWOT",
    get: jest.requireMock("../scam-rater/api-scam-wot").mockWotGet
  }))
}));

jest.mock("../scam-rater/api-scam-norton", () => ({
  mockNortonGet: jest.fn(),
  ApiScamNorton: jest.fn().mockImplementation(() => ({
    name: "ApiScamNorton",
    get: jest.requireMock("../scam-rater/api-scam-norton").mockNortonGet
  }))
}));

jest.mock("../scam-rater/api-scam-void-url", () => ({
  mockUrlVoidGet: jest.fn(),
  ApiScamVoidUrl: jest.fn().mockImplementation(() => ({
    name: "ApiScamVoidUrl",
    get: jest.requireMock("../scam-rater/api-scam-void-url").mockUrlVoidGet
  }))
}));

const { mockWotGet } = jest.requireMock("../scam-rater/api-scam-wot") as {
  mockWotGet: jest.Mock;
};
const { mockNortonGet } = jest.requireMock("../scam-rater/api-scam-norton") as {
  mockNortonGet: jest.Mock;
};
const { mockUrlVoidGet } = jest.requireMock("../scam-rater/api-scam-void-url") as {
  mockUrlVoidGet: jest.Mock;
};

describe("LinkScanEvaluator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns safe when WOT alone marks the link trusted", async () => {
    mockWotGet.mockResolvedValue({
      type: ScamSiteType.SAFE,
      trustworthiness: undefined,
      tabId: 1
    });
    mockNortonGet.mockResolvedValue({
      type: ScamSiteType.NO_DATA,
      tabId: 1
    });
    mockUrlVoidGet.mockResolvedValue({
      type: ScamSiteType.NO_DATA,
      tabId: 1
    });

    const result = await LinkScanEvaluator.evaluate("example.com", 1);

    expect(result.state).toBe("safe");
    expect(result.explanation).toBe("Safe: reputation sources consider this domain trusted");
    expect(result.engineBreakdown).toEqual([
      { name: "ApiScamWOT", result: ScamSiteType.SAFE },
      { name: "ApiScamNorton", result: ScamSiteType.NO_DATA },
      { name: "ApiScamVoidUrl", result: ScamSiteType.NO_DATA }
    ]);
  });
});
