import { BillingResult, FindCloudLicenseDto, resultCode } from '@dogu-private/console';
import { NotFoundException } from '@nestjs/common';

import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';
import { applyCloudLicense } from './cloud-license.utils';

export async function findCloudLicense(context: RetryTransactionContext, dto: FindCloudLicenseDto): Promise<CloudLicense> {
  const { manager } = context;
  const { organizationId } = dto;
  const cloudLicense = await manager.getRepository(CloudLicense).findOne({
    where: {
      organizationId,
    },
    relations: {
      billingOrganization: {
        billingPlanInfos: true,
        billingMethodNice: true,
        billingMethodPaddle: true,
      },
    },
  });

  if (!cloudLicense) {
    throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
  }

  return cloudLicense;
}

export interface UpdateCloudLicenseOptions {
  billingOrganizationId: string;
  planInfos: BillingPlanInfo[];
}

export type UpdateCloudLicenseResult = BillingResult<CloudLicense>;

export async function updateCloudLicense(context: RetryTransactionContext, options: UpdateCloudLicenseOptions): Promise<UpdateCloudLicenseResult> {
  const { manager } = context;
  const { billingOrganizationId, planInfos } = options;
  const cloudLicense = await manager.getRepository(CloudLicense).findOne({
    where: {
      billingOrganizationId,
    },
    lock: {
      mode: 'pessimistic_write',
    },
  });

  if (cloudLicense === null) {
    return {
      ok: false,
      resultCode: resultCode('cloud-license-not-found', {
        billingOrganizationId,
      }),
    };
  }

  planInfos.forEach((info) => applyCloudLicense(cloudLicense, info));
  const license = await manager.getRepository(CloudLicense).save(cloudLicense);
  return {
    ok: true,
    value: license,
  };
}
