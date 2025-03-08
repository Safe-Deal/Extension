import { initAntiScamStoreBackend } from "@store/AntiScamState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { debug, logError } from "../utils/analytics/logger";
import { ext } from "../utils/extension/ext";
import { ApiScamPartners } from "./logic/anti-scam-logic";

export const CLOSE_TAB = "close-tab";

export enum AntiScamMessageTypes {
  ANALYZE_DOMAIN = "analyzeDomain"
}
export interface IAntiScamMessageBus {
  [AntiScamMessageTypes.ANALYZE_DOMAIN]: (domain: string) => Promise<void>;
}

export const initAntiScamWorker = async () => {
  const store = await initAntiScamStoreBackend();
  const { setConclusion, setLoading } = store.getState();
  debug("AntiScamStore:: Anti Scam Store ready!");
  const { onMessage } = definePegasusMessageBus<IAntiScamMessageBus>();

  onMessage(AntiScamMessageTypes.ANALYZE_DOMAIN, async (request) => {
    setLoading(true);

    try {
      if (!request || !request.data) {
        // It is expected, no need to log error
        debug("Invalid request or missing data");
        setLoading(false);
        return;
      }

      const domain = request.data;
      const { sender } = request;

      if (!domain || !sender) {
        // It is expected, no need to log error
        debug("Missing required data: url");
        setLoading(false);
        return;
      }
      if (domain === CLOSE_TAB) {
        const tabId = sender?.tabId;
        ext.tabs.remove(tabId);
        debug(`AntiScamWorker :: Closed dangerous tab ${tabId} `);
        return;
      }

      debug(`AntiScamWorker :: Examining ${domain}...`);

      const verifier = new ApiScamPartners();
      verifier
        .evaluate(domain, sender?.tabId)
        .then((result) => {
          setConclusion(result);
          debug(`AntiScamWorker :: ${domain} is ${JSON.stringify(result)}`);
          debug(`AntiScamWorker :: Examining ${domain} Response Sent.`);
          setLoading(false);
        })
        .catch((error) => {
          debug(`AntiScamWorker :: Error: ${error}`);
          logError(error);
        });
    } catch (error) {
      debug(`AntiScamWorker :: Error: ${error}`);
      logError(error, "AntiScamWorker :: Error:");
    } finally {
      setLoading(false);
    }
  });
};
