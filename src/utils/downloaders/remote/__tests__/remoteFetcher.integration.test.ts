import { HeadersType, Remote } from "../remoteFetcher";

describe("Integration downloader test", () => {
  it("Remote Fetch", async () => {
    const htmlObject = await Remote.get(`https://www.google.com/`, false, false, HeadersType.BROWSER);
    const htmlRateText = htmlObject.response.querySelector("title").text;
    expect(htmlRateText).toEqual("Google");
  });
});
