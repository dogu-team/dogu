import { DeviceBase } from '@dogu-private/console';

export type DeviceWithStatus = DeviceBase & { status: boolean };

export type StreamingMode = 'input' | 'inspect';

export type DeviceLogLevel = 'V' | 'I' | 'D' | 'W' | 'E' | 'F' | 'S';
