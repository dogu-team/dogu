import { BillingInfoAndBillingPromotionPropCamel, BillingInfoPropCamel, BillingPromotionPropCamel, GetAvailableBillingPromotionsByOrganizationIdDto } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingInfoAndBillingPromotion } from '../../db/entity/billing-info-and-billing-promotion.entity';
import { BillingInfo } from '../../db/entity/billing-info.entity';
import { BillingPromotion } from '../../db/entity/billing-promotion.entity';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingPromotionService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getAvailableBillingPromotionsByOrganizationId(dto: GetAvailableBillingPromotionsByOrganizationIdDto): Promise<BillingPromotion[]> {
    const { organizationId } = dto;
    const billingPromitions = await this.dataSource.manager
      .getRepository(BillingPromotion)
      .createQueryBuilder(BillingPromotion.name)
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select(`${BillingInfoAndBillingPromotion.name}.${BillingInfoAndBillingPromotionPropCamel.billingPromotionId}`)
          .from(BillingInfoAndBillingPromotion, BillingInfoAndBillingPromotion.name)
          .innerJoin(
            BillingInfo,
            BillingInfo.name,
            `${BillingInfo.name}.${BillingInfoPropCamel.billingInfoId} = ${BillingInfoAndBillingPromotion.name}.${BillingInfoAndBillingPromotionPropCamel.billingInfoId}`,
          )
          .where(`${BillingInfo.name}.${BillingInfoPropCamel.organizationId} = :organizationId`, { organizationId })
          .getQuery();
        return `${BillingPromotion.name}.${BillingPromotionPropCamel.billingPromitionId} NOT IN ${subQuery}`;
      })
      .getMany();
    return billingPromitions;
  }
}
