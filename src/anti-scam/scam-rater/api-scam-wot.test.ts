import { ScamSiteType } from "../types/anti-scam";
import { ApiScamWOT } from "./api-scam-wot";

jest.mock("../../utils/analytics/logger", () => ({
  debug: jest.fn()
}));

jest.mock("../../utils/downloaders/remote/remoteFetcher", () => ({
  HeadersType: {
    BROWSER: "Browser"
  },
  Remote: {
    get: jest.fn(),
    STATUS_NOT_200: "STATUS_NOT_200"
  }
}));

const { Remote } = jest.requireMock("../../utils/downloaders/remote/remoteFetcher") as {
  Remote: { get: jest.Mock; STATUS_NOT_200: string };
};

describe("ApiScamWOT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns safe when WOT marks the domain as trusted without numeric score", async () => {
    const html = new DOMParser().parseFromString(
      `
        <div>
          <h1>Is dlz.co.il Safe?</h1>
          <p>Trusted by WOT</p>
        </div>
      `,
      "text/html"
    );
    Remote.get.mockResolvedValue({ response: html });

    const result = await new ApiScamWOT().get("dlz.co.il", 1);

    expect(result.type).toBe(ScamSiteType.SAFE);
    expect(result.trustworthiness).toBeNull();
  });
});
