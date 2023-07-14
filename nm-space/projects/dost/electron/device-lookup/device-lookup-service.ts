import { DerivedData } from '@dogu-private/device-server';
import { PlatformSerial, Serial } from '@dogu-private/types';
import { NodeDeviceService } from '@dogu-tech/device-client';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { ipcMain } from 'electron';
import { deviceLookupClientKey, DeviceValidateResult } from '../../src/shares/device-lookup';
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
    ipcMain.handle(deviceLookupClientKey.validateDevice, (_, serial) => instance.validateDevice(serial));
  }

  private constructor(private readonly childService: ChildService, private readonly deviceClient: DeviceClient) {}

  private async validateDevice(platformSerial: PlatformSerial): Promise<DeviceValidateResult> {
    if (platformSerial.platform === 'ios') {
      return await this.validateiOSDevice(platformSerial.serial);
    }
    return { isOk: true, error: '' };
  }

  private async validateiOSDevice(serial: Serial): Promise<DeviceValidateResult> {
    const wdaDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.wdaDerivedDataPath());
    if (!wdaDerivedData.hasSerial(serial)) {
      return { isOk: false, error: `WebDriverAgent can't be executed on ${serial}. check provisioning profile then rebuild` };
    }
    const idaDerivedData = await DerivedData.create(HostPaths.external.xcodeProject.idaDerivedDataPath());
    if (!idaDerivedData.hasSerial(serial)) {
      return { isOk: false, error: `iOSDeviceAgent can't be executed on ${serial}. check provisioning profile then rebuild` };
    }
    return { isOk: true, error: '' };
  }
}
