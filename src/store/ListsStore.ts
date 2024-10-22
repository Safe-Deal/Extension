import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { initPegasusZustandStoreBackend, pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";

export interface List {
  id: string;
  team_id: string;
  creator_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  products: Array<string>;
}

export const STORE_NAME = "globalListsState";

export interface ListsState {
  lists: List[];
  setLists: (lists: List[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadingFavorite: boolean;
  setLoadingFavorite: (loading: boolean) => void;
  isCurrentAFavorite: boolean;
  setIsCurrentAFavorite: (isCurrentAFavorite: boolean) => void;
}

export const useListsStore = create<ListsState>()(
  subscribeWithSelector((set) => ({
    lists: [],
    setLists: (lists: List[]) => set({ lists }),
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
    loadingFavorite: false,
    setLoadingFavorite: (loading: boolean) => set({ loadingFavorite: loading }),
    isCurrentAFavorite: false,
    setIsCurrentAFavorite: (isCurrentAFavorite: boolean) => set({ isCurrentAFavorite })
  }))
);

export const initListsStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useListsStore);
export const listsStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useListsStore);
