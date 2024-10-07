import { debug, logError } from "../utils/analytics/logger";
import { ANTI_SCAM_GLUE } from "../utils/extension/glue";
import { SiteMetadata } from "../utils/site/site-information";
import { paintAntiScam } from "./logic/anti-scam-paint";
import { isWhitelisted, markAsSafe } from "./logic/anti-scam-persistance";
import { ScamConclusion, ScamSiteType } from "./types/anti-scam";

(async () => {
  try {
    const domain = SiteMetadata.getDomain();
    const isOkAlready = isWhitelisted(domain);
    if (isOkAlready) {
      debug(`AntiScam :: ${domain} is whitelisted so skipping.`);
      return;
    }

    debug(`AntiScam :: Analysis of ${domain} started....`);
    ANTI_SCAM_GLUE.client((result: ScamConclusion) => {
      debug(`AntiScam :: Sending ${domain} for analysis`);
      if (result) {
        debug(`AntiScam :: Received ${JSON.stringify(result)}`);
        if (result.type === ScamSiteType.DANGEROUS) {
          paintAntiScam(result);
          debug(`AntiScam :: Painting.... Done.`);
        } else if (result.type === ScamSiteType.SAFE) {
          markAsSafe();
          debug(`AntiScam :: Marked as Safe.`);
        }
      } else {
        debug(`AntiScam :: No data returned nothing to paint!! result:${JSON.stringify(result)}`);
      }
    });

    ANTI_SCAM_GLUE.send(domain);
  } catch (error) {
    logError(error);
  }
})();
