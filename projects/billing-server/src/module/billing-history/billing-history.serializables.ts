import { BillingHistoryProp, BillingOrganizationProp, GetBillingHistoriesDto } from '@dogu-private/console';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function getHistories(context: RetrySerializeContext, dto: GetBillingHistoriesDto): Promise<BillingHistory[]> {
  const { manager } = context;
  const { organizationId } = dto;
  return await manager
    .createQueryBuilder(BillingHistory, BillingHistory.name)
    .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingOrganization}`, BillingOrganization.name)
    .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId })
    .getMany();
}
