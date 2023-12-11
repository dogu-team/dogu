import { assertUnreachable } from '@dogu-tech/common';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { CloudLicense, DefaultLiveTestingParallelCount } from '../../db/entity/cloud-license.entity';

export function applyCloudLicense(cloudLicense: CloudLicense, planInfo: BillingPlanInfo): void {
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
