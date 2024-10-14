import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@pegasus/store-zustand";
import { IAmazonCouponProduct } from "@e-commerce/apps/deals-amazon/deals-coupons.interfaces";
import { subscribeWithSelector } from "zustand/middleware";

export const STORE_NAME = "globalAmazonCouponsState";

interface AmazonCouponsState {
  coupons: IAmazonCouponProduct[];
  loading: boolean;
  setCoupons: (coupons: IAmazonCouponProduct[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAmazonCouponsStore = create<AmazonCouponsState>()(
  subscribeWithSelector((set) => ({
    coupons: [],
    loading: false,
    setCoupons: (coupons) => set({ coupons }),
    setLoading: (loading) => set({ loading })
  }))
);

export const initAmazonCouponsStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useAmazonCouponsStore);

export const amazonCouponsStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useAmazonCouponsStore);
