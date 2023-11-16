import {
  BillingPromotionCouponResponse,
  BillingSubscriptionPlanInfoResponse,
  CallBillingApiResponse,
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  GetAvailableBillingCouponsDto,
  UpdateBillingMethodResponse,
  UpdateBillingSubscriptionPlanInfoStateDto,
  UpdateMethodNiceDto,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import useSWR, { KeyedMutator } from 'swr';

import api, { swrAuthFetcher } from '.';
import useLicenseStore from '../stores/license';
import { buildQueryPraramsByObject } from '../utils/query';

export const validateBillingCoupon = async (
  dto: ValidateBillingCouponDto,
): Promise<CallBillingApiResponse<ValidateBillingCouponResponse>> => {
  const query = buildQueryPraramsByObject(dto);
  const { data } = await api.get<CallBillingApiResponse<ValidateBillingCouponResponse>>(
    `/billing/coupons/validate?${query}`,
  );
  return data;
};

export const findAvailablePromotions = async (
  dto: Omit<GetAvailableBillingCouponsDto, 'type'>,
): Promise<CallBillingApiResponse<BillingPromotionCouponResponse[]>> => {
  const query = buildQueryPraramsByObject(dto);
  const { data } = await api.get<CallBillingApiResponse<BillingPromotionCouponResponse[]>>(
    `/billing/promotions?${query}`,
  );
  return data;
};

export const purchasePlanWithExistingCard = async (
  dto: CreatePurchaseSubscriptionDto,
): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionResponse>> => {
  const { data } = await api.post<CallBillingApiResponse<CreatePurchaseSubscriptionResponse>>('/billing/purchase', dto);
  return data;
};

export const purchasePlanWithNewCard = async (
  dto: CreatePurchaseSubscriptionWithNewCardDto,
): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>> => {
  const { data } = await api.post<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>>(
    '/billing/purchase/new-card',
    dto,
  );
  return data;
};

export const updatePaymentMethod = async (
  dto: UpdateMethodNiceDto,
): Promise<CallBillingApiResponse<UpdateBillingMethodResponse>> => {
  const { data } = await api.put<CallBillingApiResponse<UpdateBillingMethodResponse>>('/billing/methods', dto);
  return data;
};

export const unsubscribePlan = async (
  planInfoId: string,
  dto: UpdateBillingSubscriptionPlanInfoStateDto,
): Promise<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>> => {
  const { data } = await api.patch<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>>(
    `/billing/subscription-plan-infos/${planInfoId}/unsubscribe`,
    dto,
  );
  return data;
};

export const cancelUnsubscribePlan = async (
  planInfoId: string,
  dto: UpdateBillingSubscriptionPlanInfoStateDto,
): Promise<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>> => {
  const { data } = await api.patch<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>>(
    `/billing/subscription-plan-infos/${planInfoId}/cancel-unsubscribe`,
    dto,
  );
  return data;
};

export const cancelChangePlanOptionOrPeriod = async (
  planInfoId: string,
  dto: UpdateBillingSubscriptionPlanInfoStateDto,
): Promise<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>> => {
  const { data } = await api.patch<CallBillingApiResponse<BillingSubscriptionPlanInfoResponse>>(
    `/billing/subscription-plan-infos/${planInfoId}/cancel-change-option-or-period`,
    dto,
  );
  return data;
};

export const usePromotionCouponSWR = (
  needFetch: boolean,
  dto: Omit<GetAvailableBillingCouponsDto, 'type' | 'organizationId'>,
): {
  data: BillingPromotionCouponResponse[];
  mutate: KeyedMutator<CallBillingApiResponse<BillingPromotionCouponResponse[]>>;
  isLoading: boolean;
} => {
  const license = useLicenseStore((state) => state.license);
  const { data, mutate, error, isLoading } = useSWR<CallBillingApiResponse<BillingPromotionCouponResponse[]>>(
    needFetch &&
      `/billing/promotions?${buildQueryPraramsByObject(
        { ...dto, organizationId: license?.organizationId },
        { removeFalsy: true },
      )}`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  const hasUsingPlan = !!license?.billingOrganization.billingSubscriptionPlanInfos.find(
    (info) => info.type === dto.subscriptionPlanType && info.state !== 'unsubscribed',
  );

  if (!needFetch) {
    return { data: [], mutate, isLoading };
  }

  if (data?.errorMessage || !data?.body?.length) {
    return { data: [], mutate, isLoading };
  }

  if (!dto.subscriptionPlanType) {
    return { data: [], mutate, isLoading };
  }

  if (hasUsingPlan) {
    return { data: [], mutate, isLoading };
  }

  if (error) {
    return { data: [], mutate, isLoading };
  }

  return { data: data.body, mutate, isLoading };
};
