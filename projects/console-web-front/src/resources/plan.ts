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
  'web-test-automation': {
    titleI18nKey: 'webTestAutomationPlanTitle',
    featureI18nKeys: ['webTestAutomationFeature1', 'webTestAutomationFeature2'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      if (Number(optionKey) === 1) {
        return 'parallelTestingOptionSingular';
      }

      return `parallelTestingOptionPlural`;
    },
    lastContactUsOptionKey: 'parallelTestingMoreThanOption',
  },
  'mobile-app-test-automation': {
    titleI18nKey: 'mobileAppTestAutomationPlanTitle',
    featureI18nKeys: ['mobileAppTestAutomationFeature1', 'mobileAppTestAutomationFeature2'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      if (Number(optionKey) === 1) {
        return 'parallelTestingOptionSingular';
      }

      return `parallelTestingOptionPlural`;
    },
    lastContactUsOptionKey: 'parallelTestingMoreThanOption',
  },
  'mobile-game-test-automation': {
    titleI18nKey: 'mobileGameTestAutomationPlanTitle',
    featureI18nKeys: ['mobileGameTestAutomationFeature1', 'mobileGameTestAutomationFeature2'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      if (Number(optionKey) === 1) {
        return 'parallelTestingOptionSingular';
      }

      return `parallelTestingOptionPlural`;
    },
    lastContactUsOptionKey: 'parallelTestingMoreThanOption',
  },
  'self-device-farm-browser': {
    titleI18nKey: 'selfDeviceFarmBrowserPlanTitle',
    featureI18nKeys: ['selfDeviceFarmBrowserFeature1', 'selfDeviceFarmBrowserFeature2'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      return `selfDeviceFarmBrowserOptionPlural`;
    },
    lastContactUsOptionKey: 'selfDeviceFarmBrowserMoreThanOption',
  },
  'self-device-farm-mobile': {
    titleI18nKey: 'selfDeviceFarmMobilePlanTitle',
    featureI18nKeys: ['selfDeviceFarmMobileFeature1', 'selfDeviceFarmMobileFeature2'],
    getOptionLabelI18nKey: (optionKey: number | string) => {
      return `selfDeviceFarmMobileOptionPlural`;
    },
    lastContactUsOptionKey: 'selfDeviceFarmMobileMoreThanOption',
  },
};

export const groupTypeI18nKeyMap: { [key in BillingSubscriptionGroupType]: string } = {
  'live-testing-group': 'liveTestingPlanGroupTitle',
  'web-test-automation-group': 'webTestAutomationPlanGroupTitle',
  'mobile-app-test-automation-group': 'mobileAppTestAutomationPlanGroupTitle',
  'mobile-game-test-automation-group': 'mobileGameTestAutomationPlanGroupTitle',
  'self-device-farm-group': 'selfDeviceFarmPlanGroupTitle',
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
