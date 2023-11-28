import { BillingOrganizationProp, BillingPlanInfoProp, CreateBillingOrganizationDto, FindBillingOrganizationDto } from '@dogu-private/console';
import { ConflictException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingMethodPaddle } from '../../db/entity/billing-method-paddle.entity';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';

export async function findBillingOrganizationWithPlans(context: RetryTransactionContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingPlanInfos}`, BillingPlanInfo.name)
    .leftJoinAndSelect(`${BillingPlanInfo.name}.${BillingPlanInfoProp.billingCoupon}`, BillingCoupon.name)
    .where({ organizationId })
    .getOne();
}

export async function findBillingOrganizationWithMethod(context: RetryTransactionContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager.getRepository(BillingOrganization).findOne({
    where: { organizationId },
    relations: {
      billingMethodNice: true,
      billingMethodPaddle: true,
    },
  });
}

export async function findBillingOrganizationWithMethodAndPlans(context: RetryTransactionContext, dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .getRepository(BillingOrganization)
    .createQueryBuilder(BillingOrganization.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodPaddle}`, BillingMethodPaddle.name)
    .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingPlanInfos}`, BillingPlanInfo.name)
    .leftJoinAndSelect(`${BillingPlanInfo.name}.${BillingPlanInfoProp.billingCoupon}`, BillingCoupon.name)
    .where({ organizationId })
    .getOne();
}

export async function createBillingOrganization(context: RetryTransactionContext, dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
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

export interface RegisterUsedCouponOptions {
  billingOrganizationId: string;
  billingCouponId: string;
}

export async function registerUsedCoupon(context: RetryTransactionContext, options: RegisterUsedCouponOptions): Promise<void> {
  const { manager } = context;
  const { billingOrganizationId, billingCouponId } = options;
  const created = manager.getRepository(BillingOrganizationUsedBillingCoupon).create({
    billingOrganizationId,
    billingCouponId,
  });
  await manager.getRepository(BillingOrganizationUsedBillingCoupon).save(created);
}
