import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@utils/pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AnalyzedItem, Progress, DEFAULT_PROGRESS } from "@e-commerce/client/processing/productHandler";

export const STORE_NAME = "globalSupplierState";

interface SupplierState {
  analyzedItems: AnalyzedItem[];
  loading: boolean;
  progress: Progress;
  supplierAiDTO: any;
  setSupplierAiDTO: (data: any) => void;
  setProgress: (progress: Progress) => void;
  setAnalyzedItems: (data: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useSupplierStore = create<SupplierState>()(
  subscribeWithSelector((set) => ({
    analyzedItems: null,
    loading: true,
    progress: DEFAULT_PROGRESS,
    supplierAiDTO: null,
    setSupplierAiDTO: (data: any) => set({ supplierAiDTO: data }),
    setProgress: (progress: Progress) => set({ progress }),
    setAnalyzedItems: (data: AnalyzedItem[]) => set({ analyzedItems: data }),
    setLoading: (loading) => set({ loading })
  }))
);

export const initSupplierStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useSupplierStore);

export const supplierStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useSupplierStore);
