import { NodeDeviceService } from '@dogu-tech/device-client';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { ipcMain } from 'electron';
import { deviceLookupClientKey } from '../../src/shares/device-lookup';
import { ChildService } from '../child/child-service';

export class DeviceLookupService {
  static instance: DeviceLookupService;

  static async open(childService: ChildService): Promise<void> {
    const deviceService = new NodeDeviceService();
    const deviceServerPort = await childService.deviceServer.port();
    const deviceClient = new DeviceClient(deviceService, {
      port: deviceServerPort,
    });
    DeviceLookupService.instance = new DeviceLookupService(childService, deviceClient);
    const { instance } = DeviceLookupService;
    ipcMain.handle(deviceLookupClientKey.getPlatformSerials, (_) => deviceClient.getPlatformSerials());
  }

  private constructor(private readonly childService: ChildService, private readonly deviceClient: DeviceClient) {}
}
