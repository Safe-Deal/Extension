import { create } from "zustand";
import { initPegasusZustandStoreBackend, pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { IProduct } from "../data/entities/product.interface";
import { IConclusionResponse } from "../data/rules-conclusion/conclusion-response.interface";

export const STORE_NAME = "globalEcommerceState";

interface EcommerceState {
  currentProduct: IProduct | null;
  conclusionResponse: IConclusionResponse | null;
  setCurrentProduct: (product: IProduct) => void;
  setConclusionResponse: (response: IConclusionResponse) => void;
}

export const useEcommerceStore = create<EcommerceState>()(
  subscribeWithSelector((set) => ({
    currentProduct: null,
    conclusionResponse: null,
    setCurrentProduct: (product) => set({ currentProduct: product }),
    setConclusionResponse: (response) => set({ conclusionResponse: response })
  }))
);

export const initEcommerceStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useEcommerceStore);

export const ecommerceStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useEcommerceStore);
