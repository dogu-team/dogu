import { DeviceClientOptions, DeviceService } from './bases.js';
import { DeviceHttpClient } from './device-http-client.js';
import { DeviceHost } from './specs/http/device-host.js';

export class DeviceHostClient extends DeviceHttpClient {
  constructor(deviceService: DeviceService, options?: DeviceClientOptions) {
    super(deviceService, options);
  }

  async getFreePort(excludes?: number[], offset?: number): Promise<number> {
    const response = await this.httpRequest(DeviceHost.getFreePort, new DeviceHost.getFreePort.pathProvider(), {
      excludes,
      offset,
    });
    const { port } = response;
    return port;
  }
}
