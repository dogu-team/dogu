import { Vendor } from './type';

export interface DeviceScreen {
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
}

export class Device {
  public readonly name: string;
  public readonly vendor: Vendor;
  public readonly releaseDate: number;
  public readonly screen: DeviceScreen;

  constructor(name: string, vendor: Vendor, releaseDate: number, screen: DeviceScreen) {
    this.name = name;
    this.vendor = vendor;
    this.releaseDate = releaseDate;
    this.screen = screen;
  }
}

export const devices: Device[] = [
  // new Device('4K Desktop', 'Desktop', 2023, { viewportWidth: 3840, viewportHeight: 2160, pixelRatio: 1 }),
  // new Device('QHD Desktop', 'Desktop', 2023, { viewportWidth: 2560, viewportHeight: 1440, pixelRatio: 1 }),
  new Device('FHD Desktop', 'Desktop', 2023, { viewportWidth: 1920, viewportHeight: 1080, pixelRatio: 1 }),

  // new Device('Galaxy Z Flip 3', 'Samsung', 2021, { viewportWidth: 360, viewportHeight: 880, pixelRatio: 2 }),

  new Device('Galaxy Tab S9 FE Plus', 'Samsung', 2023, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S9 FE', 'Samsung', 2023, { viewportWidth: 1440 / 2, viewportHeight: 2304 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S9 Ultra', 'Samsung', 2023, { viewportWidth: 1848 / 2, viewportHeight: 2960 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S9 Plus', 'Samsung', 2023, { viewportWidth: 1752 / 2, viewportHeight: 2800 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S9', 'Samsung', 2023, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S8 Ultra', 'Samsung', 2022, { viewportWidth: 1848 / 2, viewportHeight: 2960 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S8 Plus', 'Samsung', 2022, { viewportWidth: 1752 / 2, viewportHeight: 2800 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S8', 'Samsung', 2022, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S7 FE', 'Samsung', 2021, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S7 Plus', 'Samsung', 2020, { viewportWidth: 1752 / 2, viewportHeight: 2800 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S7', 'Samsung', 2020, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S6 Lite', 'Samsung', 2020, { viewportWidth: 1200 / 2, viewportHeight: 2000 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S6', 'Samsung', 2019, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S5e', 'Samsung', 2019, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S4', 'Samsung', 2018, { viewportWidth: 1600 / 2, viewportHeight: 2560 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab S3', 'Samsung', 2017, { viewportWidth: 1536 / 2, viewportHeight: 2048 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A7 Lite', 'Samsung', 2021, { viewportWidth: 800 / 2, viewportHeight: 1340 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A8 10.5', 'Samsung', 2021, { viewportWidth: 1200 / 2, viewportHeight: 1920 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A7', 'Samsung', 2020, { viewportWidth: 1200 / 2, viewportHeight: 2000 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A 8.4', 'Samsung', 2020, { viewportWidth: 1200 / 2, viewportHeight: 1920 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A 10.1', 'Samsung', 2019, { viewportWidth: 1200 / 2, viewportHeight: 1920 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A 8.0 (2019)', 'Samsung', 2019, { viewportWidth: 800 / 2, viewportHeight: 1280 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A 10.5', 'Samsung', 2018, { viewportWidth: 1200 / 2, viewportHeight: 1920 / 2, pixelRatio: 2 }),
  new Device('Galaxy Tab A 8.0 (2017)', 'Samsung', 2017, { viewportWidth: 800 / 2, viewportHeight: 1280 / 2, pixelRatio: 2 }),

  new Device('Galaxy S23 Ultra', 'Samsung', 2023, { viewportWidth: 360, viewportHeight: 772, pixelRatio: 3 }),
  new Device('Galaxy S23 Plus', 'Samsung', 2023, { viewportWidth: 384, viewportHeight: 780, pixelRatio: 3 }),
  new Device('Galaxy S23', 'Samsung', 2023, { viewportWidth: 360, viewportHeight: 780, pixelRatio: 3 }),
  new Device('Galaxy S22 Ultra', 'Samsung', 2022, { viewportWidth: 384, viewportHeight: 824, pixelRatio: 3.75 }),
  new Device('Galaxy S22 Plus', 'Samsung', 2022, { viewportWidth: 384, viewportHeight: 832, pixelRatio: 2.8125 }),
  new Device('Galaxy S22', 'Samsung', 2022, { viewportWidth: 360, viewportHeight: 780, pixelRatio: 3 }),
  new Device('Galaxy S21 Ultra', 'Samsung', 2021, { viewportWidth: 412, viewportHeight: 915, pixelRatio: 2.625 }),
  new Device('Galaxy S21 Plus', 'Samsung', 2021, { viewportWidth: 384, viewportHeight: 854, pixelRatio: 2.8125 }),
  new Device('Galaxy S21', 'Samsung', 2021, { viewportWidth: 360, viewportHeight: 800, pixelRatio: 3 }),
  new Device('Galaxy S20 Ultra', 'Samsung', 2020, { viewportWidth: 412, viewportHeight: 915, pixelRatio: 2.625 }),
  new Device('Galaxy S20 Plus', 'Samsung', 2020, { viewportWidth: 384, viewportHeight: 854, pixelRatio: 2.625 }),
  new Device('Galaxy S20', 'Samsung', 2020, { viewportWidth: 360, viewportHeight: 800, pixelRatio: 3 }),
  new Device('Galaxy S10 Plus', 'Samsung', 2019, { viewportWidth: 412, viewportHeight: 869, pixelRatio: 3.5 }),
  new Device('Galaxy S10', 'Samsung', 2019, { viewportWidth: 360, viewportHeight: 760, pixelRatio: 4 }),
  new Device('Galaxy S9 Plus', 'Samsung', 2018, { viewportWidth: 412, viewportHeight: 846, pixelRatio: 4 }),
  new Device('Galaxy S9', 'Samsung', 2018, { viewportWidth: 360, viewportHeight: 740, pixelRatio: 4 }),
  new Device('Galaxy S8', 'Samsung', 2017, { viewportWidth: 360, viewportHeight: 740, pixelRatio: 4 }),

  new Device('iPad Pro 12.9" (6th Gen)', 'Apple', 2022, { viewportWidth: 1024, viewportHeight: 1366, pixelRatio: 2 }),
  new Device('iPad Pro 11" (4th Gen)', 'Apple', 2022, { viewportWidth: 834, viewportHeight: 1194, pixelRatio: 2 }),
  new Device('iPad (10th Gen)', 'Apple', 2022, { viewportWidth: 820, viewportHeight: 1180, pixelRatio: 2 }),
  new Device('iPad Air (5th Gen)', 'Apple', 2022, { viewportWidth: 820, viewportHeight: 1180, pixelRatio: 2 }),
  new Device('iPad (9th Gen)', 'Apple', 2021, { viewportWidth: 810, viewportHeight: 1080, pixelRatio: 2 }),
  new Device('iPad mini (6th Gen)', 'Apple', 2021, { viewportWidth: 744, viewportHeight: 1133, pixelRatio: 2 }),
  new Device('iPad Pro 12.9" (5th Gen)', 'Apple', 2021, { viewportWidth: 1024, viewportHeight: 1366, pixelRatio: 2 }),
  new Device('iPad Pro 11" (3rd Gen)', 'Apple', 2021, { viewportWidth: 834, viewportHeight: 1194, pixelRatio: 2 }),
  new Device('iPad Air (4th Gen)', 'Apple', 2020, { viewportWidth: 820, viewportHeight: 1180, pixelRatio: 2 }),
  new Device('iPad (8th Gen)', 'Apple', 2020, { viewportWidth: 810, viewportHeight: 1080, pixelRatio: 2 }),
  new Device('iPad Pro 12.9" (4th Gen)', 'Apple', 2020, { viewportWidth: 1024, viewportHeight: 1366, pixelRatio: 2 }),
  new Device('iPad Pro 11" (2nd Gen)', 'Apple', 2020, { viewportWidth: 834, viewportHeight: 1194, pixelRatio: 2 }),
  new Device('iPad (7th Gen)', 'Apple', 2019, { viewportWidth: 810, viewportHeight: 1080, pixelRatio: 2 }),
  new Device('iPad Air (3rd Gen)', 'Apple', 2019, { viewportWidth: 834, viewportHeight: 1112, pixelRatio: 2 }),
  new Device('iPad mini (5th Gen)', 'Apple', 2019, { viewportWidth: 768, viewportHeight: 1024, pixelRatio: 2 }),
  new Device('iPad Pro 12.9" (3rd Gen)', 'Apple', 2018, { viewportWidth: 1024, viewportHeight: 1366, pixelRatio: 2 }),
  new Device('iPad Pro 11" (1st Gen)', 'Apple', 2018, { viewportWidth: 834, viewportHeight: 1194, pixelRatio: 2 }),
  new Device('iPad (6th Gen)', 'Apple', 2018, { viewportWidth: 768, viewportHeight: 1024, pixelRatio: 2 }),
  new Device('iPad Pro 12.9" (2nd Gen)', 'Apple', 2017, { viewportWidth: 1024, viewportHeight: 1366, pixelRatio: 2 }),
  new Device('iPad Pro 10.5"', 'Apple', 2017, { viewportWidth: 834, viewportHeight: 1112, pixelRatio: 2 }),
  new Device('iPad (5th Gen)', 'Apple', 2017, { viewportWidth: 768, viewportHeight: 1024, pixelRatio: 2 }),
  new Device('iPad Pro 9.7"', 'Apple', 2016, { viewportWidth: 768, viewportHeight: 1024, pixelRatio: 2 }),

  new Device('iPhone 15 Pro Max', 'Apple', 2023, { viewportWidth: 430, viewportHeight: 932, pixelRatio: 3 }),
  new Device('iPhone 15 Pro', 'Apple', 2023, { viewportWidth: 393, viewportHeight: 852, pixelRatio: 3 }),
  new Device('iPhone 15 Plus', 'Apple', 2023, { viewportWidth: 430, viewportHeight: 932, pixelRatio: 3 }),
  new Device('iPhone 15', 'Apple', 2023, { viewportWidth: 393, viewportHeight: 852, pixelRatio: 3 }),
  new Device('iPhone 14 Pro Max', 'Apple', 2022, { viewportWidth: 430, viewportHeight: 932, pixelRatio: 3 }),
  new Device('iPhone 14 Pro', 'Apple', 2022, { viewportWidth: 393, viewportHeight: 852, pixelRatio: 3 }),
  new Device('iPhone 14 Plus', 'Apple', 2022, { viewportWidth: 428, viewportHeight: 926, pixelRatio: 3 }),
  new Device('iPhone 14', 'Apple', 2022, { viewportWidth: 390, viewportHeight: 844, pixelRatio: 3 }),
  new Device('iPhone SE (3rd Gen)', 'Apple', 2022, { viewportWidth: 375, viewportHeight: 667, pixelRatio: 2 }),
  new Device('iPhone 13 Pro Max', 'Apple', 2021, { viewportWidth: 428, viewportHeight: 926, pixelRatio: 3 }),
  new Device('iPhone 13 Pro', 'Apple', 2021, { viewportWidth: 390, viewportHeight: 844, pixelRatio: 3 }),
  new Device('iPhone 13', 'Apple', 2021, { viewportWidth: 390, viewportHeight: 844, pixelRatio: 3 }),
  new Device('iPhone 13 mini', 'Apple', 2021, { viewportWidth: 375, viewportHeight: 812, pixelRatio: 3 }),
  new Device('iPhone 12 Pro Max', 'Apple', 2020, { viewportWidth: 428, viewportHeight: 926, pixelRatio: 3 }),
  new Device('iPhone 12 Pro', 'Apple', 2020, { viewportWidth: 390, viewportHeight: 844, pixelRatio: 3 }),
  new Device('iPhone 12', 'Apple', 2020, { viewportWidth: 390, viewportHeight: 844, pixelRatio: 3 }),
  new Device('iPhone 12 mini', 'Apple', 2020, { viewportWidth: 375, viewportHeight: 812, pixelRatio: 3 }),
  new Device('iPhone SE (2nd Gen)', 'Apple', 2020, { viewportWidth: 375, viewportHeight: 667, pixelRatio: 2 }),
  new Device('iPhone 11 Pro Max', 'Apple', 2019, { viewportWidth: 414, viewportHeight: 896, pixelRatio: 3 }),
  new Device('iPhone 11 Pro', 'Apple', 2019, { viewportWidth: 375, viewportHeight: 812, pixelRatio: 3 }),
  new Device('iPhone 11', 'Apple', 2019, { viewportWidth: 414, viewportHeight: 896, pixelRatio: 2 }),
  new Device('iPhone XS Max', 'Apple', 2018, { viewportWidth: 414, viewportHeight: 896, pixelRatio: 3 }),
  new Device('iPhone XS', 'Apple', 2018, { viewportWidth: 375, viewportHeight: 812, pixelRatio: 3 }),
  new Device('iPhone XR', 'Apple', 2018, { viewportWidth: 414, viewportHeight: 896, pixelRatio: 2 }),
  new Device('iPhone X', 'Apple', 2017, { viewportWidth: 375, viewportHeight: 812, pixelRatio: 3 }),
  new Device('iPhone 8 Plus', 'Apple', 2017, { viewportWidth: 414, viewportHeight: 736, pixelRatio: 3 }),
  new Device('iPhone 8', 'Apple', 2017, { viewportWidth: 375, viewportHeight: 667, pixelRatio: 2 }),
  new Device('iPhone 7 Plus', 'Apple', 2016, { viewportWidth: 414, viewportHeight: 736, pixelRatio: 3 }),
  new Device('iPhone 7', 'Apple', 2016, { viewportWidth: 375, viewportHeight: 667, pixelRatio: 2 }),
  new Device('iPhone SE (1st Gen)', 'Apple', 2016, { viewportWidth: 320, viewportHeight: 568, pixelRatio: 2 }),
];

type DevicesByDisplay = {
  [display: string]: Device[];
};

export function getDevicesByDisplay(includeVendors: Vendor[]) {
  const devicesByDisplay: DevicesByDisplay = {};

  for (const device of devices) {
    if (includeVendors.includes(device.vendor)) {
      const display = `${device.screen.viewportWidth}x${device.screen.viewportHeight}`;
      const deviceByDisplay = devicesByDisplay[display];

      if (deviceByDisplay) {
        deviceByDisplay.push(device);
      } else {
        devicesByDisplay[display] = [device];
      }
    }
  }

  return devicesByDisplay;
}
