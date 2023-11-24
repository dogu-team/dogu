import { IsFilledString, IsOptionalObject, Method } from '@dogu-tech/common';
import { IsIn } from 'class-validator';

export const BillingCategory = ['cloud', 'self-hosted'] as const;
export type BillingCategory = (typeof BillingCategory)[number];

export const BillingCurrency = ['KRW', 'USD'] as const;
export type BillingCurrency = (typeof BillingCurrency)[number];

export class BillingUsdAmount {
  static fromDollars(dollars: number): BillingUsdAmount {
    const cents = dollars * BillingUsdAmount.DollarsToCents;
    const centsFloored = Math.floor(cents);
    return new BillingUsdAmount(centsFloored);
  }

  static fromCents(cents: number): BillingUsdAmount {
    const centsFloored = Math.floor(cents);
    return new BillingUsdAmount(centsFloored);
  }

  private static readonly DollarsToCents = 100;

  private constructor(readonly centsFloored: number) {}

  /**
   * @example '29.00'
   */
  toDollarsString(): string {
    const dollars = this.centsFloored / BillingUsdAmount.DollarsToCents;
    const fixed = dollars.toFixed(2);
    return fixed;
  }

  /**
   * @example 29.00
   */
  toDollars(): number {
    const dollarsString = this.toDollarsString();
    const numbered = parseFloat(dollarsString);
    return numbered;
  }

  /**
   * @example 2900
   */
  toCents(): number {
    return this.centsFloored;
  }
}

export const BillingPeriod = ['monthly', 'yearly'] as const;
export type BillingPeriod = (typeof BillingPeriod)[number];

export type BillingSubscriptionPlanPriceSource = {
  originPrice: number;
  id: number;
};
export type BillingSubscriptionPlanPrice = Record<BillingPeriod, BillingSubscriptionPlanPriceSource>;
export type BillingSubscriptionPlanPriceMap = Record<BillingCurrency, BillingSubscriptionPlanPrice>;

export interface BillingSubscriptionPlanOptionInfo {
  category: BillingCategory;
  name: string;
  optionMap: Record<number, BillingSubscriptionPlanPriceMap>;
}

export const BillingSubscriptionGroupType = ['live-testing-group'] as const;
export type BillingSubscriptionGroupType = (typeof BillingSubscriptionGroupType)[number];

export const BillingSubscriptionPlanType = ['live-testing'] as const;
export type BillingSubscriptionPlanType = (typeof BillingSubscriptionPlanType)[number];

export const BillingPlanGroupMap: Record<BillingSubscriptionGroupType, BillingSubscriptionPlanType[]> = {
  'live-testing-group': ['live-testing'],
};

export const BillingSubscriptionPlanMap: Record<BillingSubscriptionPlanType, BillingSubscriptionPlanOptionInfo> = {
  'live-testing': {
    category: 'cloud',
    name: 'Live Testing',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 39000, id: 1 },
          yearly: { originPrice: 31000 * 12, id: 2 },
        },
        USD: {
          monthly: { originPrice: 29, id: 3 },
          yearly: { originPrice: 23 * 12, id: 4 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 78000, id: 5 },
          yearly: { originPrice: 62000 * 12, id: 6 },
        },
        USD: {
          monthly: { originPrice: 58, id: 7 },
          yearly: { originPrice: 46 * 12, id: 8 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 117000, id: 9 },
          yearly: { originPrice: 93000 * 12, id: 10 },
        },
        USD: {
          monthly: { originPrice: 87, id: 11 },
          yearly: { originPrice: 69 * 12, id: 12 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 156000, id: 13 },
          yearly: { originPrice: 124000 * 12, id: 14 },
        },
        USD: {
          monthly: { originPrice: 116, id: 15 },
          yearly: { originPrice: 92 * 12, id: 16 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 195000, id: 17 },
          yearly: { originPrice: 155000 * 12, id: 18 },
        },
        USD: {
          monthly: { originPrice: 145, id: 19 },
          yearly: { originPrice: 115 * 12, id: 20 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 234000, id: 21 },
          yearly: { originPrice: 186000 * 12, id: 22 },
        },
        USD: {
          monthly: { originPrice: 174, id: 23 },
          yearly: { originPrice: 138 * 12, id: 24 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 273000, id: 25 },
          yearly: { originPrice: 217000 * 12, id: 26 },
        },
        USD: {
          monthly: { originPrice: 203, id: 27 },
          yearly: { originPrice: 161 * 12, id: 28 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 312000, id: 29 },
          yearly: { originPrice: 248000 * 12, id: 30 },
        },
        USD: {
          monthly: { originPrice: 232, id: 31 },
          yearly: { originPrice: 184 * 12, id: 32 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 351000, id: 33 },
          yearly: { originPrice: 279000 * 12, id: 34 },
        },
        USD: {
          monthly: { originPrice: 261, id: 35 },
          yearly: { originPrice: 207 * 12, id: 36 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 390000, id: 37 },
          yearly: { originPrice: 310000 * 12, id: 38 },
        },
        USD: {
          monthly: { originPrice: 290, id: 39 },
          yearly: { originPrice: 230 * 12, id: 40 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 429000, id: 41 },
          yearly: { originPrice: 341000 * 12, id: 42 },
        },
        USD: {
          monthly: { originPrice: 319, id: 43 },
          yearly: { originPrice: 253 * 12, id: 44 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 468000, id: 45 },
          yearly: { originPrice: 372000 * 12, id: 46 },
        },
        USD: {
          monthly: { originPrice: 348, id: 47 },
          yearly: { originPrice: 276 * 12, id: 48 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 507000, id: 49 },
          yearly: { originPrice: 403000 * 12, id: 50 },
        },
        USD: {
          monthly: { originPrice: 377, id: 51 },
          yearly: { originPrice: 299 * 12, id: 52 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 546000, id: 53 },
          yearly: { originPrice: 434000 * 12, id: 54 },
        },
        USD: {
          monthly: { originPrice: 406, id: 55 },
          yearly: { originPrice: 322 * 12, id: 56 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 585000, id: 57 },
          yearly: { originPrice: 465000 * 12, id: 58 },
        },
        USD: {
          monthly: { originPrice: 435, id: 59 },
          yearly: { originPrice: 345 * 12, id: 60 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 624000, id: 61 },
          yearly: { originPrice: 496000 * 12, id: 62 },
        },
        USD: {
          monthly: { originPrice: 464, id: 63 },
          yearly: { originPrice: 368 * 12, id: 64 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 663000, id: 65 },
          yearly: { originPrice: 527000 * 12, id: 66 },
        },
        USD: {
          monthly: { originPrice: 493, id: 67 },
          yearly: { originPrice: 391 * 12, id: 68 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 702000, id: 69 },
          yearly: { originPrice: 558000 * 12, id: 70 },
        },
        USD: {
          monthly: { originPrice: 522, id: 71 },
          yearly: { originPrice: 414 * 12, id: 72 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 741000, id: 73 },
          yearly: { originPrice: 589000 * 12, id: 74 },
        },
        USD: {
          monthly: { originPrice: 551, id: 75 },
          yearly: { originPrice: 437 * 12, id: 76 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 780000, id: 77 },
          yearly: { originPrice: 620000 * 12, id: 78 },
        },
        USD: {
          monthly: { originPrice: 580, id: 79 },
          yearly: { originPrice: 460 * 12, id: 80 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 819000, id: 81 },
          yearly: { originPrice: 651000 * 12, id: 82 },
        },
        USD: {
          monthly: { originPrice: 609, id: 83 },
          yearly: { originPrice: 483 * 12, id: 84 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 858000, id: 85 },
          yearly: { originPrice: 682000 * 12, id: 86 },
        },
        USD: {
          monthly: { originPrice: 638, id: 87 },
          yearly: { originPrice: 506 * 12, id: 88 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 897000, id: 89 },
          yearly: { originPrice: 713000 * 12, id: 90 },
        },
        USD: {
          monthly: { originPrice: 667, id: 91 },
          yearly: { originPrice: 529 * 12, id: 92 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 936000, id: 93 },
          yearly: { originPrice: 744000 * 12, id: 94 },
        },
        USD: {
          monthly: { originPrice: 696, id: 95 },
          yearly: { originPrice: 552 * 12, id: 96 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 975000, id: 97 },
          yearly: { originPrice: 775000 * 12, id: 98 },
        },
        USD: {
          monthly: { originPrice: 725, id: 99 },
          yearly: { originPrice: 575 * 12, id: 100 },
        },
      },
    },
  },
};

export class CallBillingApiDto {
  @IsIn(Method)
  method!: Method;

  @IsFilledString()
  path!: string;

  @IsOptionalObject()
  query?: object;

  @IsOptionalObject()
  body?: object;

  // @IsNumber()
  // version!: number;
}

export interface CallBillingApiResponse<B = Record<string, unknown>> {
  status?: number;
  body?: B;
  errorMessage?: string;
}

export interface BillingSubscriptionPlanData {
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  originPrice: number;
}

export const BillingMethod = ['nice', 'paddle'] as const;
export type BillingMethod = (typeof BillingMethod)[number];

/**
 * @description If the payment fails at the expiration time, retry 3 times.
 */
export const BillingGracePeriodDays = 4;

export const BillingLicenseStatus = ['not-expired', 'within-grace-period', 'expired'] as const;
export type BillingLicenseStatus = (typeof BillingLicenseStatus)[number];

export const BillingGoodsName = 'Dogu Platform Subscription';
