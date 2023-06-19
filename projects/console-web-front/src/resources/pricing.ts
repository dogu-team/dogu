export enum PricingAvailability {
  AVAILABLE,
  UNAVAILABLE,
}

export type PData = {
  type: 'availability' | 'text';
  content: PricingAvailability | string;
};

export type AllDevicePriceData = {
  windows: PData;
  mac: PData;
  android: PData;
  ios: PData;
};

export const deviceFarmPricingData: { title: string; data: AllDevicePriceData }[] = [
  {
    title: 'Screen streaming',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
    },
  },
  {
    title: 'Audio output',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
    },
  },
  {
    title: 'Touch input',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
    },
  },
  {
    title: 'Keyboard input',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
    },
  },
  {
    title: 'Keyboard input',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
    },
  },
  {
    title: 'Game installation',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
    },
  },
  {
    title: 'File browsing',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
    },
  },
  {
    title: 'File transmission',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
    },
  },
  {
    title: 'Physical button',
    data: {
      windows: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      android: {
        type: 'availability',
        content: PricingAvailability.AVAILABLE,
      },
      ios: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
      mac: {
        type: 'availability',
        content: PricingAvailability.UNAVAILABLE,
      },
    },
  },
];

export const automationPricingData: { title: string; data: AllDevicePriceData }[] = [];
