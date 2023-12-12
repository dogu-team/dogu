import { IsFilledString, IsOptionalObject, Method } from '@dogu-tech/common';
import { IsIn } from 'class-validator';

export const BillingCategory = ['cloud', 'self-hosted'] as const;
export type BillingCategory = (typeof BillingCategory)[number];
export const isBillingCategory = (value: unknown): value is BillingCategory => BillingCategory.includes(value as BillingCategory);

export const BillingCurrency = ['KRW', 'USD'] as const;
export type BillingCurrency = (typeof BillingCurrency)[number];
export const isBillingCurrency = (value: unknown): value is BillingCurrency => BillingCurrency.includes(value as BillingCurrency);

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
export const isBillingPeriod = (value: unknown): value is BillingPeriod => BillingPeriod.includes(value as BillingPeriod);

export type BillingPlanPriceSource = {
  originPrice: number;
  id: number;
};
export type BillingPlanPrice = Record<BillingPeriod, BillingPlanPriceSource>;
export type BillingPlanPriceMap = Record<BillingCurrency, BillingPlanPrice>;

export interface BillingPlanOptionInfo {
  category: BillingCategory;
  name: string;
  optionMap: Record<number, BillingPlanPriceMap>;
}

export const BillingSubscriptionGroupType = [
  'live-testing-group',
  'web-test-automation-group',
  'mobile-app-test-automation-group',
  'mobile-game-test-automation-group',
  'self-device-farm-group',
] as const;
export type BillingSubscriptionGroupType = (typeof BillingSubscriptionGroupType)[number];
export const isBillingSubscriptionGroupType = (value: unknown): value is BillingSubscriptionGroupType =>
  BillingSubscriptionGroupType.includes(value as BillingSubscriptionGroupType);

export const BillingPlanType = [
  'live-testing',
  'web-test-automation',
  'mobile-app-test-automation',
  'mobile-game-test-automation',
  'self-device-farm-browser',
  'self-device-farm-mobile',
] as const;
export type BillingPlanType = (typeof BillingPlanType)[number];
export const isBillingPlanType = (value: unknown): value is BillingPlanType => BillingPlanType.includes(value as BillingPlanType);

export const BillingPlanGroupMap: Record<BillingSubscriptionGroupType, BillingPlanType[]> = {
  'live-testing-group': ['live-testing'],
  'web-test-automation-group': ['web-test-automation'],
  'mobile-app-test-automation-group': ['mobile-app-test-automation'],
  'mobile-game-test-automation-group': ['mobile-game-test-automation'],
  'self-device-farm-group': ['self-device-farm-browser', 'self-device-farm-mobile'],
};

export const BillingPlanMap: Record<BillingPlanType, BillingPlanOptionInfo> = {
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
  'web-test-automation': {
    category: 'cloud',
    name: 'Web Test Automation',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 49000, id: 101 },
          yearly: { originPrice: 39000 * 12, id: 102 },
        },
        USD: {
          monthly: { originPrice: 37, id: 103 },
          yearly: { originPrice: 30 * 12, id: 104 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 98000, id: 105 },
          yearly: { originPrice: 78000 * 12, id: 106 },
        },
        USD: {
          monthly: { originPrice: 74, id: 107 },
          yearly: { originPrice: 60 * 12, id: 108 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 147000, id: 109 },
          yearly: { originPrice: 117000 * 12, id: 110 },
        },
        USD: {
          monthly: { originPrice: 111, id: 111 },
          yearly: { originPrice: 90 * 12, id: 112 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 196000, id: 113 },
          yearly: { originPrice: 156000 * 12, id: 114 },
        },
        USD: {
          monthly: { originPrice: 148, id: 115 },
          yearly: { originPrice: 120 * 12, id: 116 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 245000, id: 117 },
          yearly: { originPrice: 195000 * 12, id: 118 },
        },
        USD: {
          monthly: { originPrice: 185, id: 119 },
          yearly: { originPrice: 150 * 12, id: 120 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 294000, id: 121 },
          yearly: { originPrice: 234000 * 12, id: 122 },
        },
        USD: {
          monthly: { originPrice: 222, id: 123 },
          yearly: { originPrice: 180 * 12, id: 124 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 343000, id: 125 },
          yearly: { originPrice: 273000 * 12, id: 126 },
        },
        USD: {
          monthly: { originPrice: 259, id: 127 },
          yearly: { originPrice: 210 * 12, id: 128 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 392000, id: 129 },
          yearly: { originPrice: 312000 * 12, id: 130 },
        },
        USD: {
          monthly: { originPrice: 296, id: 131 },
          yearly: { originPrice: 240 * 12, id: 132 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 441000, id: 133 },
          yearly: { originPrice: 351000 * 12, id: 134 },
        },
        USD: {
          monthly: { originPrice: 333, id: 135 },
          yearly: { originPrice: 270 * 12, id: 136 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 490000, id: 137 },
          yearly: { originPrice: 390000 * 12, id: 138 },
        },
        USD: {
          monthly: { originPrice: 370, id: 139 },
          yearly: { originPrice: 300 * 12, id: 140 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 539000, id: 141 },
          yearly: { originPrice: 429000 * 12, id: 142 },
        },
        USD: {
          monthly: { originPrice: 407, id: 143 },
          yearly: { originPrice: 330 * 12, id: 144 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 588000, id: 145 },
          yearly: { originPrice: 468000 * 12, id: 146 },
        },
        USD: {
          monthly: { originPrice: 444, id: 147 },
          yearly: { originPrice: 360 * 12, id: 148 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 637000, id: 149 },
          yearly: { originPrice: 507000 * 12, id: 150 },
        },
        USD: {
          monthly: { originPrice: 481, id: 151 },
          yearly: { originPrice: 390 * 12, id: 152 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 686000, id: 153 },
          yearly: { originPrice: 546000 * 12, id: 154 },
        },
        USD: {
          monthly: { originPrice: 518, id: 155 },
          yearly: { originPrice: 420 * 12, id: 156 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 735000, id: 157 },
          yearly: { originPrice: 585000 * 12, id: 158 },
        },
        USD: {
          monthly: { originPrice: 555, id: 159 },
          yearly: { originPrice: 450 * 12, id: 160 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 784000, id: 161 },
          yearly: { originPrice: 624000 * 12, id: 162 },
        },
        USD: {
          monthly: { originPrice: 592, id: 163 },
          yearly: { originPrice: 480 * 12, id: 164 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 833000, id: 165 },
          yearly: { originPrice: 663000 * 12, id: 166 },
        },
        USD: {
          monthly: { originPrice: 629, id: 167 },
          yearly: { originPrice: 510 * 12, id: 168 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 882000, id: 169 },
          yearly: { originPrice: 702000 * 12, id: 170 },
        },
        USD: {
          monthly: { originPrice: 666, id: 171 },
          yearly: { originPrice: 540 * 12, id: 172 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 931000, id: 173 },
          yearly: { originPrice: 741000 * 12, id: 174 },
        },
        USD: {
          monthly: { originPrice: 703, id: 175 },
          yearly: { originPrice: 570 * 12, id: 176 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 980000, id: 177 },
          yearly: { originPrice: 780000 * 12, id: 178 },
        },
        USD: {
          monthly: { originPrice: 740, id: 179 },
          yearly: { originPrice: 600 * 12, id: 180 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 1029000, id: 181 },
          yearly: { originPrice: 819000 * 12, id: 182 },
        },
        USD: {
          monthly: { originPrice: 777, id: 183 },
          yearly: { originPrice: 630 * 12, id: 184 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 1078000, id: 185 },
          yearly: { originPrice: 858000 * 12, id: 186 },
        },
        USD: {
          monthly: { originPrice: 814, id: 187 },
          yearly: { originPrice: 660 * 12, id: 188 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 1127000, id: 189 },
          yearly: { originPrice: 897000 * 12, id: 190 },
        },
        USD: {
          monthly: { originPrice: 851, id: 191 },
          yearly: { originPrice: 690 * 12, id: 192 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 1176000, id: 193 },
          yearly: { originPrice: 936000 * 12, id: 194 },
        },
        USD: {
          monthly: { originPrice: 888, id: 195 },
          yearly: { originPrice: 720 * 12, id: 196 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 1225000, id: 197 },
          yearly: { originPrice: 975000 * 12, id: 198 },
        },
        USD: {
          monthly: { originPrice: 925, id: 199 },
          yearly: { originPrice: 750 * 12, id: 200 },
        },
      },
    },
  },
  'mobile-app-test-automation': {
    category: 'cloud',
    name: 'Mobile App Test Automation',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 129000, id: 201 },
          yearly: { originPrice: 103000 * 12, id: 202 },
        },
        USD: {
          monthly: { originPrice: 99, id: 203 },
          yearly: { originPrice: 79 * 12, id: 204 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 129000 * 2, id: 205 },
          yearly: { originPrice: 103000 * 2 * 12, id: 206 },
        },
        USD: {
          monthly: { originPrice: 99 * 2, id: 207 },
          yearly: { originPrice: 79 * 2 * 12, id: 208 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 129000 * 3, id: 209 },
          yearly: { originPrice: 103000 * 3 * 12, id: 210 },
        },
        USD: {
          monthly: { originPrice: 99 * 3, id: 211 },
          yearly: { originPrice: 79 * 3 * 12, id: 212 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 129000 * 4, id: 213 },
          yearly: { originPrice: 103000 * 4 * 12, id: 214 },
        },
        USD: {
          monthly: { originPrice: 99 * 4, id: 215 },
          yearly: { originPrice: 79 * 4 * 12, id: 216 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 129000 * 5, id: 217 },
          yearly: { originPrice: 103000 * 5 * 12, id: 218 },
        },
        USD: {
          monthly: { originPrice: 99 * 5, id: 219 },
          yearly: { originPrice: 79 * 5 * 12, id: 220 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 129000 * 6, id: 221 },
          yearly: { originPrice: 103000 * 6 * 12, id: 222 },
        },
        USD: {
          monthly: { originPrice: 99 * 6, id: 223 },
          yearly: { originPrice: 79 * 6 * 12, id: 224 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 129000 * 7, id: 225 },
          yearly: { originPrice: 103000 * 7 * 12, id: 226 },
        },
        USD: {
          monthly: { originPrice: 99 * 7, id: 227 },
          yearly: { originPrice: 79 * 7 * 12, id: 228 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 129000 * 8, id: 229 },
          yearly: { originPrice: 103000 * 8 * 12, id: 230 },
        },
        USD: {
          monthly: { originPrice: 99 * 8, id: 231 },
          yearly: { originPrice: 79 * 8 * 12, id: 232 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 129000 * 9, id: 233 },
          yearly: { originPrice: 103000 * 9 * 12, id: 234 },
        },
        USD: {
          monthly: { originPrice: 99 * 9, id: 235 },
          yearly: { originPrice: 79 * 9 * 12, id: 236 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 129000 * 10, id: 237 },
          yearly: { originPrice: 103000 * 10 * 12, id: 238 },
        },
        USD: {
          monthly: { originPrice: 99 * 10, id: 239 },
          yearly: { originPrice: 79 * 10 * 12, id: 240 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 129000 * 11, id: 241 },
          yearly: { originPrice: 103000 * 11 * 12, id: 242 },
        },
        USD: {
          monthly: { originPrice: 99 * 11, id: 243 },
          yearly: { originPrice: 79 * 11 * 12, id: 244 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 129000 * 12, id: 245 },
          yearly: { originPrice: 103000 * 12 * 12, id: 246 },
        },
        USD: {
          monthly: { originPrice: 99 * 12, id: 247 },
          yearly: { originPrice: 79 * 12 * 12, id: 248 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 129000 * 13, id: 249 },
          yearly: { originPrice: 103000 * 13 * 12, id: 250 },
        },
        USD: {
          monthly: { originPrice: 99 * 13, id: 251 },
          yearly: { originPrice: 79 * 13 * 12, id: 252 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 129000 * 14, id: 253 },
          yearly: { originPrice: 103000 * 14 * 12, id: 254 },
        },
        USD: {
          monthly: { originPrice: 99 * 14, id: 255 },
          yearly: { originPrice: 79 * 14 * 12, id: 256 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 129000 * 15, id: 257 },
          yearly: { originPrice: 103000 * 15 * 12, id: 258 },
        },
        USD: {
          monthly: { originPrice: 99 * 15, id: 259 },
          yearly: { originPrice: 79 * 15 * 12, id: 260 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 129000 * 16, id: 261 },
          yearly: { originPrice: 103000 * 16 * 12, id: 262 },
        },
        USD: {
          monthly: { originPrice: 99 * 16, id: 263 },
          yearly: { originPrice: 79 * 16 * 12, id: 264 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 129000 * 17, id: 265 },
          yearly: { originPrice: 103000 * 17 * 12, id: 266 },
        },
        USD: {
          monthly: { originPrice: 99 * 17, id: 267 },
          yearly: { originPrice: 79 * 17 * 12, id: 268 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 129000 * 18, id: 269 },
          yearly: { originPrice: 103000 * 18 * 12, id: 270 },
        },
        USD: {
          monthly: { originPrice: 99 * 18, id: 271 },
          yearly: { originPrice: 79 * 18 * 12, id: 272 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 129000 * 19, id: 273 },
          yearly: { originPrice: 103000 * 19 * 12, id: 274 },
        },
        USD: {
          monthly: { originPrice: 99 * 19, id: 275 },
          yearly: { originPrice: 79 * 19 * 12, id: 276 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 129000 * 20, id: 277 },
          yearly: { originPrice: 103000 * 20 * 12, id: 278 },
        },
        USD: {
          monthly: { originPrice: 99 * 20, id: 279 },
          yearly: { originPrice: 79 * 20 * 12, id: 280 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 129000 * 21, id: 281 },
          yearly: { originPrice: 103000 * 21 * 12, id: 282 },
        },
        USD: {
          monthly: { originPrice: 99 * 21, id: 283 },
          yearly: { originPrice: 79 * 21 * 12, id: 284 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 129000 * 22, id: 285 },
          yearly: { originPrice: 103000 * 22 * 12, id: 286 },
        },
        USD: {
          monthly: { originPrice: 99 * 22, id: 287 },
          yearly: { originPrice: 79 * 22 * 12, id: 288 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 129000 * 23, id: 289 },
          yearly: { originPrice: 103000 * 23 * 12, id: 290 },
        },
        USD: {
          monthly: { originPrice: 99 * 23, id: 291 },
          yearly: { originPrice: 79 * 23 * 12, id: 292 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 129000 * 24, id: 293 },
          yearly: { originPrice: 103000 * 24 * 12, id: 294 },
        },
        USD: {
          monthly: { originPrice: 99 * 24, id: 295 },
          yearly: { originPrice: 79 * 24 * 12, id: 296 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 129000 * 25, id: 297 },
          yearly: { originPrice: 103000 * 25 * 12, id: 298 },
        },
        USD: {
          monthly: { originPrice: 99 * 25, id: 299 },
          yearly: { originPrice: 79 * 25 * 12, id: 300 },
        },
      },
    },
  },
  'mobile-game-test-automation': {
    category: 'cloud',
    name: 'Mobile Game Test Automation',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 129000, id: 301 },
          yearly: { originPrice: 103000 * 12, id: 302 },
        },
        USD: {
          monthly: { originPrice: 99, id: 303 },
          yearly: { originPrice: 79 * 12, id: 304 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 258000, id: 305 },
          yearly: { originPrice: 206000 * 12, id: 306 },
        },
        USD: {
          monthly: { originPrice: 198, id: 307 },
          yearly: { originPrice: 158 * 12, id: 308 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 387000, id: 309 },
          yearly: { originPrice: 309000 * 12, id: 310 },
        },
        USD: {
          monthly: { originPrice: 297, id: 311 },
          yearly: { originPrice: 237 * 12, id: 312 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 516000, id: 313 },
          yearly: { originPrice: 412000 * 12, id: 314 },
        },
        USD: {
          monthly: { originPrice: 396, id: 315 },
          yearly: { originPrice: 316 * 12, id: 316 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 645000, id: 317 },
          yearly: { originPrice: 515000 * 12, id: 318 },
        },
        USD: {
          monthly: { originPrice: 495, id: 319 },
          yearly: { originPrice: 395 * 12, id: 320 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 774000, id: 321 },
          yearly: { originPrice: 618000 * 12, id: 322 },
        },
        USD: {
          monthly: { originPrice: 594, id: 323 },
          yearly: { originPrice: 474 * 12, id: 324 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 903000, id: 325 },
          yearly: { originPrice: 721000 * 12, id: 326 },
        },
        USD: {
          monthly: { originPrice: 693, id: 327 },
          yearly: { originPrice: 553 * 12, id: 328 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 1032000, id: 329 },
          yearly: { originPrice: 824000 * 12, id: 330 },
        },
        USD: {
          monthly: { originPrice: 792, id: 331 },
          yearly: { originPrice: 632 * 12, id: 332 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 1161000, id: 333 },
          yearly: { originPrice: 927000 * 12, id: 334 },
        },
        USD: {
          monthly: { originPrice: 891, id: 335 },
          yearly: { originPrice: 711 * 12, id: 336 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 1290000, id: 337 },
          yearly: { originPrice: 1030000 * 12, id: 338 },
        },
        USD: {
          monthly: { originPrice: 990, id: 339 },
          yearly: { originPrice: 790 * 12, id: 340 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 129000 * 11, id: 341 },
          yearly: { originPrice: 103000 * 11 * 12, id: 342 },
        },
        USD: {
          monthly: { originPrice: 99 * 11, id: 343 },
          yearly: { originPrice: 79 * 11 * 12, id: 344 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 129000 * 12, id: 345 },
          yearly: { originPrice: 103000 * 12 * 12, id: 346 },
        },
        USD: {
          monthly: { originPrice: 99 * 12, id: 347 },
          yearly: { originPrice: 79 * 12 * 12, id: 348 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 129000 * 13, id: 349 },
          yearly: { originPrice: 103000 * 13 * 12, id: 350 },
        },
        USD: {
          monthly: { originPrice: 99 * 13, id: 351 },
          yearly: { originPrice: 79 * 13 * 12, id: 352 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 129000 * 14, id: 353 },
          yearly: { originPrice: 103000 * 14 * 12, id: 354 },
        },
        USD: {
          monthly: { originPrice: 99 * 14, id: 355 },
          yearly: { originPrice: 79 * 14 * 12, id: 356 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 129000 * 15, id: 357 },
          yearly: { originPrice: 103000 * 15 * 12, id: 358 },
        },
        USD: {
          monthly: { originPrice: 99 * 15, id: 359 },
          yearly: { originPrice: 79 * 15 * 12, id: 360 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 129000 * 16, id: 361 },
          yearly: { originPrice: 103000 * 16 * 12, id: 362 },
        },
        USD: {
          monthly: { originPrice: 99 * 16, id: 363 },
          yearly: { originPrice: 79 * 16 * 12, id: 364 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 129000 * 17, id: 365 },
          yearly: { originPrice: 103000 * 17 * 12, id: 366 },
        },
        USD: {
          monthly: { originPrice: 99 * 17, id: 367 },
          yearly: { originPrice: 79 * 17 * 12, id: 368 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 129000 * 18, id: 369 },
          yearly: { originPrice: 103000 * 18 * 12, id: 370 },
        },
        USD: {
          monthly: { originPrice: 99 * 18, id: 371 },
          yearly: { originPrice: 79 * 18 * 12, id: 372 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 129000 * 19, id: 373 },
          yearly: { originPrice: 103000 * 19 * 12, id: 374 },
        },
        USD: {
          monthly: { originPrice: 99 * 19, id: 375 },
          yearly: { originPrice: 79 * 19 * 12, id: 376 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 129000 * 20, id: 377 },
          yearly: { originPrice: 103000 * 20 * 12, id: 378 },
        },
        USD: {
          monthly: { originPrice: 99 * 20, id: 379 },
          yearly: { originPrice: 79 * 20 * 12, id: 380 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 129000 * 21, id: 381 },
          yearly: { originPrice: 103000 * 21 * 12, id: 382 },
        },
        USD: {
          monthly: { originPrice: 99 * 21, id: 383 },
          yearly: { originPrice: 79 * 21 * 12, id: 384 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 129000 * 22, id: 385 },
          yearly: { originPrice: 103000 * 22 * 12, id: 386 },
        },
        USD: {
          monthly: { originPrice: 99 * 22, id: 387 },
          yearly: { originPrice: 79 * 22 * 12, id: 388 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 129000 * 23, id: 389 },
          yearly: { originPrice: 103000 * 23 * 12, id: 390 },
        },
        USD: {
          monthly: { originPrice: 99 * 23, id: 391 },
          yearly: { originPrice: 79 * 23 * 12, id: 392 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 129000 * 24, id: 393 },
          yearly: { originPrice: 103000 * 24 * 12, id: 394 },
        },
        USD: {
          monthly: { originPrice: 99 * 24, id: 395 },
          yearly: { originPrice: 79 * 24 * 12, id: 396 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 129000 * 25, id: 397 },
          yearly: { originPrice: 103000 * 25 * 12, id: 398 },
        },
        USD: {
          monthly: { originPrice: 99 * 25, id: 399 },
          yearly: { originPrice: 79 * 25 * 12, id: 400 },
        },
      },
    },
  },
  'self-device-farm-browser': {
    category: 'cloud',
    name: 'Self Browser',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 19000 * 1, id: 401 },
          yearly: { originPrice: 16000 * 1 * 12, id: 402 },
        },
        USD: {
          monthly: { originPrice: 15 * 1, id: 403 },
          yearly: { originPrice: 12 * 1 * 12, id: 404 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 19000 * 2, id: 405 },
          yearly: { originPrice: 16000 * 2 * 12, id: 406 },
        },
        USD: {
          monthly: { originPrice: 15 * 2, id: 407 },
          yearly: { originPrice: 12 * 2 * 12, id: 408 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 19000 * 3, id: 409 },
          yearly: { originPrice: 16000 * 3 * 12, id: 410 },
        },
        USD: {
          monthly: { originPrice: 15 * 3, id: 411 },
          yearly: { originPrice: 12 * 3 * 12, id: 412 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 19000 * 4, id: 413 },
          yearly: { originPrice: 16000 * 4 * 12, id: 414 },
        },
        USD: {
          monthly: { originPrice: 15 * 4, id: 415 },
          yearly: { originPrice: 12 * 4 * 12, id: 416 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 19000 * 5, id: 417 },
          yearly: { originPrice: 16000 * 5 * 12, id: 418 },
        },
        USD: {
          monthly: { originPrice: 15 * 5, id: 419 },
          yearly: { originPrice: 12 * 5 * 12, id: 420 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 19000 * 6, id: 421 },
          yearly: { originPrice: 16000 * 6 * 12, id: 422 },
        },
        USD: {
          monthly: { originPrice: 15 * 6, id: 423 },
          yearly: { originPrice: 12 * 6 * 12, id: 424 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 19000 * 7, id: 425 },
          yearly: { originPrice: 16000 * 7 * 12, id: 426 },
        },
        USD: {
          monthly: { originPrice: 15 * 7, id: 427 },
          yearly: { originPrice: 12 * 7 * 12, id: 428 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 19000 * 8, id: 429 },
          yearly: { originPrice: 16000 * 8 * 12, id: 430 },
        },
        USD: {
          monthly: { originPrice: 15 * 8, id: 431 },
          yearly: { originPrice: 12 * 8 * 12, id: 432 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 19000 * 9, id: 433 },
          yearly: { originPrice: 16000 * 9 * 12, id: 434 },
        },
        USD: {
          monthly: { originPrice: 15 * 9, id: 435 },
          yearly: { originPrice: 12 * 9 * 12, id: 436 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 19000 * 10, id: 437 },
          yearly: { originPrice: 16000 * 10 * 12, id: 438 },
        },
        USD: {
          monthly: { originPrice: 15 * 10, id: 439 },
          yearly: { originPrice: 12 * 10 * 12, id: 440 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 19000 * 11, id: 441 },
          yearly: { originPrice: 16000 * 11 * 12, id: 442 },
        },
        USD: {
          monthly: { originPrice: 15 * 11, id: 443 },
          yearly: { originPrice: 12 * 11 * 12, id: 444 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 19000 * 12, id: 445 },
          yearly: { originPrice: 16000 * 12 * 12, id: 446 },
        },
        USD: {
          monthly: { originPrice: 15 * 12, id: 447 },
          yearly: { originPrice: 12 * 12 * 12, id: 448 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 19000 * 13, id: 449 },
          yearly: { originPrice: 16000 * 13 * 12, id: 450 },
        },
        USD: {
          monthly: { originPrice: 15 * 13, id: 451 },
          yearly: { originPrice: 12 * 13 * 12, id: 452 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 19000 * 14, id: 453 },
          yearly: { originPrice: 16000 * 14 * 12, id: 454 },
        },
        USD: {
          monthly: { originPrice: 15 * 14, id: 455 },
          yearly: { originPrice: 12 * 14 * 12, id: 456 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 19000 * 15, id: 457 },
          yearly: { originPrice: 16000 * 15 * 12, id: 458 },
        },
        USD: {
          monthly: { originPrice: 15 * 15, id: 459 },
          yearly: { originPrice: 12 * 15 * 12, id: 460 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 19000 * 16, id: 461 },
          yearly: { originPrice: 16000 * 16 * 12, id: 462 },
        },
        USD: {
          monthly: { originPrice: 15 * 16, id: 463 },
          yearly: { originPrice: 12 * 16 * 12, id: 464 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 19000 * 17, id: 465 },
          yearly: { originPrice: 16000 * 17 * 12, id: 466 },
        },
        USD: {
          monthly: { originPrice: 15 * 17, id: 467 },
          yearly: { originPrice: 12 * 17 * 12, id: 468 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 19000 * 18, id: 469 },
          yearly: { originPrice: 16000 * 18 * 12, id: 470 },
        },
        USD: {
          monthly: { originPrice: 15 * 18, id: 471 },
          yearly: { originPrice: 12 * 18 * 12, id: 472 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 19000 * 19, id: 473 },
          yearly: { originPrice: 16000 * 19 * 12, id: 474 },
        },
        USD: {
          monthly: { originPrice: 15 * 19, id: 475 },
          yearly: { originPrice: 12 * 19 * 12, id: 476 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 19000 * 20, id: 477 },
          yearly: { originPrice: 16000 * 20 * 12, id: 478 },
        },
        USD: {
          monthly: { originPrice: 15 * 20, id: 479 },
          yearly: { originPrice: 12 * 20 * 12, id: 480 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 19000 * 21, id: 481 },
          yearly: { originPrice: 16000 * 21 * 12, id: 482 },
        },
        USD: {
          monthly: { originPrice: 15 * 21, id: 483 },
          yearly: { originPrice: 12 * 21 * 12, id: 484 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 19000 * 22, id: 485 },
          yearly: { originPrice: 16000 * 22 * 12, id: 486 },
        },
        USD: {
          monthly: { originPrice: 15 * 22, id: 487 },
          yearly: { originPrice: 12 * 22 * 12, id: 488 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 19000 * 23, id: 489 },
          yearly: { originPrice: 16000 * 23 * 12, id: 490 },
        },
        USD: {
          monthly: { originPrice: 15 * 23, id: 491 },
          yearly: { originPrice: 12 * 23 * 12, id: 492 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 19000 * 24, id: 493 },
          yearly: { originPrice: 16000 * 24 * 12, id: 494 },
        },
        USD: {
          monthly: { originPrice: 15 * 24, id: 495 },
          yearly: { originPrice: 12 * 24 * 12, id: 496 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 19000 * 25, id: 497 },
          yearly: { originPrice: 16000 * 25 * 12, id: 498 },
        },
        USD: {
          monthly: { originPrice: 15 * 25, id: 499 },
          yearly: { originPrice: 12 * 25 * 12, id: 500 },
        },
      },
    },
  },
  'self-device-farm-mobile': {
    category: 'cloud',
    name: 'Self Mobile',
    optionMap: {
      1: {
        KRW: {
          monthly: { originPrice: 25900 * 1, id: 501 },
          yearly: { originPrice: 21000 * 1 * 12, id: 502 },
        },
        USD: {
          monthly: { originPrice: 19 * 1, id: 503 },
          yearly: { originPrice: 16 * 1 * 12, id: 504 },
        },
      },
      2: {
        KRW: {
          monthly: { originPrice: 25900 * 2, id: 505 },
          yearly: { originPrice: 21000 * 2 * 12, id: 506 },
        },
        USD: {
          monthly: { originPrice: 19 * 2, id: 507 },
          yearly: { originPrice: 16 * 2 * 12, id: 508 },
        },
      },
      3: {
        KRW: {
          monthly: { originPrice: 25900 * 3, id: 509 },
          yearly: { originPrice: 21000 * 3 * 12, id: 510 },
        },
        USD: {
          monthly: { originPrice: 19 * 3, id: 511 },
          yearly: { originPrice: 16 * 3 * 12, id: 512 },
        },
      },
      4: {
        KRW: {
          monthly: { originPrice: 25900 * 4, id: 513 },
          yearly: { originPrice: 21000 * 4 * 12, id: 514 },
        },
        USD: {
          monthly: { originPrice: 19 * 4, id: 515 },
          yearly: { originPrice: 16 * 4 * 12, id: 516 },
        },
      },
      5: {
        KRW: {
          monthly: { originPrice: 25900 * 5, id: 517 },
          yearly: { originPrice: 21000 * 5 * 12, id: 518 },
        },
        USD: {
          monthly: { originPrice: 19 * 5, id: 519 },
          yearly: { originPrice: 16 * 5 * 12, id: 520 },
        },
      },
      6: {
        KRW: {
          monthly: { originPrice: 25900 * 6, id: 521 },
          yearly: { originPrice: 21000 * 6 * 12, id: 522 },
        },
        USD: {
          monthly: { originPrice: 19 * 6, id: 523 },
          yearly: { originPrice: 16 * 6 * 12, id: 524 },
        },
      },
      7: {
        KRW: {
          monthly: { originPrice: 25900 * 7, id: 525 },
          yearly: { originPrice: 21000 * 7 * 12, id: 526 },
        },
        USD: {
          monthly: { originPrice: 19 * 7, id: 527 },
          yearly: { originPrice: 16 * 7 * 12, id: 528 },
        },
      },
      8: {
        KRW: {
          monthly: { originPrice: 25900 * 8, id: 529 },
          yearly: { originPrice: 21000 * 8 * 12, id: 530 },
        },
        USD: {
          monthly: { originPrice: 19 * 8, id: 531 },
          yearly: { originPrice: 16 * 8 * 12, id: 532 },
        },
      },
      9: {
        KRW: {
          monthly: { originPrice: 25900 * 9, id: 533 },
          yearly: { originPrice: 21000 * 9 * 12, id: 534 },
        },
        USD: {
          monthly: { originPrice: 19 * 9, id: 535 },
          yearly: { originPrice: 16 * 9 * 12, id: 536 },
        },
      },
      10: {
        KRW: {
          monthly: { originPrice: 25900 * 10, id: 537 },
          yearly: { originPrice: 21000 * 10 * 12, id: 538 },
        },
        USD: {
          monthly: { originPrice: 19 * 10, id: 539 },
          yearly: { originPrice: 16 * 10 * 12, id: 540 },
        },
      },
      11: {
        KRW: {
          monthly: { originPrice: 25900 * 11, id: 541 },
          yearly: { originPrice: 21000 * 11 * 12, id: 542 },
        },
        USD: {
          monthly: { originPrice: 19 * 11, id: 543 },
          yearly: { originPrice: 16 * 11 * 12, id: 544 },
        },
      },
      12: {
        KRW: {
          monthly: { originPrice: 25900 * 12, id: 545 },
          yearly: { originPrice: 21000 * 12 * 12, id: 546 },
        },
        USD: {
          monthly: { originPrice: 19 * 12, id: 547 },
          yearly: { originPrice: 16 * 12 * 12, id: 548 },
        },
      },
      13: {
        KRW: {
          monthly: { originPrice: 25900 * 13, id: 549 },
          yearly: { originPrice: 21000 * 13 * 12, id: 550 },
        },
        USD: {
          monthly: { originPrice: 19 * 13, id: 551 },
          yearly: { originPrice: 16 * 13 * 12, id: 552 },
        },
      },
      14: {
        KRW: {
          monthly: { originPrice: 25900 * 14, id: 553 },
          yearly: { originPrice: 21000 * 14 * 12, id: 554 },
        },
        USD: {
          monthly: { originPrice: 19 * 14, id: 555 },
          yearly: { originPrice: 16 * 14 * 12, id: 556 },
        },
      },
      15: {
        KRW: {
          monthly: { originPrice: 25900 * 15, id: 557 },
          yearly: { originPrice: 21000 * 15 * 12, id: 558 },
        },
        USD: {
          monthly: { originPrice: 19 * 15, id: 559 },
          yearly: { originPrice: 16 * 15 * 12, id: 560 },
        },
      },
      16: {
        KRW: {
          monthly: { originPrice: 25900 * 16, id: 561 },
          yearly: { originPrice: 21000 * 16 * 12, id: 562 },
        },
        USD: {
          monthly: { originPrice: 19 * 16, id: 563 },
          yearly: { originPrice: 16 * 16 * 12, id: 564 },
        },
      },
      17: {
        KRW: {
          monthly: { originPrice: 25900 * 17, id: 565 },
          yearly: { originPrice: 21000 * 17 * 12, id: 566 },
        },
        USD: {
          monthly: { originPrice: 19 * 17, id: 567 },
          yearly: { originPrice: 16 * 17 * 12, id: 568 },
        },
      },
      18: {
        KRW: {
          monthly: { originPrice: 25900 * 18, id: 569 },
          yearly: { originPrice: 21000 * 18 * 12, id: 570 },
        },
        USD: {
          monthly: { originPrice: 19 * 18, id: 571 },
          yearly: { originPrice: 16 * 18 * 12, id: 572 },
        },
      },
      19: {
        KRW: {
          monthly: { originPrice: 25900 * 19, id: 573 },
          yearly: { originPrice: 21000 * 19 * 12, id: 574 },
        },
        USD: {
          monthly: { originPrice: 19 * 19, id: 575 },
          yearly: { originPrice: 16 * 19 * 12, id: 576 },
        },
      },
      20: {
        KRW: {
          monthly: { originPrice: 25900 * 20, id: 577 },
          yearly: { originPrice: 21000 * 20 * 12, id: 578 },
        },
        USD: {
          monthly: { originPrice: 19 * 20, id: 579 },
          yearly: { originPrice: 16 * 20 * 12, id: 580 },
        },
      },
      21: {
        KRW: {
          monthly: { originPrice: 25900 * 21, id: 581 },
          yearly: { originPrice: 21000 * 21 * 12, id: 582 },
        },
        USD: {
          monthly: { originPrice: 19 * 21, id: 583 },
          yearly: { originPrice: 16 * 21 * 12, id: 584 },
        },
      },
      22: {
        KRW: {
          monthly: { originPrice: 25900 * 22, id: 585 },
          yearly: { originPrice: 21000 * 22 * 12, id: 586 },
        },
        USD: {
          monthly: { originPrice: 19 * 22, id: 587 },
          yearly: { originPrice: 16 * 22 * 12, id: 588 },
        },
      },
      23: {
        KRW: {
          monthly: { originPrice: 25900 * 23, id: 589 },
          yearly: { originPrice: 21000 * 23 * 12, id: 590 },
        },
        USD: {
          monthly: { originPrice: 19 * 23, id: 591 },
          yearly: { originPrice: 16 * 23 * 12, id: 592 },
        },
      },
      24: {
        KRW: {
          monthly: { originPrice: 25900 * 24, id: 593 },
          yearly: { originPrice: 21000 * 24 * 12, id: 594 },
        },
        USD: {
          monthly: { originPrice: 19 * 24, id: 595 },
          yearly: { originPrice: 16 * 24 * 12, id: 596 },
        },
      },
      25: {
        KRW: {
          monthly: { originPrice: 25900 * 25, id: 597 },
          yearly: { originPrice: 21000 * 25 * 12, id: 598 },
        },
        USD: {
          monthly: { originPrice: 19 * 25, id: 599 },
          yearly: { originPrice: 16 * 25 * 12, id: 600 },
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
}

export interface CallBillingApiResponse<B = Record<string, unknown>> {
  status?: number;
  body?: B;
  errorMessage?: string;
}

export interface BillingPlanData {
  category: BillingCategory;
  type: BillingPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  originPrice: number;
}

export const BillingMethod = ['nice', 'paddle'] as const;
export type BillingMethod = (typeof BillingMethod)[number];
export const isBillingMethod = (value: unknown): value is BillingMethod => BillingMethod.includes(value as BillingMethod);

/**
 * @description If the payment fails at the expiration time, retry 3 times.
 */
export const BillingGracePeriodDays = 4;

export const BillingLicenseStatus = ['not-expired', 'within-grace-period', 'expired'] as const;
export type BillingLicenseStatus = (typeof BillingLicenseStatus)[number];
export const isBillingLicenseStatus = (value: unknown): value is BillingLicenseStatus => BillingLicenseStatus.includes(value as BillingLicenseStatus);

export const BillingGoodsName = 'Dogu Platform Subscription';

export type MatchBillingPlanType = {
  category: BillingCategory;
  type: BillingPlanType;
};

export function matchBillingPlanType(source: MatchBillingPlanType, destination: MatchBillingPlanType): boolean {
  if (source.category !== destination.category) {
    return false;
  }

  if (source.type !== destination.type) {
    return false;
  }

  return true;
}
