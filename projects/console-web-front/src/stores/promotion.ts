import { BillingSubscriptionPlanType } from '@dogu-private/console';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PromotionStore {
  organizationId: string | null;
  promotionCloseMap: { [key in BillingSubscriptionPlanType]?: string };
  currentPlanType: BillingSubscriptionPlanType | null;
  isPromotionOpenablePage: boolean;
  updateCurrentPlanType: (planType: BillingSubscriptionPlanType | null) => void;
  updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => void;
  resetWithOrganizationId: (organizationId: string | null) => void;
  savePromotionCloseTime: (planType: BillingSubscriptionPlanType) => void;
}

const usePromotionStore = create<PromotionStore>()(
  persist<PromotionStore>(
    (set) => ({
      organizationId: null,
      currentPlanType: null,
      isPromotionOpenablePage: false,
      promotionCloseMap: {},
      updateCurrentPlanType: (planType: BillingSubscriptionPlanType | null) => {
        set({ currentPlanType: planType });
      },
      updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => {
        set({ isPromotionOpenablePage });
      },
      resetWithOrganizationId: (organizationId: string | null) => {
        set({ organizationId, currentPlanType: null, promotionCloseMap: {} });
      },
      savePromotionCloseTime: (planType: BillingSubscriptionPlanType) => {
        set((state) => {
          const promotionCloseMap = { ...state.promotionCloseMap };
          promotionCloseMap[planType] = new Date().toISOString();
          return { promotionCloseMap };
        });
      },
    }),
    {
      name: 'promotion-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default usePromotionStore;
