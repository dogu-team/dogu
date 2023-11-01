export const BillingCategory = ['cloud', 'self-hosted'] as const;
export type BillingCategory = (typeof BillingCategory)[number];

export const BillingCurrency = ['KRW', 'USD'] as const;
export type BillingCurrency = (typeof BillingCurrency)[number];

export const BillingPeriod = ['monthly', 'yearly'] as const;
export type BillingPeriod = (typeof BillingPeriod)[number];

export interface BillingSubscriptionPlanPrice {
  monthly: number;
  yearly: number;
}

export type BillingSubscriptionPlanPriceMap = Record<BillingCurrency, BillingSubscriptionPlanPrice>;

export interface BillingSubscriptionPlanInfo {
  category: BillingCategory;
  optionMap: Record<number, BillingSubscriptionPlanPriceMap>;
}

export const BillingSubscriptionPlanType = ['live-testing'] as const;
export type BillingSubscriptionPlanType = (typeof BillingSubscriptionPlanType)[number];

export const BillingSubscriptionPlanMap: Record<BillingSubscriptionPlanType, BillingSubscriptionPlanInfo> = {
  'live-testing': {
    category: 'cloud',
    optionMap: {
      1: {
        KRW: {
          monthly: 39000,
          yearly: 31000 * 12,
        },
        USD: {
          monthly: 29,
          yearly: 23 * 12,
        },
      },
      2: {
        KRW: {
          monthly: 78000,
          yearly: 62000 * 12,
        },
        USD: {
          monthly: 58,
          yearly: 46 * 12,
        },
      },
      3: {
        KRW: {
          monthly: 117000,
          yearly: 93000 * 12,
        },
        USD: {
          monthly: 87,
          yearly: 69 * 12,
        },
      },
      4: {
        KRW: {
          monthly: 156000,
          yearly: 124000 * 12,
        },
        USD: {
          monthly: 116,
          yearly: 92 * 12,
        },
      },
      5: {
        KRW: {
          monthly: 195000,
          yearly: 155000 * 12,
        },
        USD: {
          monthly: 145,
          yearly: 115 * 12,
        },
      },
      6: {
        KRW: {
          monthly: 234000,
          yearly: 186000 * 12,
        },
        USD: {
          monthly: 174,
          yearly: 138 * 12,
        },
      },
      7: {
        KRW: {
          monthly: 273000,
          yearly: 217000 * 12,
        },
        USD: {
          monthly: 203,
          yearly: 161 * 12,
        },
      },
      8: {
        KRW: {
          monthly: 312000,
          yearly: 248000 * 12,
        },
        USD: {
          monthly: 232,
          yearly: 184 * 12,
        },
      },
      9: {
        KRW: {
          monthly: 351000,
          yearly: 279000 * 12,
        },
        USD: {
          monthly: 261,
          yearly: 207 * 12,
        },
      },
      10: {
        KRW: {
          monthly: 390000,
          yearly: 310000 * 12,
        },
        USD: {
          monthly: 290,
          yearly: 230 * 12,
        },
      },
      11: {
        KRW: {
          monthly: 429000,
          yearly: 341000 * 12,
        },
        USD: {
          monthly: 319,
          yearly: 253 * 12,
        },
      },
      12: {
        KRW: {
          monthly: 468000,
          yearly: 372000 * 12,
        },
        USD: {
          monthly: 348,
          yearly: 276 * 12,
        },
      },
      13: {
        KRW: {
          monthly: 507000,
          yearly: 403000 * 12,
        },
        USD: {
          monthly: 377,
          yearly: 299 * 12,
        },
      },
      14: {
        KRW: {
          monthly: 546000,
          yearly: 434000 * 12,
        },
        USD: {
          monthly: 406,
          yearly: 322 * 12,
        },
      },
      15: {
        KRW: {
          monthly: 585000,
          yearly: 465000 * 12,
        },
        USD: {
          monthly: 435,
          yearly: 345 * 12,
        },
      },
      16: {
        KRW: {
          monthly: 624000,
          yearly: 496000 * 12,
        },
        USD: {
          monthly: 464,
          yearly: 368 * 12,
        },
      },
      17: {
        KRW: {
          monthly: 663000,
          yearly: 527000 * 12,
        },
        USD: {
          monthly: 493,
          yearly: 391 * 12,
        },
      },
      18: {
        KRW: {
          monthly: 702000,
          yearly: 558000 * 12,
        },
        USD: {
          monthly: 522,
          yearly: 414 * 12,
        },
      },
      19: {
        KRW: {
          monthly: 741000,
          yearly: 589000 * 12,
        },
        USD: {
          monthly: 551,
          yearly: 437 * 12,
        },
      },
      20: {
        KRW: {
          monthly: 780000,
          yearly: 620000 * 12,
        },
        USD: {
          monthly: 580,
          yearly: 460 * 12,
        },
      },
      21: {
        KRW: {
          monthly: 819000,
          yearly: 651000 * 12,
        },
        USD: {
          monthly: 609,
          yearly: 483 * 12,
        },
      },
      22: {
        KRW: {
          monthly: 858000,
          yearly: 682000 * 12,
        },
        USD: {
          monthly: 638,
          yearly: 506 * 12,
        },
      },
      23: {
        KRW: {
          monthly: 897000,
          yearly: 713000 * 12,
        },
        USD: {
          monthly: 667,
          yearly: 529 * 12,
        },
      },
      24: {
        KRW: {
          monthly: 936000,
          yearly: 744000 * 12,
        },
        USD: {
          monthly: 696,
          yearly: 552 * 12,
        },
      },
      25: {
        KRW: {
          monthly: 975000,
          yearly: 775000 * 12,
        },
        USD: {
          monthly: 725,
          yearly: 575 * 12,
        },
      },
    },
  },
};
