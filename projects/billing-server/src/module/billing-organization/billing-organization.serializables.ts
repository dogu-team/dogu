import { CreateBillingOrganizationDto, FindBillingOrganizationOptions } from '@dogu-private/console';
import { ConflictException } from '@nestjs/common';
import { v4 } from 'uuid';
import { BillingOrganizationUsedBillingCoupon } from '../../db/entity/billing-organization-used-billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';

export async function findBillingOrganization(context: RetryTransactionContext, options: FindBillingOrganizationOptions): Promise<BillingOrganization | null> {
  const { manager } = context;
  const { organizationId } = options;
  return await manager.getRepository(BillingOrganization).findOne({
    where: { organizationId },
    relations: {
      billingMethodNice: true,
      billingMethodPaddle: true,
      billingPlanInfos: {
        billingCoupon: true,
      },
    },
  });
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
