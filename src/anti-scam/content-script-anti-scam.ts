import { debug, logError } from "../utils/analytics/logger";
import { SiteMetadata } from "../utils/site/site-information";
import { paintAntiScam } from "./logic/anti-scam-paint";
import { isWhitelisted, markAsSafe } from "./logic/anti-scam-persistance";
import { ScamSiteType } from "./types/anti-scam";
import { IAntiScamMessageBus, AntiScamMessageTypes } from "./anti-scam-worker";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { useAntiScamStore } from "@store/AntiScamState";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";

initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_ANTI_SCAM" });

(async () => {
  try {
    const domain = SiteMetadata.getDomain();
    const isOkAlready = isWhitelisted(domain);
    const { sendMessage } = definePegasusMessageBus<IAntiScamMessageBus>();

    if (isOkAlready) {
      debug(`AntiScam :: ${domain} is whitelisted so skipping.`);
      return;
    }

    await sendMessage(AntiScamMessageTypes.ANALYZE_DOMAIN, domain);

    useAntiScamStore.subscribe((state) => {
      const conclusion = state?.conclusion;
      debug(`AntiScam :: Analysis of ${domain} started....`);
      debug(`AntiScam :: Sending ${domain} for analysis`);

      if (conclusion) {
        debug(`AntiScam :: Received ${JSON.stringify(conclusion)}`);
        if (conclusion.type === ScamSiteType.DANGEROUS) {
          paintAntiScam(conclusion);
          debug(`AntiScam :: Painting.... Done.`);
        } else if (conclusion.type === ScamSiteType.SAFE) {
          markAsSafe();
          debug(`AntiScam :: Marked as Safe.`);
        }
      } else {
        debug(`AntiScam :: No data returned nothing to paint!! result:${JSON.stringify(conclusion)}`);
      }
    });
  } catch (error) {
    logError(error, "AntiScam Error::");
  }
})();
