import { authStoreReady, useAuthStore } from "@store/AuthState";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { debug, logError } from "../utils/analytics/logger";
import { browserWindow } from "../utils/dom/html";
import { onHrefChange } from "../utils/dom/location";
import { SHUTAF_GLUE } from "../utils/extension/glue";

const PING_INTERVAL_IN_SEC = 25;

initPegasusTransport();

const setupPing = () => {
  setInterval(() => {
    SHUTAF_GLUE.ping();
  }, PING_INTERVAL_IN_SEC * 1000);
};

const storeAndSendUrl = (url: string) => {
  SHUTAF_GLUE.send(url);
  debug(`Shutaf:: Sent URL: ${url}`);
};

const isActiveSubscriptionStatus = (status: string): boolean => status === "active" || status === "trialing";

const hasPaddleSubscriptionId = (paddleId: string | undefined): boolean => Boolean(paddleId);

const isActiveSubscriber = (userMetadata: any): boolean => {
  const subscription_status = userMetadata?.subscription_status;
  const paddle_subscription_id = userMetadata?.paddle_subscription_id;
  return isActiveSubscriptionStatus(subscription_status) && hasPaddleSubscriptionId(paddle_subscription_id);
};

(async () => {
  try {
    await authStoreReady().then((store) => {
      debug(`Auth Content Script:: initializing.... Auth store is ready!`, store);
    });

    const { user } = useAuthStore.getState();
    const userMetadata = user?.user_metadata;

    if (isActiveSubscriber(userMetadata)) {
      debug(`Shutaf:: Disable...`);
      return;
    }

    setupPing();
    debug(`Shutaf:: init...`);
    const url: string = browserWindow().location.href;
    storeAndSendUrl(url);
    onHrefChange((href) => {
      debug(`Shutaf:: URL changed...`);
      storeAndSendUrl(href);
      debug(`Shutaf:: URL changed... Done`);
    });
    debug(`Shutaf:: init... Done`);
  } catch (error) {
    logError(error);
  }
})();
