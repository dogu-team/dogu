import { CreateOrUpdateMethodNiceDto } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingMethodNice } from '../../db/entity/billing-method-nice.entity';
import { RetrySerializeContext } from '../../db/utils';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

export async function createOrUpdate(
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
