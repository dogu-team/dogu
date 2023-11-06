import {
  BillingSubscriptionPlanInfoBase,
  BillingSubscriptionPlanType,
  CloudLicenseBase,
  SelfHostedLicenseBase,
} from '@dogu-private/console';

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
