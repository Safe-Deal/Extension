import { useAuthStore, authStoreReady } from "@store/AuthState";
import { logError, debug } from "@utils/analytics/logger";
import { browserWindow } from "@utils/dom/html";
import { SUPABASE, SubscriptionStatus } from "@constants/supabase";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";
import { isTrustedAuthMessage } from "./auth-message";

initPegasusTransport();

const TRUSTED_AUTH_ORIGIN = new URL(SUPABASE.EXTENSION_AUTH_PATH).origin;

(async () => {
  const win = browserWindow();
  try {
    await authStoreReady().then((store) => {
      debug("Auth Content Script::  initializing.... Auth store is ready!", store);
    });
    const authStore = useAuthStore.getState();
    win.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (isTrustedAuthMessage(event, TRUSTED_AUTH_ORIGIN)) {
        const { session } = event.data.payload;
        authStore.setSession(session);
        authStore.setUser(session.user);
        authStore.setPremiumStatus(session.user?.user_metadata?.subscription_status === SubscriptionStatus.Active);
        authStore.clearLoginRequest();
        authStore.setCloseAuthWindow(true);
      }
    });
  } catch (error) {
    logError(error);
  }
  return null;
})();
