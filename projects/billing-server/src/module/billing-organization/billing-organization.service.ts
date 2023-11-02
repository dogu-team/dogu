import {
  BillingCategory,
  BillingOrganizationProp,
  CreateBillingOrganizationDto,
  CreateOrUpdateBillingOrganizationWithNiceDto,
  FindBillingOrganizationDto,
} from '@dogu-private/console';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { retrySerialize } from '../../db/utils';
import { BillingMethodNiceService } from '../billing-method/billing-method-nice.service';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingOrganizationService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceService: BillingMethodNiceService,
  ) {}

  async find(dto: FindBillingOrganizationDto): Promise<BillingOrganization | null> {
    return await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId } = dto;
      const billingOrganization = await manager
        .getRepository(BillingOrganization)
        .createQueryBuilder(BillingOrganization.name)
        .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingMethodNice}`, BillingMethodNice.name)
        .where({ organizationId })
        .getOne();
      return billingOrganization;
    });
  }

  async create(dto: CreateBillingOrganizationDto): Promise<BillingOrganization> {
    const billingOrganization = await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, category } = dto;
      const found = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
      if (found) {
        throw new ConflictException(`BillingOrganization already exists by organizationId ${organizationId}`);
      }

      const created = manager.getRepository(BillingOrganization).create({ billingOrganizationId: v4(), organizationId, category });
      const saved = await manager.getRepository(BillingOrganization).save(created);
      return saved;
    });

    return billingOrganization;
  }

  async createOrUpdateWithNice(dto: CreateOrUpdateBillingOrganizationWithNiceDto): Promise<BillingOrganization> {
    const billingOrganization = await retrySerialize(this.logger, this.dataSource, async (manager) => {
      const { organizationId, category } = dto;
      const found = await manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
      if (found) {
        return found;
      }

      const created = manager.getRepository(BillingOrganization).create({ billingOrganizationId: v4(), organizationId, category });
      const saved = await manager.getRepository(BillingOrganization).save(created);
      return saved;
    });

    const { billingOrganizationId } = billingOrganization;
    const billingMethodNice = await this.billingMethodNiceService.createOrUpdate({ ...dto, billingOrganizationId });
    return { ...billingOrganization, billingMethodNice };
  }

  static async findWithSubscriptionPlans(manager: EntityManager, organizationId: string, category: BillingCategory): Promise<BillingOrganization | null> {
    return await manager
      .getRepository(BillingOrganization)
      .createQueryBuilder(BillingOrganization.name)
      .leftJoinAndSelect(`${BillingOrganization.name}.${BillingOrganizationProp.billingSubscriptionPlans}`, BillingOrganizationProp.billingSubscriptionPlans)
      .where({ organizationId, category })
      .getOne();
  }
}
