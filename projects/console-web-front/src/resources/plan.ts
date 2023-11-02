import { BillingSubscriptionGroupType, BillingSubscriptionPlanType } from '@dogu-private/console';

export interface PlanDescriptionInfo {
  titleI18nKey: string;
  featureI18nKeys: string[];
  getOptionLabelI18nKey: (optionKey: number | string) => string;
  lastContactUsOptionKey: string | null;
}

export type PlanDescriptionInfoMap = {
  [key in BillingSubscriptionPlanType]: PlanDescriptionInfo;
};

export const planDescriptionInfoMap: PlanDescriptionInfoMap = {
  'live-testing': {
    titleI18nKey: 'liveTestingPlanTitle',
    featureI18nKeys: ['liveTestingFeature1'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      if (Number(optionKey) === 1) {
        return 'liveTestingOptionSingular';
      }

      return `liveTestingOptionPlural`;
    },
    lastContactUsOptionKey: 'liveTestingMoreThanOption',
  },
};

export const groupTypeI18nKeyMap: { [key in BillingSubscriptionGroupType]: string } = {
  'live-testing-group': 'liveTestingPlanGroupTitle',
};
