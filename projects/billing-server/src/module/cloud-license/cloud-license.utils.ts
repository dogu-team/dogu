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
    case 'web-test-automation': {
      break;
    }
    case 'mobile-app-test-automation': {
      break;
    }
    case 'mobile-game-test-automation': {
      break;
    }
    case 'self-device-farm-browser': {
      break;
    }
    case 'self-device-farm-mobile': {
      break;
    }
    default: {
      assertUnreachable(type);
    }
  }
}
