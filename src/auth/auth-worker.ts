import { Session } from "@supabase/supabase-js";
import { ext } from "@utils/extension/ext";
import { debug } from "@utils/analytics/logger";
import { useAuthStore, initAuthStoreBackend } from "@store/AuthState";
import { SubscriptionStatus } from "@constants/supabase";
import supabase from "../utils/supabase";
import { SUPABASE, SupabaseAuthEvents } from "../constants/supabase";

const { EXTENSION_AUTH_PATH } = SUPABASE;

let authWindow: typeof ext.windows.Window | null = null;

const initStore = async () => {
  try {
    const store = await initAuthStoreBackend();
    debug("AuthStoreReady:: Auth Store Ready:", store);
    store.subscribe((state, prevState) => {
      debug("AuthStore:: Auth Store State Changed:", state);
      handleLoginLogoutRequests(state, prevState);
    });
  } catch (error) {
    debug("AuthStoreError:: Auth Store Error:", error);
  }
};

const handleLoginLogoutRequests = (
  state: ReturnType<typeof useAuthStore.getState>,
  prevState: ReturnType<typeof useAuthStore.getState>
) => {
  const { setCloseAuthWindow } = useAuthStore.getState();
  if (state.isLoginRequested && !prevState.isLoginRequested) {
    openAuthWindow();
    useAuthStore.getState().clearLoginRequest();
  }
  if (state.isLogoutRequested && !prevState.isLogoutRequested) {
    performLogout();
    useAuthStore.getState().clearLogoutRequest();
  }
  if (state.closeAuthWindow && !prevState.closeAuthWindow) {
    closeAuthWindow();
    setCloseAuthWindow(false);
  }
};

const openAuthWindow = () => {
  ext.windows.create(
    {
      url: EXTENSION_AUTH_PATH,
      type: "popup",
      width: 600,
      height: 800,
      top: 0,
      left: 0,
      focused: true
    },
    (window: Window) => {
      authWindow = window;
    }
  );
};

const closeAuthWindow = () => {
  if (authWindow) {
    ext.windows.remove(authWindow.id);
    authWindow = null;
  }
};

const performLogout = async () => {
  const { resetSession, resetUser, setPremiumStatus } = useAuthStore.getState();
  await supabase.auth.signOut();
  resetSession();
  resetUser();
  setPremiumStatus(false);
};

const initSupabaseSession = async () => {
  const { session } = useAuthStore.getState();
  if (session) {
    await supabase.auth.setSession(session);
  } else {
    await supabase.auth.signOut();
    useAuthStore.getState().resetSession();
  }
};

const handleSupabaseAuthStateChange = () => {
  supabase.auth.onAuthStateChange(async (event: SupabaseAuthEvents, session: Session) => {
    const { setPremiumStatus, setSession, setUser } = useAuthStore.getState();
    if (event === SupabaseAuthEvents.SIGNED_IN || event === SupabaseAuthEvents.TOKEN_REFRESHED) {
      setSession(session);
      setUser(session.user);
      setPremiumStatus(session.user?.user_metadata?.subscription_status === SubscriptionStatus.Active);
      closeAuthWindow();
    }
  });
};

export const initAuthWorker = async () => {
  await initStore();
  await initSupabaseSession();
  handleSupabaseAuthStateChange();
};
