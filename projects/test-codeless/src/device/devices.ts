export interface DeviceScreenMap {
  [deviceName: string]: DeviceScreenInfo;
}

export interface DeviceScreenInfo {
  widthResolution: number;
  heightResolution: number;
  pixelRatio: number;
}

export const devices: DeviceScreenMap = {
  'iPad Pro 12.9" (6th Gen)': {
    widthResolution: 1024 * 2,
    heightResolution: 1366 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 11" (4th Gen)': {
    widthResolution: 834 * 2,
    heightResolution: 1194 * 2,
    pixelRatio: 2,
  },
  'iPad (10th Gen)': {
    widthResolution: 820 * 2,
    heightResolution: 1180 * 2,
    pixelRatio: 2,
  },
  'iPad Air (5th Gen)': {
    widthResolution: 820 * 2,
    heightResolution: 1180 * 2,
    pixelRatio: 2,
  },
  'iPad (9th Gen)': {
    widthResolution: 810 * 2,
    heightResolution: 1080 * 2,
    pixelRatio: 2,
  },
  'iPad mini (6th Gen)': {
    widthResolution: 744 * 2,
    heightResolution: 1133 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 12.9" (5th Gen)': {
    widthResolution: 1024 * 2,
    heightResolution: 1366 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 11" (3rd Gen)': {
    widthResolution: 834 * 2,
    heightResolution: 1194 * 2,
    pixelRatio: 2,
  },
  'iPad Air (4th Gen)': {
    widthResolution: 820 * 2,
    heightResolution: 1180 * 2,
    pixelRatio: 2,
  },
  'iPad (8th Gen)': {
    widthResolution: 810 * 2,
    heightResolution: 1080 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 12.9" (4th Gen)': {
    widthResolution: 1024 * 2,
    heightResolution: 1366 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 11" (2nd Gen)': {
    widthResolution: 834 * 2,
    heightResolution: 1194 * 2,
    pixelRatio: 2,
  },
  'iPad (7th Gen)': {
    widthResolution: 810 * 2,
    heightResolution: 1080 * 2,
    pixelRatio: 2,
  },
  'iPad Air (3rd Gen)': {
    widthResolution: 834 * 2,
    heightResolution: 1112 * 2,
    pixelRatio: 2,
  },
  'iPad mini (5th Gen)': {
    widthResolution: 768 * 2,
    heightResolution: 1024 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 12.9" (3rd Gen)': {
    widthResolution: 1024 * 2,
    heightResolution: 1366 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 11" (1st Gen)': {
    widthResolution: 834 * 2,
    heightResolution: 1194 * 2,
    pixelRatio: 2,
  },
  'iPad (6th Gen)': {
    widthResolution: 768 * 2,
    heightResolution: 1024 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 12.9" (2nd Gen)': {
    widthResolution: 1024 * 2,
    heightResolution: 1366 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 10.5"': {
    widthResolution: 834 * 2,
    heightResolution: 1112 * 2,
    pixelRatio: 2,
  },
  'iPad (5th Gen)': {
    widthResolution: 768 * 2,
    heightResolution: 1024 * 2,
    pixelRatio: 2,
  },
  'iPad Pro 9.7"': {
    widthResolution: 768 * 2,
    heightResolution: 1024 * 2,
    pixelRatio: 2,
  },
  'iPhone 15 Pro Max': {
    widthResolution: 430 * 3,
    heightResolution: 932 * 3,
    pixelRatio: 3,
  },
  'iPhone 15 Pro': {
    widthResolution: 393 * 3,
    heightResolution: 852 * 3,
    pixelRatio: 3,
  },
  'iPhone 15 Plus': {
    widthResolution: 430 * 3,
    heightResolution: 932 * 3,
    pixelRatio: 3,
  },
  'iPhone 15': {
    widthResolution: 393 * 3,
    heightResolution: 852 * 3,
    pixelRatio: 3,
  },
  'iPhone 14 Pro Max': {
    widthResolution: 430 * 3,
    heightResolution: 932 * 3,
    pixelRatio: 3,
  },
  'iPhone 14 Pro': {
    widthResolution: 393 * 3,
    heightResolution: 852 * 3,
    pixelRatio: 3,
  },
  'iPhone 14 Plus': {
    widthResolution: 428 * 3,
    heightResolution: 926 * 3,
    pixelRatio: 3,
  },
  'iPhone 14': {
    widthResolution: 390 * 3,
    heightResolution: 844 * 3,
    pixelRatio: 3,
  },
  'iPhone SE (3rd Gen)': {
    widthResolution: 375 * 2,
    heightResolution: 667 * 2,
    pixelRatio: 2,
  },
  'iPhone 13 Pro Max': {
    widthResolution: 428 * 3,
    heightResolution: 926 * 3,
    pixelRatio: 3,
  },
  'iPhone 13 Pro': {
    widthResolution: 390 * 3,
    heightResolution: 844 * 3,
    pixelRatio: 3,
  },
  'iPhone 13': {
    widthResolution: 390 * 3,
    heightResolution: 844 * 3,
    pixelRatio: 3,
  },
  'iPhone 13 mini': {
    widthResolution: 375 * 3,
    heightResolution: 812 * 3,
    pixelRatio: 3,
  },
  'iPhone 12 Pro Max': {
    widthResolution: 428 * 3,
    heightResolution: 926 * 3,
    pixelRatio: 3,
  },
  'iPhone 12 Pro': {
    widthResolution: 390 * 3,
    heightResolution: 844 * 3,
    pixelRatio: 3,
  },
  'iPhone 12': {
    widthResolution: 390 * 3,
    heightResolution: 844 * 3,
    pixelRatio: 3,
  },
  'iPhone 12 mini': {
    widthResolution: 375 * 3,
    heightResolution: 812 * 3,
    pixelRatio: 3,
  },
  'iPhone SE (2nd Gen)': {
    widthResolution: 375 * 2,
    heightResolution: 667 * 2,
    pixelRatio: 2,
  },
  'iPhone 11 Pro Max': {
    widthResolution: 414 * 3,
    heightResolution: 896 * 3,
    pixelRatio: 3,
  },
  'iPhone 11 Pro': {
    widthResolution: 375 * 3,
    heightResolution: 812 * 3,
    pixelRatio: 3,
  },
  'iPhone 11': {
    widthResolution: 414 * 2,
    heightResolution: 896 * 2,
    pixelRatio: 2,
  },
  'iPhone XS Max': {
    widthResolution: 414 * 3,
    heightResolution: 896 * 3,
    pixelRatio: 3,
  },
  'iPhone XS': {
    widthResolution: 375 * 3,
    heightResolution: 812 * 3,
    pixelRatio: 3,
  },
  'iPhone XR': {
    widthResolution: 414 * 2,
    heightResolution: 896 * 2,
    pixelRatio: 2,
  },
  'iPhone X': {
    widthResolution: 375 * 3,
    heightResolution: 812 * 3,
    pixelRatio: 3,
  },
  'iPhone 8 Plus': {
    widthResolution: 414 * 3,
    heightResolution: 736 * 3,
    pixelRatio: 3,
  },
  'iPhone 8': {
    widthResolution: 375 * 2,
    heightResolution: 667 * 2,
    pixelRatio: 2,
  },
  'iPhone 7 Plus': {
    widthResolution: 414 * 3,
    heightResolution: 736 * 3,
    pixelRatio: 3,
  },
  'iPhone 7': {
    widthResolution: 375 * 2,
    heightResolution: 667 * 2,
    pixelRatio: 2,
  },
  'iPhone SE (1st Gen)': {
    widthResolution: 320 * 2,
    heightResolution: 568 * 2,
    pixelRatio: 2,
  },
};
