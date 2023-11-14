import { BillingSubscriptionGroupType, BillingSubscriptionPlanInfoBase } from '@dogu-private/console';
import { FormInstance } from 'antd';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { BillingMethodRegistrationFormValues } from '../components/billing/BillingMethodRegistrationForm';

export type SelectedPlan = Pick<BillingSubscriptionPlanInfoBase, 'category' | 'option' | 'type'>;

interface BillingPlanPurchaseStore {
  billingGroupType: BillingSubscriptionGroupType | null; // if null, show all group & plans
  selectedPlan: SelectedPlan | null;
  isAnnual: boolean;
  coupon: string | null;
  cardForm: FormInstance<BillingMethodRegistrationFormValues> | null;
  withNewCard: boolean;
  purchaseErrorText: string | null;
  updateBillingGroupType: (billingGroupType: BillingSubscriptionGroupType | null) => void;
  updateSelectedPlan: (selectedPlan: SelectedPlan | null) => void;
  updateIsAnnual: (isAnnual: boolean) => void;
  updateCoupon: (coupon: string | null) => void;
  updateCardForm: (cardForm: FormInstance | null) => void;
  updateWithNewCard: (withNewCard: boolean) => void;
  updatePurchaseErrorText: (purchaseErrorText: string | null) => void;
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
    purchaseErrorText: null,
    updateBillingGroupType: (billingGroupType) => set({ billingGroupType }),
    updateSelectedPlan: (selectedPlan) => set({ selectedPlan }),
    updateIsAnnual: (isAnnual) => set({ isAnnual, coupon: null }),
    updateCoupon: (coupon) => set({ coupon }),
    updateCardForm: (cardForm) => set({ cardForm }),
    updateWithNewCard: (withNewCard) => set({ withNewCard }),
    updatePurchaseErrorText: (purchaseErrorText) => set({ purchaseErrorText }),
    reset: () =>
      set({
        billingGroupType: null,
        selectedPlan: null,
        isAnnual: false,
        coupon: null,
        cardForm: null,
        withNewCard: false,
        purchaseErrorText: null,
      }),
  })),
);

export default useBillingPlanPurchaseStore;
