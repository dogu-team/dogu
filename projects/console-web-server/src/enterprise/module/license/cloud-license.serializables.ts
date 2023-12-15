import { CloudLicenseBase, isBillingPlanSubscribing } from '@dogu-private/console';
import { LiveSessionActiveStates, PROJECT_TYPE } from '@dogu-private/types';
import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { LiveSession } from '../../../db/entity/live-session.entity';
import { RetryTransactionContext } from '../../../db/utils';

export class PaymentRequiredException extends HttpException {
  readonly retryable: boolean;

  constructor(
    message: string,
    options?: {
      retryable?: boolean;
    },
  ) {
    super(message, HttpStatus.PAYMENT_REQUIRED);
    this.retryable = options?.retryable ?? false;
  }
}

export namespace CloudLicenseSerializable {
  export async function validateLiveTesting(context: RetryTransactionContext, cloudLicense: CloudLicenseBase): Promise<void> {
    const { manager } = context;
    const count = await manager.getRepository(LiveSession).count({
      where: {
        organizationId: cloudLicense.organizationId,
        state: In(LiveSessionActiveStates),
      },
    });

    if (count >= cloudLicense.liveTestingParallelCount) {
      throw new PaymentRequiredException(`Live testing parallel count exceeded. liveTestingParallelCount: ${cloudLicense.liveTestingParallelCount}`, {
        retryable: true,
      });
    }

    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException({
        reason: 'Billing organization is not found.',
        organizationId: cloudLicense.organizationId,
      });
    }

    const isSubscribing = isBillingPlanSubscribing(cloudLicense.billingOrganization, 'live-testing');
    if (isSubscribing) {
      return;
    }

    if (cloudLicense.liveTestingRemainingFreeSeconds <= 0) {
      throw new PaymentRequiredException(`Live testing is not subscribed. remainingFreeSeconds: ${cloudLicense.liveTestingRemainingFreeSeconds}`, {
        retryable: false,
      });
    }
  }

  export async function validateWebTestAutomation(manager: EntityManager, cloudLicense: CloudLicenseBase): Promise<void> {
    const count = await manager.getRepository(DeviceRunner).count({
      where: {
        isInUse: 1,
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                type: PROJECT_TYPE.WEB,
                organization: {
                  organizationId: cloudLicense.organizationId,
                },
              },
            },
          },
        },
        device: {
          isHost: 1,
          organization: {
            shareable: true,
          },
        },
      },
      relations: {
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                organization: true,
              },
            },
          },
        },
        device: {
          organization: true,
        },
      },
    });

    if (count >= cloudLicense.webTestAutomationParallelCount) {
      throw new PaymentRequiredException(`Web test automation parallel count exceeded. webTestAutomationParallelCount: ${cloudLicense.webTestAutomationParallelCount}`, {
        retryable: true,
      });
    }

    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException({
        reason: 'Billing organization is not found.',
        organizationId: cloudLicense.organizationId,
      });
    }

    const isSubscribing = isBillingPlanSubscribing(cloudLicense.billingOrganization, 'web-test-automation');
    if (isSubscribing) {
      return;
    }

    if (cloudLicense.webTestAutomationRemainingFreeSeconds <= 0) {
      throw new PaymentRequiredException(`Web test automation is not subscribed. remainingFreeSeconds: ${cloudLicense.webTestAutomationRemainingFreeSeconds}`, {
        retryable: false,
      });
    }
  }

  export async function validateMobileAppTestAutomation(manager: EntityManager, cloudLicense: CloudLicenseBase): Promise<void> {
    const count = await manager.getRepository(DeviceRunner).count({
      where: {
        isInUse: 1,
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                type: PROJECT_TYPE.APP,
                organization: {
                  organizationId: cloudLicense.organizationId,
                },
              },
            },
          },
        },
        device: {
          isHost: 0,
          organization: {
            shareable: true,
          },
        },
      },
      relations: {
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                organization: true,
              },
            },
          },
        },
        device: {
          organization: true,
        },
      },
    });

    if (count >= cloudLicense.mobileAppTestAutomationParallelCount) {
      throw new PaymentRequiredException(
        `Mobile app test automation parallel count exceeded. mobileAppTestAutomationParallelCount: ${cloudLicense.mobileAppTestAutomationParallelCount}`,
        {
          retryable: true,
        },
      );
    }

    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException({
        reason: 'Billing organization is not found.',
        organizationId: cloudLicense.organizationId,
      });
    }

    const isSubscribing = isBillingPlanSubscribing(cloudLicense.billingOrganization, 'mobile-app-test-automation');
    if (isSubscribing) {
      return;
    }

    if (cloudLicense.mobileAppTestAutomationRemainingFreeSeconds <= 0) {
      throw new PaymentRequiredException(`Mobile app test automation is not subscribed. remainingFreeSeconds: ${cloudLicense.mobileAppTestAutomationRemainingFreeSeconds}`, {
        retryable: false,
      });
    }
  }

  export async function validateMobileGameTestAutomation(manager: EntityManager, cloudLicense: CloudLicenseBase): Promise<void> {
    const count = await manager.getRepository(DeviceRunner).count({
      where: {
        isInUse: 1,
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                type: PROJECT_TYPE.GAME,
                organization: {
                  organizationId: cloudLicense.organizationId,
                },
              },
            },
          },
        },
        device: {
          isHost: 0,
          organization: {
            shareable: true,
          },
        },
      },
      relations: {
        routineDeviceJobs: {
          routineJob: {
            routinePipeline: {
              project: {
                organization: true,
              },
            },
          },
        },
        device: {
          organization: true,
        },
      },
    });

    if (count >= cloudLicense.mobileGameTestAutomationParallelCount) {
      throw new PaymentRequiredException(
        `Mobile game test automation parallel count exceeded. mobileGameTestAutomationParallelCount: ${cloudLicense.mobileGameTestAutomationParallelCount}`,
        {
          retryable: true,
        },
      );
    }

    if (!cloudLicense.billingOrganization) {
      throw new InternalServerErrorException({
        reason: 'Billing organization is not found.',
        organizationId: cloudLicense.organizationId,
      });
    }

    const isSubscribing = isBillingPlanSubscribing(cloudLicense.billingOrganization, 'mobile-game-test-automation');
    if (isSubscribing) {
      return;
    }

    if (cloudLicense.mobileGameTestAutomationRemainingFreeSeconds <= 0) {
      throw new PaymentRequiredException(`Mobile game test automation is not subscribed. remainingFreeSeconds: ${cloudLicense.mobileGameTestAutomationRemainingFreeSeconds}`, {
        retryable: false,
      });
    }
  }
}
