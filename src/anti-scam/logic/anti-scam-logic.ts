import { debug } from "../../utils/analytics/logger";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import { ScamConclusion, ScamRater, ScamSiteType } from "../types/anti-scam";

const SCAM_ENGINES_IN_PRIORITY: Array<ScamRater> = [new ApiScamWOT(), new ApiScamNorton(), new ApiScamVoidUrl()];
const MIN_DANGEROUS_VOTES = 2;

export interface VoteTally {
  dangerous: number;
  safe: number;
}

export const concludeFromVotes = ({ dangerous, safe }: VoteTally): ScamSiteType => {
  if (dangerous + safe === 0) {
    return ScamSiteType.NO_DATA;
  }
  if (dangerous >= MIN_DANGEROUS_VOTES && dangerous > safe) {
    return ScamSiteType.DANGEROUS;
  }
  if (safe > dangerous) {
    return ScamSiteType.SAFE;
  }
  return ScamSiteType.NO_DATA;
};

export class ApiScamPartners {
  public async evaluate(domain: string, tabId: number): Promise<ScamConclusion> {
    try {
      const engineResults = await Promise.allSettled(
        SCAM_ENGINES_IN_PRIORITY.map((engine) => {
          debug(`ApiScamPartners:: Processing ${engine.name}`);
          return engine.get(domain, tabId).then((r) => {
            debug(`ApiScamPartners:: ${engine.name} returned ${r.type}`);
            return r;
          });
        })
      );

      const tally: VoteTally = { dangerous: 0, safe: 0 };
      for (const settled of engineResults) {
        if (settled.status === "fulfilled") {
          if (settled.value.type === ScamSiteType.DANGEROUS) {
            tally.dangerous += 1;
          } else if (settled.value.type === ScamSiteType.SAFE) {
            tally.safe += 1;
          }
        }
      }

      const type = concludeFromVotes(tally);
      debug(`ApiScamPartners:: ${tally.dangerous} dangerous, ${tally.safe} safe votes, returning ${type}`);
      return { type, tabId };
    } catch (e) {
      debug(`ApiScamPartners:: ${e.toString()}`);
      return { type: ScamSiteType.NO_DATA, tabId };
    }
  }
}
