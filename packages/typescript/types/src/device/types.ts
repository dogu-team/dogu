import { Platform } from '..';
import { PlatformType } from '../platforms';

export type DeviceId = string;
export type Serial = string;
export type LocalDeviceDetectToken = string;
export const DEVICE_TABLE_NAME = 'device';
export interface PlatformSerial {
  platform: PlatformType;
  serial: Serial;
}

export interface ErrorDevice {
  platform: PlatformType;
  serial: Serial;
  error: Error;
}

export enum DeviceConnectionState {
  /** DEVICE_CONNECTION_STATE_UNSPECIFIED - Not used. must be initialized to a different value. */
  DEVICE_CONNECTION_STATE_UNSPECIFIED = 0,
  DEVICE_CONNECTION_STATE_DISCONNECTED = 1,
  DEVICE_CONNECTION_STATE_CONNECTED = 2,
  UNRECOGNIZED = -1,
}

export interface Device {
  deviceId: string;
  serial: string;
  serialUnique: string;
  name: string;
  platform: Platform;
  model: string;
  modelName?: string | undefined;
  version: string;
  isGlobal: number;
  isHost: number;
  isVirtual: number;
  connectionState: DeviceConnectionState;
  heartbeat: Date | undefined;
  /** relations */
  organizationId: string;
  hostId: string;
  /** timestamps */
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  manufacturer: string;
  resolutionWidth: number;
  resolutionHeight: number;
}
