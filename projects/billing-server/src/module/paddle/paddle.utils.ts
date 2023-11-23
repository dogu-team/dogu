import { DoguLogger } from '../logger/logger';
import { Paddle } from './paddle.types';

export function matchProduct(logger: DoguLogger, productMatch: Paddle.ProductMatch, product: Paddle.ProductWithPrices): boolean {
  if (product.status !== 'active') {
    return false;
  }

  if (productMatch.subscriptionPlanType !== product.custom_data?.subscriptionPlanType) {
    return false;
  }

  if (productMatch.category !== product.custom_data?.category) {
    return false;
  }

  return true;
}

export function matchPrice(logger: DoguLogger, priceMatch: Paddle.PriceMatch, price: Paddle.Price): boolean {
  if (price.status !== 'active') {
    return false;
  }

  if (priceMatch.option !== price.custom_data?.option) {
    return false;
  }

  if (priceMatch.period !== price.custom_data?.period) {
    return false;
  }

  if (priceMatch.currency !== price.custom_data?.currency) {
    return false;
  }

  if (priceMatch.amount.toCents().toString() !== price.custom_data.amountInCents) {
    return false;
  }

  if (priceMatch.category !== price.custom_data?.category) {
    return false;
  }

  if (priceMatch.subscriptionPlanType !== price.custom_data?.subscriptionPlanType) {
    return false;
  }

  if (priceMatch.billingOrganizationId !== price.custom_data?.billingOrganizationId) {
    return false;
  }

  return true;
}

export function matchProductByPrice(productMatch: Paddle.ProductMatch, priceMatch: Paddle.PriceMatch): boolean {
  if (productMatch.subscriptionPlanType !== priceMatch.subscriptionPlanType) {
    return false;
  }

  if (productMatch.category !== priceMatch.category) {
    return false;
  }

  return true;
}

export function findPrice(logger: DoguLogger, priceFind: Paddle.PriceFind, price: Paddle.Price): boolean {
  if (priceFind.option !== price.custom_data?.option) {
    return false;
  }

  if (priceFind.period !== price.custom_data?.period) {
    return false;
  }

  if (priceFind.currency !== price.custom_data?.currency) {
    return false;
  }

  if (priceFind.category !== price.custom_data?.category) {
    return false;
  }

  if (priceFind.subscriptionPlanType !== price.custom_data?.subscriptionPlanType) {
    return false;
  }

  if (priceFind.billingOrganizationId !== price.custom_data?.billingOrganizationId) {
    return false;
  }

  return true;
}
