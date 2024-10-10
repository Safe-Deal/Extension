import { create } from "zustand";
import { pegasusZustandStoreReady, initPegasusZustandStoreBackend } from "@utils/pegasus/store-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ReviewsResponse } from "@e-commerce/reviews/reviews-worker";

const STORE_NAME = "globalReviewSummaryState";

export interface ReviewSummaryState {
  reviewData: ReviewsResponse | null;
  isLoading: boolean;
  error: string | null;
  setReviewData: (data: ReviewsResponse) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReviewSummaryStore = create<ReviewSummaryState>()(
  subscribeWithSelector((set) => ({
    reviewData: null,
    isLoading: false,
    error: null,
    setReviewData: (data) => set({ reviewData: data }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error })
  }))
);

export const initReviewSummaryStoreBackend = () => initPegasusZustandStoreBackend(STORE_NAME, useReviewSummaryStore);

export const reviewSummaryStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useReviewSummaryStore);
