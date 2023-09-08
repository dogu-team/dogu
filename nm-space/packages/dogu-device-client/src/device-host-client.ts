import { DeviceClientOptions } from './bases.js';
import { Instance } from './common/types.js';
import { DeviceHttpClient } from './device-http-client.js';
import { NodeDeviceService } from './node-device-service.js';
import { DeviceHost } from './specs/http/device-host.js';

export class DeviceHostClient extends DeviceHttpClient {
  constructor(options?: DeviceClientOptions) {
    super(new NodeDeviceService(), options);
  }

  async getFreePort(excludes?: number[], offset?: number): Promise<number> {
    const response = await this.httpRequest(DeviceHost.getFreePort, new DeviceHost.getFreePort.pathProvider(), {
      excludes,
      offset,
    });
    const { port } = response;
    return port;
  }

  async ensureBrowserAndDriver(
    options: Instance<typeof DeviceHost.ensureBrowserAndDriver.requestBody>,
  ): Promise<Instance<typeof DeviceHost.ensureBrowserAndDriver.responseBodyData>> {
    const result = await this.httpRequest(DeviceHost.ensureBrowserAndDriver, new DeviceHost.ensureBrowserAndDriver.pathProvider(), undefined, options);
    return result;
  }
}
