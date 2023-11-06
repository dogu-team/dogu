import { BillingOrganizationProp, BillingResultCode, CloudLicenseProp, CreateCloudLicenseDto, FindCloudLicenseDto, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetrySerializeContext } from '../../db/utils';
import { createBillingOrganization } from '../billing-organization/billing-organization.serializables';

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
    billingOrganization,
  });
  const saved = await manager.getRepository(CloudLicense).save(created);
  return saved;
}

export async function findCloudLicense(context: RetrySerializeContext, dto: FindCloudLicenseDto): Promise<CloudLicense> {
  const { manager } = context;
  const { organizationId } = dto;
  const license = await manager.getRepository(CloudLicense).findOne({
    where: { organizationId },
    relations: [CloudLicenseProp.billingOrganization, `${CloudLicenseProp.billingOrganization}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`],
  });

  if (!license) {
    throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
  }

  return license;
}

export interface ApplyCloudLicenseOptions {
  billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo;
}

export interface ApplyCloudLicenseResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ApplyCloudLicenseResultSuccess {
  ok: true;
}

export type ApplyCloudLicenseResult = ApplyCloudLicenseResultFailure | ApplyCloudLicenseResultSuccess;

export async function applyCloudLicense(context: RetrySerializeContext, options: ApplyCloudLicenseOptions): Promise<ApplyCloudLicenseResult> {
  const { manager } = context;
  const { billingSubscriptionPlanInfo } = options;
  const cloudLicense = await manager.getRepository(CloudLicense).findOne({
    where: {
      billingOrganizationId: billingSubscriptionPlanInfo.billingOrganizationId,
    },
  });
  if (cloudLicense === null) {
    return {
      ok: false,
      resultCode: resultCode('cloud-license-not-found'),
    };
  }

  switch (billingSubscriptionPlanInfo.type) {
    case 'live-testing':
      {
        cloudLicense.liveTestingParallelCount = billingSubscriptionPlanInfo.option;
      }
      break;
    default: {
      assertUnreachable(billingSubscriptionPlanInfo.type);
    }
  }

  await manager.getRepository(CloudLicense).save(cloudLicense);
  return {
    ok: true,
  };
}
