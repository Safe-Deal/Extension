import { useAuthStore, authStoreReady } from "@store/AuthState";
import { logError, debug } from "@utils/analytics/logger";
import { browserWindow } from "@utils/dom/html";
import { AuthMessagesEvents, SubscriptionStatus } from "@constants/supabase";
import { initPegasusTransport } from "@utils/pegasus/transport/content-script";

initPegasusTransport();

(async () => {
  const win = browserWindow();
  try {
    await authStoreReady().then((store) => {
      debug("Auth Content Script::  initializing.... Auth store is ready!", store);
    });
    const authStore = useAuthStore.getState();
    win.addEventListener("message", (event) => {
      if (event.data.type === AuthMessagesEvents.AUTH_SESSION && event.data?.payload?.session) {
        authStore.setSession(event.data?.payload?.session);
        authStore.setUser(event.data?.payload?.session?.user);
        authStore.setPremiumStatus(
          event.data?.payload?.session?.user?.user_metadata?.subscription_status === SubscriptionStatus.Active
        );
        authStore.clearLoginRequest();
        authStore.setCloseAuthWindow(true);
      }
    });
  } catch (error) {
    logError(error);
  }
  return null;
})();
