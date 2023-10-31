import { CloudLicenseBase, SelfHostedLicenseBase } from '@dogu-private/console';

interface Props {
  license: CloudLicenseBase | SelfHostedLicenseBase;
}

const BillingSubscribedPlanDashboard: React.FC<Props> = ({ license }) => {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return <div>Self hosted billing</div>;
  }

  return <div>Cloud billing</div>;
};

export default BillingSubscribedPlanDashboard;
