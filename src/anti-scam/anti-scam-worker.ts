import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { debug, logError } from "../utils/analytics/logger";
import { ext } from "../utils/extension/ext";
import { ApiScamPartners } from "./logic/anti-scam-logic";
import { ScamConclusion } from "./types/anti-scam";

export const CLOSE_TAB = "close-tab";

export enum AntiScamMessageTypes {
  ANALYZE_DOMAIN = "analyzeDomain"
}
export interface IAntiScamMessageBus {
  [AntiScamMessageTypes.ANALYZE_DOMAIN]: (domain: string) => Promise<ScamConclusion | null>;
}

export const initAntiScamWorker = () => {
  const { onMessage } = definePegasusMessageBus<IAntiScamMessageBus>();

  onMessage(AntiScamMessageTypes.ANALYZE_DOMAIN, async (request) => {
    try {
      if (!request || !request.data) {
        // It is expected, no need to log error
        debug("Invalid request or missing data");
        return null;
      }

      const domain = request.data;
      const { sender } = request;

      if (!domain || !sender) {
        // It is expected, no need to log error
        debug("Missing required data: url");
        return null;
      }
      if (domain === CLOSE_TAB) {
        const tabId = sender?.tabId;
        ext.tabs.remove(tabId);
        debug(`AntiScamWorker :: Closed dangerous tab ${tabId} `);
        return null;
      }

      debug(`AntiScamWorker :: Examining ${domain}...`);

      const result = await new ApiScamPartners().evaluate(domain, sender?.tabId);
      debug(`AntiScamWorker :: ${domain} is ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      debug(`AntiScamWorker :: Error: ${error}`);
      logError(error, "AntiScamWorker :: Error:");
      return null;
    }
  });
};
