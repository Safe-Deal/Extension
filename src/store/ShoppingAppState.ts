import { initPegasusZustandStoreBackend } from "@utils/pegasus/store-zustand";
import { pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const STORE_NAME = "globalShoppingAppState";

export enum ShoppingAppAction {
  FAVORITE = "FAVORITE",
  UNFAVORITE = "UNFAVORITE",
  NONE = "NONE"
}

interface ShoppingAppState {
  open: boolean;
  action: ShoppingAppAction;
  setOpen: (open: boolean) => void;
  setAction: (action: ShoppingAppAction) => void;
}

export const useShoppingAppStore = create<ShoppingAppState>()(
  subscribeWithSelector((set) => ({
    open: false,
    action: ShoppingAppAction.NONE,
    setOpen: (open) => set({ open }),
    setAction: (action) => set({ action })
  }))
);

export const initShoppingAppStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useShoppingAppStore);

export const shoppingAppStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useShoppingAppStore);
