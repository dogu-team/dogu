import { Serial } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
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
  | 'WebdriverAgentForward'
  | 'iOSScreenForward'
  | 'iOSGrpcForward';

interface DeviceHostPorts {
  ports: Map<DeviceHostPortType, number>;
}

@Injectable()
export class DevicePortService {
  private serialToHostPortMap: Map<Serial, DeviceHostPorts> = new Map();
  private lock = new AsyncLock();

  public async createOrGetHostPort(serial: Serial, key: DeviceHostPortType): Promise<number> {
    const targetPort = await this.lock.acquire(serial, async () => {
      const deviceHostPorts = this.serialToHostPortMap.get(serial) ?? this.createDeviceHostPorts(serial);
      const targetPort = deviceHostPorts.ports.get(key) ?? (await this.createTargetHostPort(deviceHostPorts, key));
      return targetPort;
    });
    return targetPort;
  }

  public getIosDeviceAgentScreenServerPort(): number {
    return 50001;
  }

  public getIosDeviceAgentGrpcServerPort(): number {
    return 50002;
  }

  public getIosWebDriverAgentServerPort(): number {
    return 50003;
  }

  public getAndroidDeviceAgentServerPort(): number {
    return 50001;
  }

  private createDeviceHostPorts(serial: Serial): DeviceHostPorts {
    const deviceHostPorts = { ports: new Map<DeviceHostPortType, number>() };
    this.serialToHostPortMap.set(serial, deviceHostPorts);
    return deviceHostPorts;
  }

  private async createTargetHostPort(deviceHostPorts: DeviceHostPorts, key: DeviceHostPortType): Promise<number> {
    const port = await getFreePort();
    deviceHostPorts.ports.set(key, port);
    return port;
  }
}
