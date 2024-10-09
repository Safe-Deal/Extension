import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ISuperDealProduct } from "@e-commerce/apps/deals-ali-express/common/interfaces";

export const STORE_NAME = "globalAliexpressDealsState";

interface AliexpressDealsState {
  superDeals: ISuperDealProduct[];
  loading: boolean;
  setSuperDeals: (superDeals: ISuperDealProduct[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAliexpressDealsStore = create<AliexpressDealsState>()(
  subscribeWithSelector((set) => ({
    superDeals: [],
    loading: false,
    setSuperDeals: (superDeals) => set({ superDeals }),
    setLoading: (loading) => set({ loading })
  }))
);

export const initAliexpressDealsStoreBackend = () =>
  initPegasusZustandStoreBackend(STORE_NAME, useAliexpressDealsStore);

export const aliexpressDealsStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useAliexpressDealsStore);
