import { Vendor } from '@dogu-private/device-data';

export const getVendorColor = (vendor: Vendor) => {
  switch (vendor) {
    case 'Apple':
      return '#A5A5A5';
    case 'Samsung':
      return '#142D9B';
    default:
      return '#000000';
  }
};
