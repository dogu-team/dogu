import { BillingOrganizationProp, CloudLicenseProp, CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { RetrySerializeContext } from '../../db/utils';
import { createOrganization } from '../billing-organization/billing-organization.serializables';

export async function createCloudLicense(context: RetrySerializeContext, dto: CreateCloudLicenseDto): Promise<CloudLicense> {
  const { manager } = context;
  const { organizationId } = dto;
  const found = await manager.getRepository(CloudLicense).findOne({ where: { organizationId } });
  if (found) {
    throw new ConflictException(`CloudLicense already exists by organizationId ${organizationId}`);
  }

  const billingOrganization = await createOrganization(context, { organizationId, category: 'cloud' });
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
  const license = await manager
    .getRepository(CloudLicense)
    .createQueryBuilder(CloudLicense.name)
    .leftJoinAndSelect(`${CloudLicense.name}.${CloudLicenseProp.billingOrganization}`, CloudLicenseProp.billingOrganization)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`, BillingOrganizationProp.billingSubscriptionPlans)
    .where({ organizationId })
    .getOne();

  if (!license) {
    throw new NotFoundException(`Organization does not have a cloud license. organizationId: ${organizationId}`);
  }

  return license;
}
