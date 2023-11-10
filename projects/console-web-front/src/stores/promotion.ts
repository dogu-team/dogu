import { BillingSubscriptionPlanType } from '@dogu-private/console';
import { create } from 'zustand';

export interface PromotionStore {
  currentPlanType: BillingSubscriptionPlanType | null;
  isPromotionOpenablePage: boolean;
  updateCurrentPlanType: (planType: BillingSubscriptionPlanType | null) => void;
  updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => void;
}

const usePromotionStore = create<PromotionStore>((set) => ({
  currentPlanType: null,
  isPromotionOpenablePage: false,
  updateCurrentPlanType: (planType: BillingSubscriptionPlanType | null) => {
    set({ currentPlanType: planType });
  },
  updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => {
    set({ isPromotionOpenablePage });
  },
}));

export default usePromotionStore;
