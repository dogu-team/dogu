import { Serial } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { getFreePort } from '../internal/util/net';

export type DeviceHostPortType =
  | 'AndroidDeviceAgentService'
  | 'AndroidAppiumServer'
  | 'AndroidAppiumSystemPort'
  | 'AndroidAppiumChromeDriverPort'
  | 'AndroidAppiumMjpegServerPort'
  | 'iOSAppiumServer'
  | 'iOSAppiumMjpegServerPort'
  | 'iOSAppiumWebkitDebugProxyPort'
  | 'WebdriverAgentProcess'
  | 'WebdriverAgentForward'
  | 'iOSScreenForward'
  | 'iOSGrpcForward';

interface DeviceHostPorts {
  ports: Map<DeviceHostPortType, number>;
}

@Injectable()
export class DevicePortService {
  private serialToHostPortMap: Map<Serial, DeviceHostPorts> = new Map();

  public async createOrGetHostPort(serial: Serial, key: DeviceHostPortType): Promise<number> {
    const devicePorts = this.serialToHostPortMap.get(serial) ?? this.createDeviceHostPort(serial);
    const targetPort = devicePorts.ports.get(key) ?? (await this.createTargetHostPort(devicePorts, key));
    return targetPort;
  }

  public getIosDeviceAgentScreenServerPort(): number {
    return 50001;
  }

  public getIosDeviceAgentGrpcServerPort(): number {
    return 50002;
  }

  public getIosWebDriverAgentServerPort(): number {
    return 50002;
  }

  public getAndroidDeviceAgentServerPort(): number {
    return 50001;
  }

  private createDeviceHostPort(serial: Serial): DeviceHostPorts {
    const devicePort = { ports: new Map<DeviceHostPortType, number>() };
    this.serialToHostPortMap.set(serial, devicePort);
    return devicePort;
  }

  private async createTargetHostPort(devicePorts: DeviceHostPorts, key: DeviceHostPortType): Promise<number> {
    const port = await getFreePort();
    devicePorts.ports.set(key, port);
    return port;
  }
}
