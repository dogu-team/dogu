import { BillingMethodNiceProp, BillingPeriod, BillingResultCode, CreateOrUpdateMethodNiceDto, NiceSubscribePaymentsResponse, resultCode } from '@dogu-private/console';
import { assertUnreachable, errorify } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

export async function createOrUpdateMethodNice(
  context: RetrySerializeContext, //
  billingMethodNiceCaller: BillingMethodNiceCaller,
  dto: CreateOrUpdateMethodNiceDto,
): Promise<BillingMethodNice> {
  const { logger, manager, registerOnAfterRollback } = context;
  const { billingOrganizationId, subscribeRegist } = dto;
  const { registerCard } = subscribeRegist;
  const { cardNumber } = registerCard;

  let bid: string | null = null;
  const subscribeExpire = async (): Promise<void> => {
    if (bid) {
      try {
        await billingMethodNiceCaller.subscribeExpire({ bid });
      } catch (e) {
        logger.error('BillingMethodNiceService.createOrUpdate.subscribeExpire failed', { bid, error: errorify(e) });
      } finally {
        bid = null;
      }
    }
  };
  registerOnAfterRollback(subscribeExpire);

  const cardNumberLast4Digits = cardNumber.slice(-4);
  let billingMethodNice = await manager.getRepository(BillingMethodNice).findOne({ where: { billingOrganizationId } });
  bid = billingMethodNice?.bid ?? null;
  await subscribeExpire();

  const subscribeRegistResponse = await billingMethodNiceCaller.subscribeRegist(subscribeRegist);
  const { cardCode, cardName } = subscribeRegistResponse;
  bid = subscribeRegistResponse.bid;

  if (billingMethodNice) {
    billingMethodNice.bid = bid;
    billingMethodNice.cardCode = cardCode;
    billingMethodNice.cardName = cardName;
    billingMethodNice.cardNumberLast4Digits = cardNumberLast4Digits;
    billingMethodNice.subscribeRegistResponse = subscribeRegistResponse as unknown as Record<string, unknown>;
    billingMethodNice.subscribeRegistAt = new Date();
  } else {
    billingMethodNice = manager.getRepository(BillingMethodNice).create({
      billingMethodNiceId: v4(),
      billingOrganizationId,
      bid,
      cardCode,
      cardName,
      cardNumberLast4Digits,
      subscribeRegistResponse: subscribeRegistResponse as unknown as Record<string, unknown>,
      subscribeRegistAt: new Date(),
    });
  }

  const saved = await manager.getRepository(BillingMethodNice).save(billingMethodNice);
  return saved;
}

export interface CreateNicePurchaseDto {
  billingMethodNiceId: string;
  period: BillingPeriod;
  amount: number;
  goodsName: string;
}

export interface CreateNicePurchaseResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateNicePurchaseResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  response: NiceSubscribePaymentsResponse;
}

export type CreateNicePurchaseResult = CreateNicePurchaseResultFailure | CreateNicePurchaseResultSuccess;

export async function createPurchase(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  dto: CreateNicePurchaseDto,
): Promise<CreateNicePurchaseResult> {
  const { logger, manager, registerOnAfterRollback } = context;
  const { billingMethodNiceId, period, amount, goodsName } = dto;
  const billingMethodNice = await manager.getRepository(BillingMethodNice).findOne({
    where: {
      billingMethodNiceId,
    },
    relations: [BillingMethodNiceProp.billingOrganization],
  });
  if (!billingMethodNice) {
    throw new Error(`billingMethodNice not found: ${billingMethodNiceId}`);
  }

  const { bid } = billingMethodNice;
  if (!bid) {
    throw new Error(`bid not found: ${billingMethodNiceId}`);
  }

  const response = await billingMethodNiceCaller.subscribePayments({
    bid,
    amount,
    goodsName,
  });
  registerOnAfterRollback(async () => {
    // TODO: cancel payment
  });
  logger.info('BillingMethodNiceService.subscribePayments', { response });

  const billingOrganization = billingMethodNice.billingOrganization;
  if (!billingOrganization) {
    throw new Error(`billingOrganization not found: ${billingMethodNiceId}`);
  }

  switch (period) {
    case 'monthly': {
      billingOrganization.lastMonthlyPurchasedAt = new Date();
      break;
    }
    case 'yearly': {
      billingOrganization.lastYearlyPurchasedAt = new Date();
      break;
    }
    default:
      assertUnreachable(period);
  }

  const saved = await manager.getRepository(BillingOrganization).save({
    ...billingOrganization,
  });
  registerOnAfterRollback(async () => {
    const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
      where: {
        billingOrganizationId: saved.billingOrganizationId,
      },
    });
    if (!billingOrganization) {
      throw new Error(`billingOrganization not found: ${saved.billingOrganizationId}`);
    }

    switch (period) {
      case 'monthly': {
        billingOrganization.lastMonthlyPurchasedAt = null;
        break;
      }
      case 'yearly': {
        billingOrganization.lastYearlyPurchasedAt = null;
        break;
      }
      default:
        assertUnreachable(period);
    }
  });

  return {
    ok: true,
    resultCode: resultCode('ok'),
    response,
  };
}
