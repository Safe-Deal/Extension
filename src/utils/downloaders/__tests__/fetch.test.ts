import { HTMLElement } from "node-html-parser";
import { HeadersType } from "../remote/remoteFetcher";
import { fetchHtml } from "../fetch";

it("Remote Fetch", async () => {
  const htmlObject = await fetchHtml(`https://www.google.com/`, HeadersType.BROWSER);
  const htmlRateText = (htmlObject as HTMLElement).querySelector("title").text;
  expect(htmlRateText).toEqual("Google");
});
