import { BillingHistoryProp, BillingOrganizationProp, GetBillingHistoriesDto } from '@dogu-private/console';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function getHistories(context: RetrySerializeContext, dto: GetBillingHistoriesDto): Promise<BillingHistory[]> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .createQueryBuilder(BillingHistory, BillingHistory.name)
    .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingOrganization}`, BillingHistoryProp.billingOrganization)
    .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingSubscriptionPlans}`, BillingHistoryProp.billingSubscriptionPlans)
    .where(`${BillingHistoryProp.billingOrganization}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId })
    .getMany();
}
