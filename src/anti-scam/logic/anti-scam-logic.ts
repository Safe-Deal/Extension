import { debug } from "../../utils/analytics/logger";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import { ScamConclusion, ScamRater, ScamSiteType } from "../types/anti-scam";

const SCAM_ENGINES_IN_PRIORITY: Array<ScamRater> = [new ApiScamWOT(), new ApiScamNorton(), new ApiScamVoidUrl()];
const MIN_DANGEROUS_VOTES = 2;

export class ApiScamPartners {
  public async evaluate(domain: string, tabId: number): Promise<ScamConclusion> {
    try {
      let dangerousAmount = 0;
      const evaluateResults = [];
      let result = null;

      const engineResults = await Promise.allSettled(
        SCAM_ENGINES_IN_PRIORITY.map((engine) => {
          debug(`ApiScamPartners:: Processing ${engine.name}`);
          return engine.get(domain, tabId).then((r) => {
            debug(`ApiScamPartners:: ${engine.name} returned ${r.type}`);
            return r;
          });
        })
      );

      for (const settled of engineResults) {
        if (settled.status === "fulfilled") {
          result = settled.value;
          evaluateResults.push(result);
          if (result.type === ScamSiteType.DANGEROUS) {
            dangerousAmount++;
          }
        }
      }

      const hasSafe = evaluateResults.some((r) => r.type === ScamSiteType.SAFE);
      if (hasSafe) {
        debug(`ApiScamPartners:: Stopping and returning ${ScamSiteType.SAFE}`);
        return { type: ScamSiteType.SAFE, tabId };
      }

      if (dangerousAmount >= MIN_DANGEROUS_VOTES) {
        return { type: ScamSiteType.DANGEROUS, tabId };
      }
      return { type: ScamSiteType.SAFE, tabId };
    } catch (e) {
      debug(`ApiScamPartners:: ${e.toString()}`);
      return { type: ScamSiteType.NO_DATA, tabId };
    }
  }
}
