import { BillingCategory, BillingSubscriptionGroupType, BillingSubscriptionPlanType } from '@dogu-private/console';
import { FormInstance } from 'antd';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BillingMethodRegistrationFormValues } from '../components/billing/BillingMethodRegistrationForm';

type SelectedPlan = {
  planType: BillingSubscriptionPlanType;
  option: number;
  category: BillingCategory;
};

interface BillingPlanPurchaseStore {
  billingGroupType: BillingSubscriptionGroupType | null; // if null, show all group & plans
  selectedPlan: SelectedPlan | null;
  isAnnual: boolean;
  coupon: string | null;
  cardForm: FormInstance<BillingMethodRegistrationFormValues> | null;
  withNewCard: boolean;
  updateBillingGroupType: (billingGroupType: BillingSubscriptionGroupType | null) => void;
  updateSelectedPlan: (selectedPlan: SelectedPlan | null) => void;
  updateIsAnnual: (isAnnual: boolean) => void;
  updateCoupon: (coupon: string | null) => void;
  updateCardForm: (cardForm: FormInstance | null) => void;
  updateWithNewCard: (withNewCard: boolean) => void;
  reset: () => void;
}

const useBillingPlanPurchaseStore = create<BillingPlanPurchaseStore>()(
  subscribeWithSelector((set) => ({
    billingGroupType: null,
    selectedPlan: null,
    isAnnual: false,
    coupon: null,
    cardForm: null,
    withNewCard: false,
    updateBillingGroupType: (billingGroupType) => set({ billingGroupType }),
    updateSelectedPlan: (selectedPlan) => set({ selectedPlan }),
    updateIsAnnual: (isAnnual) => set({ isAnnual, coupon: null }),
    updateCoupon: (coupon) => set({ coupon }),
    updateCardForm: (cardForm) => set({ cardForm }),
    updateWithNewCard: (withNewCard) => set({ withNewCard }),
    reset: () =>
      set({
        billingGroupType: null,
        selectedPlan: null,
        isAnnual: false,
        coupon: null,
        cardForm: null,
        withNewCard: false,
      }),
  })),
);

export default useBillingPlanPurchaseStore;
