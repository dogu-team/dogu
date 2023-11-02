import { BillingOrganizationProp, CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { ConflictException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function findOrganizationWithSubscriptionPlans(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`, BillingOrganizationProp.billingSubscriptionPlans)
    .where({ organizationId })
    .getOne();
}

export async function findOrganizationWithMethod(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingOrganizationProp.billingMethodNice)
    .where({ organizationId })
    .getOne();
}

export async function findOrganizationWithMethodAndSubscriptionPlans(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingOrganizationProp.billingMethodNice)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`, BillingOrganizationProp.billingSubscriptionPlans)
    .where({ organizationId })
    .getOne();
}

export async function createOrganization(context: RetrySerializeContext, dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
  const { manager } = context;
  const { organizationId, category } = dto;
  const found = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
  if (found) {
    throw new ConflictException(`BillingOrganization already exists by organizationId ${organizationId}`);
  }

  const created = manager.getRepository(BillingOrganization).create({
    billingOrganizationId: v4(),
    organizationId,
    category,
  });
  const saved = await manager.getRepository(BillingOrganization).save(created);
  return saved;
}
