import { Device } from '@dogu-private/device-data';
import { Sharp } from 'sharp';

export interface WebResponsiveWorkerData {
  device: Device;
  width: number;
  height: number;
  url: string;
}

export type WebResponsiveImages = {
  [url: string]: {
    [display: string]: Sharp;
  };
};
