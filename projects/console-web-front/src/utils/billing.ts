import {
  BillingSubscriptionPlanInfoBase,
  BillingSubscriptionPlanType,
  CloudLicenseBase,
  RegisterCardDto,
  SelfHostedLicenseBase,
} from '@dogu-private/console';
import { BillingMethodRegistrationFormValues } from '../components/billing/BillingMethodRegistrationForm';

export const getSubscriptionPlansFromLicense = (
  license: CloudLicenseBase | SelfHostedLicenseBase,
  planTypes: BillingSubscriptionPlanType[] | null,
): BillingSubscriptionPlanInfoBase[] => {
  if ('licenseKey' in license) {
    const selfHostedLicense = license;
    return [];
  } else {
    const cloudLicense = license;
    const usingPlans = cloudLicense.billingOrganization?.billingSubscriptionPlanInfos;

    if (planTypes) {
      return usingPlans?.filter((plan) => planTypes.includes(plan.type)) || [];
    }

    return usingPlans ?? [];
  }
};

export const parseNicePaymentMethodFormValues = (values: BillingMethodRegistrationFormValues): RegisterCardDto => {
  return {
    cardNumber: values.card.replaceAll(' ', ''),
    expirationMonth: values.expiry.split(' / ')[0],
    expirationYear: values.expiry.split(' / ')[1],
    idNumber: values.legalNumber,
    cardPasswordFirst2Digits: values.password,
  };
};
