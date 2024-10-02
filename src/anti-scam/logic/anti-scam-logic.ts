import { ApiDownloader } from "../../utils/downloaders/apiDownloader";
import { debug } from "../../utils/analytics/logger";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import { ScamConclusion, ScamRater, ScamSiteType } from "../types/anti-scam";
import { examineTab } from "../scam-rater/tab-content-rater";

const SCAM_ENGINES_IN_PRIORITY: Array<ScamRater> = [new ApiScamWOT(), new ApiScamNorton(), new ApiScamVoidUrl()];
const ENGINES_COUNT = SCAM_ENGINES_IN_PRIORITY.length;

export class ApiScamPartners {
  public async evaluate(domain: string, tabId: number): Promise<ScamConclusion> {
    try {
      let dangerousAmount = 0;
      const evaluateResults = [];
      let result = null;
      if (tabId) {
        const tabRate = await examineTab(tabId);
        if (tabRate.type == ScamSiteType.DANGEROUS) {
          dangerousAmount++;
          evaluateResults.push(tabRate);
        }
      }

      for (const engine of SCAM_ENGINES_IN_PRIORITY) {
        debug(`ApiScamPartners:: Processing ${engine.name}`);
        result = await engine.get(domain, tabId);
        debug(`ApiScamPartners:: ${engine.name} returned ${result.type}`);
        evaluateResults.push(result);

        if (result.type == ScamSiteType.SAFE) {
          debug(`ApiScamPartners:: Stopping and returning ${result.type}`);
          break;
        } else {
          debug(
            `ApiScamPartners:: Examining next one ${engine.name} returned ${result.type}, Invalid count: ${dangerousAmount} out of ${ENGINES_COUNT} ....`
          );
        }

        if (result.type === ScamSiteType.DANGEROUS) {
          dangerousAmount++;
        }
      }

      if (tabId) {
        reportAverages(evaluateResults, domain);
      }

      if (result.type === ScamSiteType.SAFE) {
        return result;
      }

      if (dangerousAmount === ENGINES_COUNT) {
        return { type: ScamSiteType.DANGEROUS, tabId };
      }
      return { type: ScamSiteType.SAFE, tabId };
    } catch (e) {
      debug(`ApiScamPartners:: ${e.toString()}`);
      return { type: ScamSiteType.NO_DATA, tabId };
    }
  }
}

const report = (data) => {
  if (data?.trustworthiness || data?.childSafety) {
    const reporter = new ApiDownloader("/domain");
    reporter.post(data);
    debug(`ApiScamPartners :: ${JSON.stringify(data)} -> Reported successfully.`);
  } else {
    debug("ApiScamPartners :: Nothing to report skipped sending.");
  }
};

function reportAverages(evaluateResults, domain) {
  debug(`ApiScamPartners :: ReportAverages :: reporting ${JSON.stringify(evaluateResults)} .... `);

  let trustworthiness = 0;
  let childSafety = 0;
  let countChildSafety = 0;
  let countTrustworthiness = 0;
  for (const judgment of evaluateResults) {
    if (judgment.trustworthiness) {
      trustworthiness += judgment.trustworthiness;
      countTrustworthiness++;
    }

    if (judgment.childSafety) {
      childSafety += judgment.childSafety;
      countChildSafety++;
    }
  }

  if (countTrustworthiness > 0) {
    trustworthiness = Math.round(trustworthiness / countTrustworthiness);
  }

  if (countChildSafety > 0) {
    childSafety = Math.round(childSafety / countChildSafety);
  }

  if (trustworthiness || childSafety) {
    report({
      domain,
      trustworthiness: String(trustworthiness),
      childSafety: String(childSafety)
    });
  }
}
