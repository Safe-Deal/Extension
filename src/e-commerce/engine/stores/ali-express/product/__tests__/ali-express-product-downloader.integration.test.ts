import { HUMAN_DELAY_E2E } from "../../../../../../../test/e2e/utils/constants";
import { AliExpressProductDownloader } from "../ali-express-product-downloader";

describe("AliExpress Product Downloader", () => {
  afterEach(async () => {
    await HUMAN_DELAY_E2E();
  });
  beforeEach(async () => {
    await HUMAN_DELAY_E2E();
  });

  it.skip("Remote Fetch AliExpress Integration test", async () => {
    const url = "https://www.aliexpress.us/item/3256805440519445.html?gatewayAdapt=glo2usa4itemAdapt";
    const downloader = new AliExpressProductDownloader({
      id: "1005005626834197",
      domain: "aliexpress.com",
      url
    });
    const result = await downloader.download();
    expect(result).toBeDefined();

    expect(result.productPrice).toBeDefined();
    expect(result.productPurchases).toBeDefined();
    expect(result.productRatingsAmount).toBeDefined();
    expect(result.productRatingAverage).toBeDefined();
  });
});
