export type PricingType = 'free' | 'enterprise';

export interface PricingCardData {
  title: string;
  type: PricingType;
  description: string;
  originPrice: number;
  discountedPrice?: number;
  discountDescription?: string;
  featureDescription?: string;
  features: string[];
}

export interface FeatureComparePartionData {
  title: string;
  icon: React.ReactNode;
  features: {
    title: React.ReactNode;
    pricingData: Record<PricingType, React.ReactNode>;
  }[];
}

export interface FeatureCompareData {
  pricings: Pick<PricingCardData, 'title' | 'type' | 'originPrice' | 'discountedPrice'>[];
  partitions: FeatureComparePartionData[];
}
