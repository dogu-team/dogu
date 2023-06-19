import { DeviceClient, DeviceHostClient, DeviceClientOptions, fillDeviceClientOptions } from '@dogu-tech/device-client-common';
import { NodeDeviceService } from './node-device-service';

export interface DeviceClients {
  deviceClient: DeviceClient;
  deviceHostClient: DeviceHostClient;
}

export class DeviceClientsFactory {
  readonly options: Required<DeviceClientOptions>;

  constructor(options?: DeviceClientOptions) {
    this.options = fillDeviceClientOptions(options);
  }

  create(): DeviceClients {
    const { options } = this;
    const deviceService = new NodeDeviceService();
    const deviceClient = new DeviceClient(deviceService, options);
    const deviceHostClient = new DeviceHostClient(deviceService, options);
    return {
      deviceClient,
      deviceHostClient,
    };
  }
}
