import { BadRequestException } from '@nestjs/common';
import { Paddle } from './paddle.types';

export function matchProduct(match: Paddle.ProductMatch, product: Paddle.ProductWithPrices): boolean {
  if (product.status === 'archived') {
    return false;
  }

  if (match.category !== product.custom_data?.category) {
    return false;
  }

  if (match.type !== product.custom_data?.type) {
    return false;
  }

  return true;
}

export function matchPrice(match: Paddle.PriceMatch, price: Paddle.Price): boolean {
  if (price.status === 'archived') {
    return false;
  }

  if (match.billingPlanSourceId !== price.custom_data?.billingPlanSourceId) {
    return false;
  }

  return true;
}

export function matchDiscount(match: Paddle.DiscountMatch, discount: Paddle.Discount): boolean {
  if (discount.status === 'archived') {
    return false;
  }

  if (match.billingCouponId !== discount.custom_data?.billingCouponId) {
    return false;
  }

  return true;
}

export function matchDiscountCode(match: Paddle.DiscountCodeMatch, discount: Paddle.Discount): boolean {
  if (match.code !== discount.code) {
    return false;
  }

  return true;
}

const paddleDiscountPattern = /^[a-zA-Z0-9]{1,16}$/;

export function validatePaddleDiscountPattern(couponCode: string): void {
  const match = couponCode.match(paddleDiscountPattern);
  if (!match) {
    throw new BadRequestException({
      reason: `Only ${paddleDiscountPattern} is allowed.`,
      couponCode,
    });
  }
}
