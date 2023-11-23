import { BillingResult, FindPaddlePriceDto, FindPaddlePriceResponse, resultCode } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { DoguLogger } from '../logger/logger';
import { ListProductsResult, PaddleCaller } from './paddle.caller';
import { Paddle } from './paddle.types';
import { findPrice, matchProduct } from './paddle.utils';

@Injectable()
export class PaddleService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly paddleCaller: PaddleCaller,
  ) {}

  async findPrice(dto: FindPaddlePriceDto): Promise<FindPaddlePriceResponse> {
    const { organizationId } = dto;
    const billingOrganization = await this.dataSource.manager.getRepository(BillingOrganization).findOne({ where: { organizationId } });
    if (!billingOrganization) {
      return {
        ok: false,
        resultCode: resultCode('organization-not-found', {
          organizationId,
        }),
      };
    }
    const { billingOrganizationId } = billingOrganization;
    const priceFindWithoutOrg: Paddle.PriceFind = {
      category: dto.category,
      subscriptionPlanType: dto.subscriptionPlanType,
      option: dto.option.toString(),
      period: dto.period,
      currency: dto.currency,
      billingOrganizationId: 'none',
    };
    const priceFindWithOrg: Paddle.PriceFind = {
      category: dto.category,
      subscriptionPlanType: dto.subscriptionPlanType,
      option: dto.option.toString(),
      period: dto.period,
      currency: dto.currency,
      billingOrganizationId,
    };

    let nextAfter: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result: BillingResult<ListProductsResult> = await this.paddleCaller.listProducts(nextAfter ?? undefined);
      if (!result.ok) {
        return result;
      }

      const { products } = result.value;
      const product = products.find((product) => matchProduct(this.logger, dto, product));
      if (product) {
        const priceWithoutOrg = product.prices?.find((price) => findPrice(this.logger, priceFindWithoutOrg, price));
        if (priceWithoutOrg) {
          if (!priceWithoutOrg.id) {
            return {
              ok: false,
              resultCode: resultCode('method-paddle-price-id-not-found', {
                category: dto.category,
                subscriptionPlanType: dto.subscriptionPlanType,
                option: dto.option.toString(),
                period: dto.period,
                currency: dto.currency,
                billingOrganizationId: 'none',
              }),
            };
          }

          return {
            ok: true,
            value: {
              priceId: priceWithoutOrg.id,
            },
          };
        }

        const priceWithOrg = product.prices?.find((price) => findPrice(this.logger, priceFindWithOrg, price));
        if (priceWithOrg) {
          if (!priceWithOrg.id) {
            return {
              ok: false,
              resultCode: resultCode('method-paddle-price-id-not-found', {
                category: dto.category,
                subscriptionPlanType: dto.subscriptionPlanType,
                option: dto.option.toString(),
                period: dto.period,
                currency: dto.currency,
                billingOrganizationId,
              }),
            };
          }

          return {
            ok: true,
            value: {
              priceId: priceWithOrg.id,
            },
          };
        }
      }

      nextAfter = result.value.nextAfter;
      hasMore = result.value.hasMore;
    }

    return {
      ok: false,
      resultCode: resultCode('method-paddle-price-not-found', {
        category: dto.category,
        subscriptionPlanType: dto.subscriptionPlanType,
        option: dto.option.toString(),
        period: dto.period,
        currency: dto.currency,
        organizationId,
      }),
    };
  }
}
