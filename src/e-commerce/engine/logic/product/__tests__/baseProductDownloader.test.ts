import { BaseProductDownloader } from "../baseProductDownloader";

class MockProductDownloader extends BaseProductDownloader {
  constructor(super1, super2) {
    super({
      productUrl: super1,
      isFetchHtml: super2,
      minDelay: 1,
      maxDelay: 1
    });
  }

  public parse(): {} {
    this.document = "this is a result";
    return this.document;
  }
}

describe("Base downloader test", () => {
  it("should support parse", async () => {
    const downloader = new MockProductDownloader("https://www.google.com/", true);
    const result = await downloader.download();
    expect(result).toBeDefined();
  });
});
