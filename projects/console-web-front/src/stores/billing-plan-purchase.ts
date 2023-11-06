import {
  BillingCategory,
  BillingSubscriptionGroupType,
  BillingSubscriptionPlanType,
  CloudLicenseBase,
  SelfHostedLicenseBase,
} from '@dogu-private/console';
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
  license: CloudLicenseBase | SelfHostedLicenseBase | null;
  billingGroupType: BillingSubscriptionGroupType | null; // if null, show all group & plans
  selectedPlan: SelectedPlan | null;
  isAnnual: boolean;
  coupon: string | null;
  cardForm: FormInstance<BillingMethodRegistrationFormValues> | null;
  updateLicense: (license: CloudLicenseBase | SelfHostedLicenseBase | null) => void;
  updateBillingGroupType: (billingGroupType: BillingSubscriptionGroupType | null) => void;
  updateSelectedPlan: (selectedPlan: SelectedPlan | null) => void;
  updateIsAnnual: (isAnnual: boolean) => void;
  updateCoupon: (coupon: string | null) => void;
  updateCardForm: (cardForm: FormInstance | null) => void;
  reset: () => void;
}

const useBillingPlanPurchaseStore = create<BillingPlanPurchaseStore>()(
  subscribeWithSelector((set) => ({
    license: null,
    billingGroupType: null,
    selectedPlan: null,
    isAnnual: false,
    coupon: null,
    cardForm: null,
    updateLicense: (license) => set({ license }),
    updateBillingGroupType: (billingGroupType) => set({ billingGroupType }),
    updateSelectedPlan: (selectedPlan) => set({ selectedPlan }),
    updateIsAnnual: (isAnnual) => set({ isAnnual, coupon: null }),
    updateCoupon: (coupon) => set({ coupon }),
    updateCardForm: (cardForm) => set({ cardForm }),
    reset: () =>
      set({ license: null, billingGroupType: null, selectedPlan: null, isAnnual: false, coupon: null, cardForm: null }),
  })),
);

export default useBillingPlanPurchaseStore;
