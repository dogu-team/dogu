import { BillingPlanType } from '@dogu-private/console';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PromotionStore {
  organizationId: string | null;
  promotionCloseMap: { [key in BillingPlanType]?: string };
  currentPlanType: BillingPlanType | null;
  isPromotionOpenablePage: boolean;
  updateCurrentPlanType: (planType: BillingPlanType | null) => void;
  updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => void;
  resetWithOrganizationId: (organizationId: string | null) => void;
  savePromotionCloseTime: (planType: BillingPlanType) => void;
}

const usePromotionStore = create<PromotionStore>()(
  persist<PromotionStore>(
    (set) => ({
      organizationId: null,
      currentPlanType: null,
      isPromotionOpenablePage: false,
      promotionCloseMap: {},
      updateCurrentPlanType: (planType: BillingPlanType | null) => {
        set({ currentPlanType: planType });
      },
      updateIsPromotionOpenablePage: (isPromotionOpenablePage: boolean) => {
        set({ isPromotionOpenablePage });
      },
      resetWithOrganizationId: (organizationId: string | null) => {
        set({ organizationId, currentPlanType: null, promotionCloseMap: {} });
      },
      savePromotionCloseTime: (planType: BillingPlanType) => {
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
