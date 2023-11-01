import { BillingSubscriptionPlanType } from '@dogu-private/console';

export interface PlanDescriptionInfo {
  titleI18nKey: string;
  featureI18nKeys: string[];
  getOptionLabelText: (optionKey: number | string) => string;
  lastContactUsOptionKey: string | null;
}

export type PlanDescriptionInfoMap = {
  [key in BillingSubscriptionPlanType]: PlanDescriptionInfo;
};

export const planDescriptionInfoMap: PlanDescriptionInfoMap = {
  'live-testing': {
    titleI18nKey: 'Live Testing',
    featureI18nKeys: ['feature1', 'feature2'],
    getOptionLabelText: (optionKey: number | string) => {
      if (Number(optionKey) === 1) {
        return '1 parallel session';
      }

      return `${optionKey} parallel sessions`;
    },
    lastContactUsOptionKey: 'More than 25 parallel sessions',
  },
};
