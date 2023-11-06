import { CloudLicenseBase, SelfHostedLicenseBase } from '@dogu-private/console';

interface Props {
  license: CloudLicenseBase | SelfHostedLicenseBase;
}

const BillingSubscribedPlanList: React.FC<Props> = ({ license }) => {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    const selfHostedLicense = license as SelfHostedLicenseBase;

    return <div>Self hosted billing</div>;
  }

  const cloudLicense = license as CloudLicenseBase;

  return (
    <div>
      {cloudLicense.billingOrganization?.billingSubscriptionPlanInfos?.map((plan) => {
        return (
          <div key={plan.billingSubscriptionPlanInfoId}>
            {plan.type} {plan.option}
          </div>
        );
      })}
    </div>
  );
};

export default BillingSubscribedPlanList;
