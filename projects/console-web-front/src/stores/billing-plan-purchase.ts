import { create } from 'zustand';

interface BillingPlanPurchaseStore {
  isAnnual: boolean;
  updateIsAnnual: (isAnnual: boolean) => void;
}

const useBillingPlanPurchaseStore = create<BillingPlanPurchaseStore>((set) => ({
  isAnnual: false,
  updateIsAnnual: (isAnnual) => set({ isAnnual }),
}));

export default useBillingPlanPurchaseStore;
