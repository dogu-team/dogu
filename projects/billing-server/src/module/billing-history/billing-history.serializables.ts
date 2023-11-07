import { BillingHistoryProp, BillingOrganizationProp, GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';

export async function getHistories(context: RetrySerializeContext, dto: GetBillingHistoriesDto): Promise<PageBase<BillingHistory>> {
  const { manager } = context;
  const { organizationId, page, offset } = dto;
  const [histories, totalCount] = await manager
    .createQueryBuilder(BillingHistory, BillingHistory.name)
    .innerJoinAndSelect(`${BillingHistory.name}.${BillingHistoryProp.billingOrganization}`, BillingOrganization.name)
    .where(`${BillingOrganization.name}.${BillingOrganizationProp.organizationId} = :organizationId`, { organizationId })
    .skip((page - 1) * offset)
    .take(offset)
    .getManyAndCount();

  return {
    page,
    offset,
    totalCount,
    totalPage: Math.ceil(totalCount / offset),
    items: histories,
  };
}
