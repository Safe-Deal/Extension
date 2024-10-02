import { debug } from "../../utils/analytics/logger";
import { getAvailableSelector } from "../../utils/dom/html";
import { HeadersType, Remote } from "../../utils/downloaders/remote/remoteFetcher";
import { randomTimeout } from "../../utils/general/general";
import { castAsNumber } from "../../utils/text/strings";
import { ScamConclusion, ScamRater, ScamSiteType } from "../types/anti-scam";

const URL = "https://www.urlvoid.com/scan/";
const convertResult = (str) => {
  const number = str?.split("/");
  if (number?.length > 0) {
    const val = castAsNumber(number[0]);
    if (typeof val === "number") {
      return Math.floor(100 - val * (100 / 34));
    }
  }
  return null;
};

export class ApiScamVoidUrl implements ScamRater {
  name: string = "ApiScamVoidUrl";

  protected remote: Remote;

  protected url: string;

  public async get(domain: string, tabId: number): Promise<ScamConclusion> {
    try {
      this.url = `${URL}${domain}/`;
      await randomTimeout();
      const response = await Remote.get(this.url, false, true, HeadersType.BROWSER);
      if (response?.response === Remote.STATUS_NOT_200) {
        return { type: ScamSiteType.NO_DATA, tabId };
      }
      const html = response?.response;
      const ranks = getAvailableSelector(".label-success|.label-danger", html)?.textContent;
      let trustworthiness = convertResult(ranks);
      const childSafety = null;
      debug(`ApiScamVoidUrl :: ${domain} -> ${trustworthiness} - `);

      const isSafe = html?.querySelectorAll(".panel.panel-success").length > 0;
      if (isSafe || trustworthiness > 98) {
        return { type: ScamSiteType.SAFE, trustworthiness, childSafety, tabId };
      }

      const isDangerous =
        html?.querySelectorAll(".panel.panel-danger").length > 0 ||
        html?.querySelectorAll(".panel.panel-warning").length > 0;

      if (isDangerous) {
        trustworthiness = Math.abs(trustworthiness - 40);
        return {
          type: ScamSiteType.DANGEROUS,
          trustworthiness,
          childSafety,
          tabId
        };
      }

      return {
        type: ScamSiteType.NO_DATA,
        trustworthiness,
        childSafety,
        tabId
      };
    } catch (error) {
      debug(`ApiScamVoidUrl:: Url:${this.url} Domain:${JSON.stringify(domain)} \nError ${JSON.stringify(error)}`);
      return { type: ScamSiteType.NO_DATA, tabId };
    }
  }
}
