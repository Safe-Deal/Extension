import { HeadersType, Remote } from "../../utils/downloaders/remote/remoteFetcher";
import { debug } from "../../utils/analytics/logger";
import { selectFromRange } from "../../utils/general/general";
import { castAsNumber } from "../../utils/text/strings";
import { ScamRater, ScamConclusion, ScamSiteType } from "../types/anti-scam";

const WOT_URL = "https://www.mywot.com/scorecard/";
const SAFETY_RANGE = [
  { start: 0, end: 10, value: ScamSiteType.DANGEROUS },
  { start: 11, end: 100, value: ScamSiteType.SAFE }
];

const convertResult = (str) => {
  const number = str.split("/");
  if (number.length > 0) {
    return castAsNumber(number[0]);
  }
  return null;
};

export class ApiScamWOT implements ScamRater {
  name: string = "ApiScamWOT";

  protected remote: Remote;

  protected url: string;

  public async get(domain: string, tabId: number): Promise<ScamConclusion> {
    try {
      this.url = `${WOT_URL}${domain}`;
      const response = await Remote.get(this.url, false, true, HeadersType.BROWSER);
      if (response?.response === Remote.STATUS_NOT_200) {
        return { type: ScamSiteType.NO_DATA, tabId };
      }
      const html = response?.response;
      const ranks = html?.querySelector("[data-automation=total-safety-score]");
      const trustworthiness = convertResult(ranks?.textContent);
      const childSafetyField = html?.querySelector("[data-automation=child-safety-score]")?.textContent;
      const childSafety = convertResult(childSafetyField);
      debug(`ApiScamWOT :: ${domain} -> trustworthiness: ${trustworthiness} - childSafety ${childSafety}`);
      if (trustworthiness) {
        const type = selectFromRange(SAFETY_RANGE, trustworthiness);
        return { type, trustworthiness, childSafety, tabId };
      }
      return { type: ScamSiteType.NO_DATA, trustworthiness, childSafety, tabId };
    } catch (error) {
      debug(`ApiScamWOT:: Url:${this.url} Domain:${JSON.stringify(domain)} \nError ${JSON.stringify(error)}`);
      return { type: ScamSiteType.NO_DATA, tabId };
    }
  }
}
