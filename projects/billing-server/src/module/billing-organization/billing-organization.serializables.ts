import { BillingOrganizationProp, BillingSubscriptionPlanProp, CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { ConflictException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function findOrganizationWithSubscriptionPlans(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(
      `${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`,
      BillingSubscriptionPlan.name,
      `${BillingSubscriptionPlan.name}.${BillingSubscriptionPlanProp.unsubscribedAt} IS NULL`,
    )
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
    .leftJoinAndSelect(
      `${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`,
      BillingSubscriptionPlan.name,
      `${BillingSubscriptionPlan.name}.${BillingSubscriptionPlanProp.unsubscribedAt} IS NULL`,
    )
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

export interface RegisterUsedCouponDto {
  billingOrganizationId: string;
  billingCouponId: string;
}

export async function registerUsedCoupon(context: RetrySerializeContext, dto: RegisterUsedCouponDto): Promise<void> {
  const { manager } = context;
  const { billingOrganizationId, billingCouponId } = dto;
  const created = manager.getRepository(BillingOrganizationUsedBillingCoupon).create({
    billingOrganizationId,
    billingCouponId,
  });
  await manager.getRepository(BillingOrganizationUsedBillingCoupon).save(created);
}
