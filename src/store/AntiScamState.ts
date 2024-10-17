import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@utils/pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ScamConclusion } from "../anti-scam/types/anti-scam";

export const STORE_NAME = "globalAntiScamState";

interface AntiScamState {
  domain: string | null;
  conclusion: ScamConclusion | null;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  setDomain: (domain: string) => void;
  setConclusion: (conclusion: ScamConclusion) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAntiScamStore = create<AntiScamState>()(
  subscribeWithSelector((set) => ({
    domain: null,
    conclusion: null,
    loading: false,
    open: false,
    setOpen: (open) => set({ open }),
    setDomain: (domain) => set({ domain }),
    setConclusion: (conclusion) => set({ conclusion }),
    setLoading: (loading) => set({ loading }),
    reset: () => set({ domain: null, conclusion: null, loading: false })
  }))
);

export const initAntiScamStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useAntiScamStore);

export const antiScamStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useAntiScamStore);
