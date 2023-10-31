import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

import { BillingPeriod, SubscriptionPlanPriceMap } from './billing';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionPlanType = ['live-testing'] as const;
export type CloudSubscriptionPlanType = (typeof CloudSubscriptionPlanType)[number];

export interface CloudSubscriptionPlanInfo {
  optionMap: Record<number, SubscriptionPlanPriceMap>;
}

export const CloudSubscriptionPlanMap: Record<CloudSubscriptionPlanType, CloudSubscriptionPlanInfo> = {
  'live-testing': {
    optionMap: {
      1: {
        krw: {
          monthly: 39000,
          yearly: 31000 * 12,
        },
        usd: {
          monthly: 29,
          yearly: 23 * 12,
        },
      },
      2: {
        krw: {
          monthly: 78000,
          yearly: 62000 * 12,
        },
        usd: {
          monthly: 58,
          yearly: 46 * 12,
        },
      },
      3: {
        krw: {
          monthly: 117000,
          yearly: 93000 * 12,
        },
        usd: {
          monthly: 87,
          yearly: 69 * 12,
        },
      },
      4: {
        krw: {
          monthly: 156000,
          yearly: 124000 * 12,
        },
        usd: {
          monthly: 116,
          yearly: 92 * 12,
        },
      },
      5: {
        krw: {
          monthly: 195000,
          yearly: 155000 * 12,
        },
        usd: {
          monthly: 145,
          yearly: 115 * 12,
        },
      },
      6: {
        krw: {
          monthly: 234000,
          yearly: 186000 * 12,
        },
        usd: {
          monthly: 174,
          yearly: 138 * 12,
        },
      },
      7: {
        krw: {
          monthly: 273000,
          yearly: 217000 * 12,
        },
        usd: {
          monthly: 203,
          yearly: 161 * 12,
        },
      },
      8: {
        krw: {
          monthly: 312000,
          yearly: 248000 * 12,
        },
        usd: {
          monthly: 232,
          yearly: 184 * 12,
        },
      },
      9: {
        krw: {
          monthly: 351000,
          yearly: 279000 * 12,
        },
        usd: {
          monthly: 261,
          yearly: 207 * 12,
        },
      },
      10: {
        krw: {
          monthly: 390000,
          yearly: 310000 * 12,
        },
        usd: {
          monthly: 290,
          yearly: 230 * 12,
        },
      },
      11: {
        krw: {
          monthly: 429000,
          yearly: 341000 * 12,
        },
        usd: {
          monthly: 319,
          yearly: 253 * 12,
        },
      },
      12: {
        krw: {
          monthly: 468000,
          yearly: 372000 * 12,
        },
        usd: {
          monthly: 348,
          yearly: 276 * 12,
        },
      },
      13: {
        krw: {
          monthly: 507000,
          yearly: 403000 * 12,
        },
        usd: {
          monthly: 377,
          yearly: 299 * 12,
        },
      },
      14: {
        krw: {
          monthly: 546000,
          yearly: 434000 * 12,
        },
        usd: {
          monthly: 406,
          yearly: 322 * 12,
        },
      },
      15: {
        krw: {
          monthly: 585000,
          yearly: 465000 * 12,
        },
        usd: {
          monthly: 435,
          yearly: 345 * 12,
        },
      },
      16: {
        krw: {
          monthly: 624000,
          yearly: 496000 * 12,
        },
        usd: {
          monthly: 464,
          yearly: 368 * 12,
        },
      },
      17: {
        krw: {
          monthly: 663000,
          yearly: 527000 * 12,
        },
        usd: {
          monthly: 493,
          yearly: 391 * 12,
        },
      },
      18: {
        krw: {
          monthly: 702000,
          yearly: 558000 * 12,
        },
        usd: {
          monthly: 522,
          yearly: 414 * 12,
        },
      },
      19: {
        krw: {
          monthly: 741000,
          yearly: 589000 * 12,
        },
        usd: {
          monthly: 551,
          yearly: 437 * 12,
        },
      },
      20: {
        krw: {
          monthly: 780000,
          yearly: 620000 * 12,
        },
        usd: {
          monthly: 580,
          yearly: 460 * 12,
        },
      },
      21: {
        krw: {
          monthly: 819000,
          yearly: 651000 * 12,
        },
        usd: {
          monthly: 609,
          yearly: 483 * 12,
        },
      },
      22: {
        krw: {
          monthly: 858000,
          yearly: 682000 * 12,
        },
        usd: {
          monthly: 638,
          yearly: 506 * 12,
        },
      },
      23: {
        krw: {
          monthly: 897000,
          yearly: 713000 * 12,
        },
        usd: {
          monthly: 667,
          yearly: 529 * 12,
        },
      },
      24: {
        krw: {
          monthly: 936000,
          yearly: 744000 * 12,
        },
        usd: {
          monthly: 696,
          yearly: 552 * 12,
        },
      },
      25: {
        krw: {
          monthly: 975000,
          yearly: 775000 * 12,
        },
        usd: {
          monthly: 725,
          yearly: 575 * 12,
        },
      },
    },
  },
};

export interface CloudSubscriptionPlanBase {
  cloudSubscriptionPlanId: string;
  type: CloudSubscriptionPlanType;
  period: BillingPeriod;
  cloudLicenseId: string;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
}

export const CloudSubscriptionPlanPropCamel = propertiesOf<CloudSubscriptionPlanBase>();
export const CloudSubscriptionPlanPropSnake = camelToSnakeCasePropertiesOf<CloudSubscriptionPlanBase>();
