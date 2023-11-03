import { CallBillingApiResponse, ValidateBillingCouponDto } from '@dogu-private/console';

import api from '.';

export const validateBillingCoupon = async (dto: ValidateBillingCouponDto): Promise<CallBillingApiResponse> => {
  const { organizationId, code } = dto;
  const { data } = await api.get<CallBillingApiResponse>(
    `/billing/coupons/validate?organizationId=${organizationId}&code=${code}`,
  );
  return data;
};
