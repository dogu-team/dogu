import { assertUnreachable } from '@dogu-tech/common';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { CloudLicense, DefaultLiveTestingParallelCount } from '../../db/entity/cloud-license.entity';

export function applyCloudLicense(cloudLicense: CloudLicense, planInfo: BillingSubscriptionPlanInfo): void {
  const { type, option, state } = planInfo;
  const subscribed = state !== 'unsubscribed';
  switch (type) {
    case 'live-testing': {
      if (!subscribed) {
        cloudLicense.liveTestingParallelCount = DefaultLiveTestingParallelCount;
      } else {
        cloudLicense.liveTestingParallelCount = option;
      }
      break;
    }
    default: {
      assertUnreachable(type);
    }
  }
}
