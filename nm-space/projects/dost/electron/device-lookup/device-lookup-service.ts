import { DeviceClient } from '@dogu-tech/device-client-common';
import { ipcMain } from 'electron';
import { deviceLookupClientKey } from '../../src/shares/device-lookup';
import { ChildService } from '../child/child-service';

export class DeviceLookupService {
  static instance: DeviceLookupService;

  static async open(childService: ChildService): Promise<void> {
    const deviceClient = () => childService.deviceServer.client;
    DeviceLookupService.instance = new DeviceLookupService(deviceClient);
    const { instance } = DeviceLookupService;
    ipcMain.handle(deviceLookupClientKey.getPlatformSerials, (_) => deviceClient()?.getPlatformSerials() ?? []);
    ipcMain.handle(deviceLookupClientKey.getDevicesWithError, (_) => deviceClient()?.getDevicesWithError() ?? []);
    ipcMain.handle(deviceLookupClientKey.getDeviceSystemInfo, (_, serial: string) => deviceClient()?.getDeviceSystemInfo(serial) ?? null);
  }

  private constructor(private readonly deviceClient: () => DeviceClient | undefined) {}
}
