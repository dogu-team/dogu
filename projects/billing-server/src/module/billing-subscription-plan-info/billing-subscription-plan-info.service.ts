import { UpdateBillingSubscriptionPlanInfoDto } from '@dogu-private/console';
import { assertUnreachable, stringify } from '@dogu-tech/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { retrySerialize } from '../../db/utils';
import { parseBillingSubscriptionPlanData } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingSubscriptionPlanInfoService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId: string): Promise<BillingSubscriptionPlanInfo> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
      });
      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }
      return found;
    });
  }

  async updateBillingSubscriptionPlanInfo(billingSubscriptionPlanInfoId: string, dto: UpdateBillingSubscriptionPlanInfoDto): Promise<BillingSubscriptionPlanInfo> {
    return await retrySerialize(this.logger, this.dataSource, async (context) => {
      const { manager } = context;
      const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
        where: { billingSubscriptionPlanInfoId },
      });

      if (!found) {
        throw new NotFoundException(`BillingSubscriptionPlanInfo not found by id ${billingSubscriptionPlanInfoId}`);
      }

      switch (dto.state) {
        case 'unsubscribe-requested':
          {
            if (found.state === 'unsubscribed') {
              throw new BadRequestException(`already unsubscribed`);
            }

            found.state = dto.state;
            const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
            return saved;
          }
          break;
        case 'change-option-requested':
          {
            if (dto.changeRequestedOption === undefined) {
              throw new BadRequestException(`changeRequestedOption is required`);
            }

            const parseResult = await parseBillingSubscriptionPlanData(context, {
              billingOrganizationId: found.billingOrganizationId,
              type: found.type,
              category: found.category,
              option: dto.changeRequestedOption,
              currency: found.currency,
              period: found.period,
            });
            if (!parseResult.ok) {
              throw new BadRequestException(`parseBillingSubscriptionPlanData failed: ${stringify(parseResult.resultCode)}`);
            }

            found.state = dto.state;
            found.changeRequestedOption = dto.changeRequestedOption;
            const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
            return saved;
          }
          break;
        case 'change-period-requested':
          {
            if (dto.changeRequestedPeriod === undefined) {
              throw new BadRequestException(`changeRequestedPeriod is required`);
            }

            const parseResult = await parseBillingSubscriptionPlanData(context, {
              billingOrganizationId: found.billingOrganizationId,
              type: found.type,
              category: found.category,
              option: found.option,
              currency: found.currency,
              period: dto.changeRequestedPeriod,
            });
            if (!parseResult.ok) {
              throw new BadRequestException(`parseBillingSubscriptionPlanData failed: ${stringify(parseResult.resultCode)}`);
            }

            found.state = dto.state;
            found.changeRequestedPeriod = dto.changeRequestedPeriod;
            const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
            return saved;
          }
          break;
        case 'change-option-and-period-requested':
          {
            if (dto.changeRequestedOption === undefined) {
              throw new BadRequestException(`changeRequestedOption is required`);
            }

            if (dto.changeRequestedPeriod === undefined) {
              throw new BadRequestException(`changeRequestedPeriod is required`);
            }

            const parseResult = await parseBillingSubscriptionPlanData(context, {
              billingOrganizationId: found.billingOrganizationId,
              type: found.type,
              category: found.category,
              option: dto.changeRequestedOption,
              currency: found.currency,
              period: dto.changeRequestedPeriod,
            });
            if (!parseResult.ok) {
              throw new BadRequestException(`parseBillingSubscriptionPlanData failed: ${stringify(parseResult.resultCode)}`);
            }

            found.state = dto.state;
            found.changeRequestedOption = dto.changeRequestedOption;
            found.changeRequestedPeriod = dto.changeRequestedPeriod;
            const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
            return saved;
          }
          break;
        default: {
          assertUnreachable(dto.state);
        }
      }
    });
  }
}
