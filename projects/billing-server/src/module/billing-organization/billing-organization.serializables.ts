import { BillingOrganizationProp, BillingSubscriptionPlanProp, CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { ConflictException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function findBillingOrganizationWithSubscriptionPlans(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(
      `${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`,
      BillingSubscriptionPlanInfo.name,
      `${BillingSubscriptionPlanInfo.name}.${BillingSubscriptionPlanProp.unsubscribedAt} IS NULL`,
    )
    .where({ organizationId })
    .getOne();
}

export async function findBillingOrganizationWithMethod(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
    .where({ organizationId })
    .getOne();
}

export async function findBillingOrganizationWithMethodAndSubscriptionPlans(context: RetrySerializeContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
    .leftJoinAndSelect(
      `${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlanInfos}`,
      BillingSubscriptionPlanInfo.name,
      `${BillingSubscriptionPlanInfo.name}.${BillingSubscriptionPlanProp.unsubscribedAt} IS NULL`,
    )
    .where({ organizationId })
    .getOne();
}

export async function createBillingOrganization(context: RetrySerializeContext, dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
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
