import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { debug, logError } from "../../utils/analytics/logger";
import { LinkScanEvaluator } from "./link-scan-logic";
import { ILinkScanMessageBus, LinkScanMessageTypes } from "./types";

export const initLinkScanWorker = () => {
  const { onMessage } = definePegasusMessageBus<ILinkScanMessageBus>();

  onMessage(LinkScanMessageTypes.SCAN_LINK, async (request) => {
    const hostname = request.data;
    const tabId = request.sender?.tabId;
    debug(`LinkScanWorker:: Scanning ${hostname}...`);

    try {
      const result = await LinkScanEvaluator.evaluate(hostname, tabId);
      debug(`LinkScanWorker:: ${hostname} → ${result.state}`);
      return result;
    } catch (error) {
      logError(error, "LinkScanWorker:: Error:");
      return { state: "error" as const, hostname, explanation: "Scan failed", engineBreakdown: [] };
    }
  });
};
