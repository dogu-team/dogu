import { assertUnreachable } from '@dogu-tech/common';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { CloudLicense, DefaultCloudLicenseCount } from '../../db/entity/cloud-license.entity';

export function applyCloudLicense(cloudLicense: CloudLicense, planInfo: BillingPlanInfo): void {
  const { type, option, state } = planInfo;
  const subscribed = state !== 'unsubscribed';
  switch (type) {
    case 'live-testing': {
      if (!subscribed) {
        cloudLicense.liveTestingParallelCount = DefaultCloudLicenseCount['live-testing'];
      } else {
        cloudLicense.liveTestingParallelCount = option;
      }
      break;
    }
    case 'web-test-automation': {
      if (!subscribed) {
        cloudLicense.webTestAutomationParallelCount = DefaultCloudLicenseCount['web-test-automation'];
      } else {
        cloudLicense.webTestAutomationParallelCount = option;
      }
      break;
    }
    case 'mobile-app-test-automation': {
      if (!subscribed) {
        cloudLicense.mobileAppTestAutomationParallelCount = DefaultCloudLicenseCount['mobile-app-test-automation'];
      } else {
        cloudLicense.mobileAppTestAutomationParallelCount = option;
      }
      break;
    }
    case 'mobile-game-test-automation': {
      if (!subscribed) {
        cloudLicense.mobileGameTestAutomationParallelCount = DefaultCloudLicenseCount['mobile-game-test-automation'];
      } else {
        cloudLicense.mobileGameTestAutomationParallelCount = option;
      }
      break;
    }
    case 'self-device-farm-browser': {
      if (!subscribed) {
        cloudLicense.selfDeviceBrowserCount = DefaultCloudLicenseCount['self-device-farm-browser'];
      } else {
        cloudLicense.selfDeviceBrowserCount = option;
      }
      break;
    }
    case 'self-device-farm-mobile': {
      if (!subscribed) {
        cloudLicense.selfDeviceMobileCount = DefaultCloudLicenseCount['self-device-farm-mobile'];
      } else {
        cloudLicense.selfDeviceMobileCount = option;
      }
      break;
    }
    default: {
      assertUnreachable(type);
    }
  }
}
