import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { subscribeWithSelector } from "zustand/middleware";
import { initPegasusZustandStoreBackend, pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";

export const STORE_NAME = "globalAuthState";

export interface AuthState {
  session: Session | null;
  user: User | null;
  isPremium: boolean;
  isLoginRequested: boolean;
  isLogoutRequested: boolean;
  closeAuthWindow: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setPremiumStatus: (isPremium: boolean) => void;
  setCloseAuthWindow: (closeAuthWindow: boolean) => void;
  resetSession: () => void;
  resetUser: () => void;
  requestLogin: () => void;
  requestLogout: () => void;
  clearLoginRequest: () => void;
  clearLogoutRequest: () => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set) => ({
    session: null,
    user: null,
    isPremium: false,
    isLoginRequested: false,
    isLogoutRequested: false,
    closeAuthWindow: false,
    loading: false,
    setLoading: (loading) => set({ loading }),
    setCloseAuthWindow: (closeAuthWindow) => set({ closeAuthWindow }),
    setSession: (session) => set({ session }),
    setUser: (user) => set({ user }),
    setPremiumStatus: (isPremium) => set({ isPremium }),
    resetSession: () => set({ session: null }),
    resetUser: () => set({ user: null }),
    requestLogin: () => set({ isLoginRequested: true }),
    requestLogout: () => set({ isLogoutRequested: true }),
    clearLoginRequest: () => set({ isLoginRequested: false }),
    clearLogoutRequest: () => set({ isLogoutRequested: false })
  }))
);

export const initAuthStoreBackend = () =>
  initPegasusZustandStoreBackend(STORE_NAME, useAuthStore, {
    storageStrategy: "indexedDb"
  });

export const authStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useAuthStore);
