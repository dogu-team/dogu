import {
  BillingMethodNiceProp,
  BillingResultCode,
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
): Promise<BillingMethodNice> {
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
      subscribeRegistResponse: subscribeRegistResponse as unknown as Record<string, unknown>,
      subscribeRegistAt: new Date(),
      expirationYear,
      expirationMonth,
    });
  }

  const saved = await manager.getRepository(BillingMethodNice).save(billingMethodNice);
  return saved;
}

export interface CreateNicePurchaseOptions {
  billingMethodNiceId: string;
  amount: number;
  goodsName: string;
}

export interface CreateNicePurchaseResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateNicePurchaseResultSuccess {
  ok: true;
  response: NiceSubscribePaymentsResponse;
}

export type CreateNicePurchaseResult = CreateNicePurchaseResultFailure | CreateNicePurchaseResultSuccess;

export async function createPurchase(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: CreateNicePurchaseOptions,
): Promise<CreateNicePurchaseResult> {
  const { logger, manager, registerOnAfterRollback } = context;
  const { billingMethodNiceId, amount, goodsName } = options;
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
  return {
    ok: true,
    response,
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

  const rv = await createOrUpdateMethodNice(context, billingMethodNiceCaller, {
    billingOrganizationId: billingOrganization.billingOrganizationId,
    subscribeRegist: {
      registerCard,
    },
  });

  return {
    ok: true,
    resultCode: resultCode('ok'),
    method: rv,
  };
}
