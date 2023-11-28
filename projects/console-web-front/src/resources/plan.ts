import { BillingPlanType, BillingSubscriptionGroupType } from '@dogu-private/console';

export interface PlanDescriptionInfo {
  titleI18nKey: string;
  featureI18nKeys: string[];
  getOptionLabelI18nKey: (optionKey: number | string) => string;
  lastContactUsOptionKey: string | null;
}

export type PlanDescriptionInfoMap = {
  [key in BillingPlanType]: PlanDescriptionInfo;
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

export const niceErrorCodeMessageI18nKeyMap: { [key: string]: string } = {
  '3011': 'invalidCardNumberErrorMessage',
  '3021': 'invalidCardExpiryErrorMessage',
  '3051': 'unavailableCardErrorMessage',
  '3053': 'unavailableCardErrorMessage',
  F112: 'invalidCardNumberErrorMessage',
  F113: 'invalidUserInfoErrorMessage',
  F118: 'unavailableCardErrorMessage',
};
