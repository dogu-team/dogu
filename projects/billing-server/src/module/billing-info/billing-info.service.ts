import { BillingInfoPropCamel, CreateBillingInfoDto, CreateOrUpdateBillingInfoWithNiceDto, FindBillingInfoDto } from '@dogu-private/console';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { BillingInfo } from '../../db/entity/billing-info.entity';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';
import { retrySerialize } from '../../db/utils';
import { BillingMethodNiceService } from '../billing-method-nice/billing-method-nice.service';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingInfoService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceService: BillingMethodNiceService,
  ) {}

  async findByOrganizationId(dto: FindBillingInfoDto): Promise<BillingInfo | null> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId } = dto;
      const billingInfo = await manager
        .getRepository(BillingInfo)
        .createQueryBuilder(BillingInfo.name)
        .leftJoinAndSelect(`${BillingInfo.name}.${BillingInfoPropCamel.billingMethodNice}`, BillingMethodNice.name)
        .leftJoinAndSelect(`${BillingInfo.name}.${BillingInfoPropCamel.billingSubscriptionPlans}`, BillingSubscriptionPlan.name)
        .where({ organizationId })
        .getOne();
      return billingInfo;
    });
  }

  async create(dto: CreateBillingInfoDto): Promise<BillingInfo> {
    const billingInfo = await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, category } = dto;
      const found = await manager.getRepository(BillingInfo).findOne({ where: { organizationId } });
      if (found) {
        throw new ConflictException(`BillingInfo already exists by organizationId ${organizationId}`);
      }

      const created = manager.getRepository(BillingInfo).create({ billingInfoId: v4(), organizationId, category });
      const saved = await manager.getRepository(BillingInfo).save(created);
      return saved;
    });

    return billingInfo;
  }

  async createOrUpdateWithNice(dto: CreateOrUpdateBillingInfoWithNiceDto): Promise<BillingInfo> {
    const billingInfo = await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, category } = dto;
      const found = await manager.getRepository(BillingInfo).findOne({ where: { organizationId } });
      if (found) {
        return found;
      }

      const created = manager.getRepository(BillingInfo).create({ billingInfoId: v4(), organizationId, category });
      const saved = await manager.getRepository(BillingInfo).save(created);
      return saved;
    });

    const { billingInfoId } = billingInfo;
    const billingMethodNice = await this.billingMethodNiceService.createOrUpdate({ ...dto, billingInfoId });
    return { ...billingInfo, billingMethodNice };
  }
}
