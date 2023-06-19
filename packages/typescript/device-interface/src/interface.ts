import { Closable } from '@dogu-tech/common';
import { PlatformSerial, Serial } from '@dogu-tech/types';

export interface DeviceInterface {
  getPlatformSerials(): Promise<PlatformSerial[]>;
  installApp(serial: Serial, appPath: string): Promise<void>;
  uninstallApp(serial: Serial, appPath: string): Promise<void>;
  runApp(serial: Serial, appPath: string): Promise<void>;
  forward(serial: Serial, hostPort: number, devicePort: number): Promise<Closable>;
}
