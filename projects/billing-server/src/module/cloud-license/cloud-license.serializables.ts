import { BillingOrganizationProp, BillingResult, CloudLicenseProp, CloudLicenseResponse, CreateCloudLicenseDto, FindCloudLicenseDto, resultCode } from '@dogu-private/console';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';

import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetrySerializeContext } from '../../db/utils';
import { createBillingOrganization } from '../billing-organization/billing-organization.serializables';
import { BillingSubscriptionPlanInfoCommonModule } from '../common/plan-info-common.module';
import { applyCloudLicense } from './cloud-license.utils';

export async function createCloudLicense(context: RetrySerializeContext, dto: CreateCloudLicenseDto): Promise<CloudLicense> {
  const { manager } = context;
  const { organizationId } = dto;
  const found = await manager.getRepository(CloudLicense).findOne({ where: { organizationId } });
  if (found) {
    throw new ConflictException(`CloudLicense already exists by organizationId ${organizationId}`);
  }

  const billingOrganization = await createBillingOrganization(context, { organizationId, category: 'cloud' });
  const created = manager.getRepository(CloudLicense).create({
    cloudLicenseId: v4(),
    organizationId,
    category: 'cloud',
    billingOrganization,
  });
  const saved = await manager.getRepository(CloudLicense).save(created);
  return saved;
}

export async function findCloudLicense(context: RetrySerializeContext, dto: FindCloudLicenseDto): Promise<CloudLicenseResponse> {
  const { manager } = context;
  const { organizationId } = dto;
  const license = await manager.getRepository(CloudLicense).findOne({
    where: { organizationId },
    relations: [
      CloudLicenseProp.billingOrganization,
      `${CloudLicenseProp.billingOrganization}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`,
      `${CloudLicenseProp.billingOrganization}.${BillingOrganizationProp.billingMethodNice}`,
    ],
  });

  if (!license) {
    throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
  }

  const response = license as CloudLicenseResponse;

  response.billingOrganization?.billingSubscriptionPlanInfos?.forEach((info) => {
    const { monthlyExpiredAt, yearlyExpiredAt } = BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(response.billingOrganization, info);
    info.monthlyExpiredAt = monthlyExpiredAt;
    info.yearlyExpiredAt = yearlyExpiredAt;
  });

  return response;
}

export interface UpdateCloudLicenseOptions {
  billingOrganizationId: string;
  planInfos: BillingSubscriptionPlanInfo[];
}

export type UpdateCloudLicenseResult = BillingResult<CloudLicense>;

export async function updateCloudLicense(context: RetrySerializeContext, options: UpdateCloudLicenseOptions): Promise<UpdateCloudLicenseResult> {
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
