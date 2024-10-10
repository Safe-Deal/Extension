import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@utils/pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AnalyzedItem, Progress, DEFAULT_PROGRESS } from "@e-commerce/client/processing/productHandler";

export const STORE_NAME = "globalSupplierState";

interface SupplierState {
  analyzedItems: AnalyzedItem[];
  loading: boolean;
  progress: Progress;
  setProgress: (progress: Progress) => void;
  setAnalyzedItems: (data: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useSupplierStore = create<SupplierState>()(
  subscribeWithSelector((set) => ({
    analyzedItems: null,
    loading: true,
    progress: DEFAULT_PROGRESS,
    setProgress: (progress: Progress) => set({ progress: progress }),
    setAnalyzedItems: (data: AnalyzedItem[]) => set({ analyzedItems: data }),
    setLoading: (loading) => set({ loading: loading })
  }))
);

export const initSupplierStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useSupplierStore);

export const supplierStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useSupplierStore);
