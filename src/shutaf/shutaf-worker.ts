import { initShutafStoreBackend } from "@store/ShutafState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { debug, logError } from "../utils/analytics/logger";
import { hideBadge, showBadge } from "../utils/extension/badges";
import { ShutafTabManger } from "./logic/ShutafTabManger";
import { ProductShutaf } from "./logic/product-shutaff";

export enum ShutafMessageType {
  PING = "ping",
  GENERATE_AFFILIATE_LINK = "generateAffiliateLink"
}
export interface IShutafMessageBus {
  [ShutafMessageType.PING]: () => Promise<void>;
  [ShutafMessageType.GENERATE_AFFILIATE_LINK]: (url: string) => Promise<void>;
}

export const initShutafWorker = async () => {
  const store = await initShutafStoreBackend();
  const { setAffiliateLink, setLoading } = store.getState();
  debug("ShutafStore:: Shutaf Store is ready!", store);
  debug("initShutafWorker", "Shutaf::worker is starting... ");
  const { onMessage } = definePegasusMessageBus<IShutafMessageBus>();
  ShutafTabManger.initialize();

  onMessage(ShutafMessageType.PING, async () => {
    const notOpenedLinks = JSON.stringify(ShutafTabManger.requests, null, 2);
    debug("ShutafWorker", `Shutaf::worker is alive. notOpenedLinks: ${notOpenedLinks}`);
  });

  onMessage(ShutafMessageType.GENERATE_AFFILIATE_LINK, async (request) => {
    setLoading(true);
    try {
      const url = request.data;
      if (!url) {
        logError(new Error("Invalid URL"), "shutafWorker:: Invalid url request");
        return;
      }
      const executor = new ProductShutaf(url);
      const affiliatedLink = await executor.execute();
      if (affiliatedLink) {
        await showBadge();
      } else {
        await hideBadge();
      }
      setAffiliateLink(affiliatedLink);
    } catch (error) {
      logError(error, "shutafWorker:: Error");
    } finally {
      setLoading(false);
    }
  });

  debug("initShutafWorker", "Shutaf::worker is listening... init done.");
};
