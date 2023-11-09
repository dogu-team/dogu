import {
  BillingMethodNiceProp,
  BillingResult,
  CreateOrUpdateMethodNiceDto,
  NiceSubscribePaymentsResponse,
  resultCode,
  UpdateBillingMethodResponse,
  UpdateMethodNiceDto,
} from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { RetrySerializeContext } from '../../db/utils';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

export async function createOrUpdateMethodNice(
  context: RetrySerializeContext, //
  billingMethodNiceCaller: BillingMethodNiceCaller,
  dto: CreateOrUpdateMethodNiceDto,
): Promise<BillingResult<BillingMethodNice>> {
  const { logger, manager, registerOnAfterRollback } = context;
  const { billingOrganizationId, subscribeRegist } = dto;
  const { registerCard } = subscribeRegist;
  const { cardNumber, expirationYear, expirationMonth } = registerCard;

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

  const subscribeRegistResult = await billingMethodNiceCaller.subscribeRegist(subscribeRegist);
  if (!subscribeRegistResult.ok) {
    return {
      ok: false,
      resultCode: subscribeRegistResult.resultCode,
    };
  }

  const { value } = subscribeRegistResult;
  const { cardCode, cardName } = value;
  bid = value.bid;

  if (billingMethodNice) {
    billingMethodNice.bid = bid;
    billingMethodNice.cardCode = cardCode;
    billingMethodNice.cardName = cardName;
    billingMethodNice.cardNumberLast4Digits = cardNumberLast4Digits;
    billingMethodNice.subscribeRegistResponse = value as unknown as Record<string, unknown>;
    billingMethodNice.subscribeRegistAt = new Date();
    billingMethodNice.expirationYear = expirationYear;
    billingMethodNice.expirationMonth = expirationMonth;
  } else {
    billingMethodNice = manager.getRepository(BillingMethodNice).create({
      billingMethodNiceId: v4(),
      billingOrganizationId,
      bid,
      cardCode,
      cardName,
      cardNumberLast4Digits,
      subscribeRegistResponse: value as unknown as Record<string, unknown>,
      subscribeRegistAt: new Date(),
      expirationYear,
      expirationMonth,
    });
  }

  const saved = await manager.getRepository(BillingMethodNice).save(billingMethodNice);
  return {
    ok: true,
    value: saved,
  };
}

export interface CreateNicePurchaseOptions {
  billingMethodNiceId: string;
  amount: number;
  goodsName: string;
}

export async function createPurchase(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: CreateNicePurchaseOptions,
): Promise<BillingResult<NiceSubscribePaymentsResponse>> {
  const { manager, registerOnAfterRollback } = context;
  const { billingMethodNiceId, amount, goodsName } = options;
  const billingMethodNice = await manager.getRepository(BillingMethodNice).findOne({
    where: {
      billingMethodNiceId,
    },
    relations: [BillingMethodNiceProp.billingOrganization],
  });
  if (!billingMethodNice) {
    return {
      ok: false,
      resultCode: resultCode('method-nice-not-found', {
        billingMethodNiceId,
      }),
    };
  }

  const { bid } = billingMethodNice;
  if (!bid) {
    return {
      ok: false,
      resultCode: resultCode('method-nice-bid-not-found', {
        billingMethodNiceId,
      }),
    };
  }

  const subscribePaymentsResult = await billingMethodNiceCaller.subscribePayments({
    bid,
    amount,
    goodsName,
  });
  if (!subscribePaymentsResult.ok) {
    return {
      ok: false,
      resultCode: resultCode('method-nice-subscribe-payments-failed', {
        billingMethodNiceId,
        bid,
        amount,
        goodsName,
      }),
    };
  }
  const { value } = subscribePaymentsResult;

  registerOnAfterRollback(async () => {
    await billingMethodNiceCaller.paymentsCancel({
      tid: value.tid,
      reason: `rollback tid: ${value.tid}`,
    });
  });

  return {
    ok: true,
    value,
  };
}

export async function updateBillingMethod(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  dto: UpdateMethodNiceDto,
): Promise<UpdateBillingMethodResponse> {
  const { manager } = context;
  const { registerCard } = dto;

  const billingOrganization = await manager.getRepository(BillingOrganization).findOne({
    where: {
      organizationId: dto.organizationId,
    },
  });

  if (!billingOrganization) {
    return {
      ok: false,
      resultCode: resultCode('organization-not-found', {
        organizationId: dto.organizationId,
      }),
    };
  }

  const createOrUpdateMethodNiceResult = await createOrUpdateMethodNice(context, billingMethodNiceCaller, {
    billingOrganizationId: billingOrganization.billingOrganizationId,
    subscribeRegist: {
      registerCard,
    },
  });
  if (!createOrUpdateMethodNiceResult.ok) {
    return {
      ok: false,
      resultCode: createOrUpdateMethodNiceResult.resultCode,
    };
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
    method: createOrUpdateMethodNiceResult.value,
  };
}
