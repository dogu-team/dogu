import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { RetryTransactionContext } from '../../db/utils';
import { FindPlanSourceOptions } from './billing-plan-source.service';

export async function findBillingPlanSource(context: RetryTransactionContext, options: FindPlanSourceOptions): Promise<BillingPlanSource | null> {
  const { billingPlanSourceId } = options;
  const { manager } = context;
  return await manager.getRepository(BillingPlanSource).findOne({
    where: {
      billingPlanSourceId,
    },
  });
}
