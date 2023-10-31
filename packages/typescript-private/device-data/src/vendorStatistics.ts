import { Vendor } from './type';

export type VendorMarketShare = {
  [vendor in Vendor]: number;
};

export class CountryVendorStatistics {
  public readonly country: string;
  public readonly marketShare: VendorMarketShare;

  constructor(country: string, marketShare: VendorMarketShare) {
    this.country = country;
    this.marketShare = marketShare;
  }
}

// Data in 2023/10/26
export const countryVendorStatistics = [
  new CountryVendorStatistics('United States', {
    Samsung: 26.5,
    Apple: 56.4,
    Sony: 0,
    Google: 2.4,
    Xiaomi: 0,
    Oppo: 0,
    Vivo: 0,
    Realme: 0,
    Desktop: 0,
  }),
  new CountryVendorStatistics('South Korea', {
    Samsung: 65.9,
    Apple: 28.2,
    Sony: 0,
    Google: 0,
    Xiaomi: 0,
    Oppo: 0,
    Vivo: 0,
    Realme: 0,
    Desktop: 0,
  }),
  new CountryVendorStatistics('Japan', {
    Samsung: 5.8,
    Apple: 69.4,
    Sony: 5.4,
    Google: 3.9,
    Xiaomi: 2,
    Oppo: 0,
    Vivo: 0,
    Realme: 0,
    Desktop: 0,
  }),
  new CountryVendorStatistics('India', {
    Samsung: 14.1,
    Apple: 5.6,
    Sony: 0,
    Google: 0,
    Xiaomi: 21,
    Oppo: 12,
    Vivo: 17.7,
    Realme: 13.2,
    Desktop: 0,
  }),
];
