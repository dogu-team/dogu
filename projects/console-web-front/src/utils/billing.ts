import {
  BillingSubscriptionPlanBase,
  BillingSubscriptionPlanType,
  CloudLicenseBase,
  SelfHostedLicenseBase,
} from '@dogu-private/console';

export const getSubscriptionPlansFromLicense = (
  license: CloudLicenseBase | SelfHostedLicenseBase,
  planTypes: BillingSubscriptionPlanType[] | null,
): BillingSubscriptionPlanBase[] => {
  if ('licenseKey' in license) {
    const selfHostedLicense = license;
    return [];
  } else {
    const cloudLicense = license;
    const usingPlans = cloudLicense.billingOrganization?.billingSubscriptionPlans;

    if (planTypes) {
      return usingPlans?.filter((plan) => planTypes.includes(plan.type)) || [];
    }

    return usingPlans ?? [];
  }
};
