import { authStoreReady, useAuthStore } from "@store/AuthState";
import { shutafStoreReady } from "@store/ShutafState";
import { IShutafMessageBus, ShutafMessageType } from "./shutaf-worker";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { debug, logError } from "../utils/analytics/logger";
import { browserWindow } from "../utils/dom/html";
import { onHrefChange } from "../utils/dom/location";
import { definePegasusMessageBus } from "@utils/pegasus/transport";

const PING_INTERVAL_IN_SEC = 25;

initPegasusTransport({ allowWindowMessagingForNamespace: "CONTENT_SCRIPT_SHUTAF" });

(async () => {
  try {
    await authStoreReady();
    await shutafStoreReady();
    const { user } = useAuthStore.getState();
    const userMetadata = user?.user_metadata;
    const { sendMessage } = definePegasusMessageBus<IShutafMessageBus>();

    if (isActiveSubscriber(userMetadata)) {
      debug(`Shutaf:: Disable...`);
      return;
    }

    setInterval(() => {
      sendMessage(ShutafMessageType.PING, null);
    }, PING_INTERVAL_IN_SEC * 1000);

    debug(`Shutaf:: init...`);
    const url: string = browserWindow().location.href;
    sendMessage(ShutafMessageType.GENERATE_AFFILIATE_LINK, url);

    onHrefChange((href) => {
      debug(`Shutaf:: URL changed...`);
      sendMessage(ShutafMessageType.GENERATE_AFFILIATE_LINK, url);
      debug(`Shutaf:: URL changed... Done`);
    });
    debug(`Shutaf:: init... Done`);
  } catch (error) {
    logError(error);
  }
})();

const isActiveSubscriptionStatus = (status: string): boolean => status === "active" || status === "trialing";

const hasPaddleSubscriptionId = (paddleId: string | undefined): boolean => Boolean(paddleId);

const isActiveSubscriber = (userMetadata: any): boolean => {
  const subscription_status = userMetadata?.subscription_status;
  const paddle_subscription_id = userMetadata?.paddle_subscription_id;
  return isActiveSubscriptionStatus(subscription_status) && hasPaddleSubscriptionId(paddle_subscription_id);
};
