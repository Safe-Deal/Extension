import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { debug, logError } from "../utils/analytics/logger";
import { SiteMetadata } from "../utils/site/site-information";
import { paintAntiScam } from "./logic/anti-scam-paint";
import { isWhitelisted, markAsSafe } from "./logic/anti-scam-persistance";
import { ScamSiteType } from "./types/anti-scam";
import { IAntiScamMessageBus, AntiScamMessageTypes } from "./anti-scam-worker";

initPegasusTransport();

(async () => {
  try {
    const domain = SiteMetadata.getDomain();
    const isOkAlready = isWhitelisted(domain);
    const { sendMessage } = definePegasusMessageBus<IAntiScamMessageBus>();

    if (isOkAlready) {
      debug(`AntiScam :: ${domain} is whitelisted so skipping.`);
      return;
    }

    debug(`AntiScam :: Sending ${domain} for analysis`);
    const conclusion = await sendMessage(AntiScamMessageTypes.ANALYZE_DOMAIN, domain);

    debug(`AntiScam :: Received ${JSON.stringify(conclusion)}`);

    if (conclusion?.type === ScamSiteType.DANGEROUS) {
      paintAntiScam(conclusion);
      debug(`AntiScam :: Painting.... Done.`);
    } else if (conclusion?.type === ScamSiteType.SAFE) {
      markAsSafe();
      debug(`AntiScam :: Marked as Safe.`);
    } else {
      debug(`AntiScam :: No data returned nothing to paint!!`);
    }
  } catch (error) {
    logError(error, "AntiScam Error::");
  }
})();
