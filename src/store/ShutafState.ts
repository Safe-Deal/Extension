import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { initPegasusZustandStoreBackend, pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";

export const STORE_NAME = "globalShutafState";

export interface ShutafState {
  affiliateLink: string | null;
  isEnabled: boolean;
  lastPingTime: number | null;
  loading: boolean;

  setAffiliateLink: (link: string | null) => void;
  setEnabled: (isEnabled: boolean) => void;
  updateLastPingTime: () => void;
  setLoading: (loading: boolean) => void;
  ping: () => void;
  resetState: () => void;
}

export const useShutafStore = create<ShutafState>()(
  subscribeWithSelector((set) => ({
    currentUrl: null,
    affiliateLink: null,
    isEnabled: true,
    lastPingTime: null,
    loading: false,

    setAffiliateLink: (link) => set({ affiliateLink: link }),
    setEnabled: (isEnabled) => set({ isEnabled }),
    updateLastPingTime: () => set({ lastPingTime: Date.now() }),
    setLoading: (loading) => set({ loading }),
    ping: () => set({ lastPingTime: Date.now() }),
    resetState: () =>
      set({
        affiliateLink: null,
        isEnabled: true,
        lastPingTime: null,
        loading: false
      })
  }))
);

export const initShutafStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useShutafStore);

export const shutafStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useShutafStore);
