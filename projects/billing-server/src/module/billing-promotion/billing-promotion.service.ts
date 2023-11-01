import { BillingOrganizationAndBillingPromotionPropCamel, BillingOrganizationPropCamel, BillingPromotionPropCamel, GetAvailableBillingPromotionsDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganizationAndBillingPromotion } from '../../db/entity/billing-organization-and-billing-promotion.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPromotion } from '../../db/entity/billing-promotion.entity';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingPromotionService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getAvailableBillingPromotions(dto: GetAvailableBillingPromotionsDto): Promise<BillingPromotion[]> {
    const { organizationId } = dto;
    const billingPromitions = await this.dataSource.manager
      .getRepository(BillingPromotion)
      .createQueryBuilder(BillingPromotion.name)
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select(`${BillingOrganizationAndBillingPromotion.name}.${BillingOrganizationAndBillingPromotionPropCamel.billingPromotionId}`)
          .from(BillingOrganizationAndBillingPromotion, BillingOrganizationAndBillingPromotion.name)
          .innerJoin(
            BillingOrganization,
            BillingOrganization.name,
            `${BillingOrganization.name}.${BillingOrganizationPropCamel.billingOrganizationId} = ${BillingOrganizationAndBillingPromotion.name}.${BillingOrganizationAndBillingPromotionPropCamel.billingOrganizationId}`,
          )
          .where(`${BillingOrganization.name}.${BillingOrganizationPropCamel.organizationId} = :organizationId`, { organizationId })
          .getQuery();
        return `${BillingPromotion.name}.${BillingPromotionPropCamel.billingPromitionId} NOT IN ${subQuery}`;
      })
      .getMany();
    return billingPromitions;
  }
}
