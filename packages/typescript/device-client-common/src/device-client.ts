import { Class, Closable, errorify, Instance, Log, stringify, transformAndValidate, WebSocketSpec } from '@dogu-tech/common';
import { DeviceInterface } from '@dogu-tech/device-interface';
import { DeviceSystemInfo, FilledRuntimeInfo, LocaleCodeDto, PlatformSerial, Serial } from '@dogu-tech/types';
import { DeviceClientOptions, DeviceCloser, DeviceService, DeviceWebSocket } from './bases';
import { DeviceHttpClient } from './device-http-client';
import { Device } from './specs/http/device';
import { AppiumContextInfo } from './specs/http/device-dtos';
import { DeviceForward } from './specs/ws/device/forward';
import { DeviceInstallApp } from './specs/ws/device/install-app';
import { DeviceLogSubscribe } from './specs/ws/device/log-subscribe';
import { DeviceRunApp } from './specs/ws/device/run-app';
import { DeviceRuntimeInfoSubscribe } from './specs/ws/device/runtime-info-subscribe';
import { DeviceUninstallApp } from './specs/ws/device/uninstall-app';

export class DeviceClient extends DeviceHttpClient implements DeviceInterface {
  constructor(deviceService: DeviceService, options?: DeviceClientOptions) {
    super(deviceService, options);
  }

  private execute<S extends Class<S>, R>(spec: WebSocketSpec<S, R>, sendMessage: Instance<S>): Promise<void> {
    return new Promise((resolve, reject) => {
      const { path } = spec;
      const deviceWebSocket = this.deviceService.connectWebSocket(
        {
          path,
          query: undefined,
        },
        this.options,
        {
          onOpen() {
            deviceWebSocket.send(JSON.stringify(sendMessage));
          },
          onClose(ev) {
            const { code, reason } = ev;
            if (code !== 1000) {
              reject(new Error(`Unexpected close: ${code} ${reason.toString()}`));
              return;
            }
            resolve();
          },
        },
      );
    });
  }

  async getPlatformSerials(): Promise<PlatformSerial[]> {
    const response = await this.httpRequest(Device.getDevicePlatformSerials, new Device.getDevicePlatformSerials.pathProvider());
    const { platformSerials } = response;
    return platformSerials;
  }

  async getAppiumContextInfo(serial: Serial): Promise<AppiumContextInfo> {
    const response = await this.httpRequest(Device.getAppiumContextInfo, new Device.getAppiumContextInfo.pathProvider(serial));
    const { info } = response;
    return info;
  }

  async getDeviceSystemInfo(serial: Serial): Promise<DeviceSystemInfo> {
    const response = await this.httpRequest(Device.getDeviceSystemInfo, new Device.getDeviceSystemInfo.pathProvider(serial));
    return response;
  }

  async changeDeviceLocale(serial: Serial, localeCode: LocaleCodeDto): Promise<void> {
    await this.httpRequest(Device.changeLocale, new Device.changeLocale.pathProvider(serial), undefined, localeCode);
  }

  installApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceInstallApp, {
      serial,
      appPath,
    });
  }

  uninstallApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceUninstallApp, {
      serial,
      appPath,
    });
  }

  runApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceRunApp, {
      serial,
      appPath,
    });
  }

  private subscribe<S extends Class<S>, R>(
    spec: WebSocketSpec<S, R>,
    query: Record<string, unknown> | undefined,
    onOpen: (deviceWebSocket: DeviceWebSocket) => void,
    onMessage: (message: string) => void,
  ): Promise<Closable> {
    return new Promise((resolve, reject) => {
      const { path } = spec;
      const { printable } = this.options;
      let isOpened = false;
      const deviceWebSocket = this.deviceService.connectWebSocket(
        {
          path,
          query,
        },
        this.options,
        {
          onOpen() {
            isOpened = true;
            onOpen(deviceWebSocket);
            resolve(new DeviceCloser(deviceWebSocket));
          },
          onClose(ev) {
            const { code, reason } = ev;
            if (!isOpened) {
              reject(new Error(`Unexpected close: ${code} ${reason.toString()}`));
              return;
            }
          },
          onMessage(ev) {
            const { value } = ev;
            if (value === undefined) {
              return;
            }
            const { $case } = value;
            let stringValue = '';
            if ($case === 'bytesValue') {
              const { bytesValue } = value;
              stringValue = Buffer.from(bytesValue).toString();
            } else if ($case === 'stringValue') {
              stringValue = value.stringValue;
            } else {
              throw new Error(`Unexpected $case: ${stringify(value)}`);
            }
            onMessage(stringValue);
          },
        },
      );
    });
  }

  forward(serial: Serial, hostPort: number, devicePort: number): Promise<Closable> {
    const { printable } = this.options;
    let returningClosable: Closable | null = null;
    let resolvedOrRejected = false;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (resolvedOrRejected) {
          return;
        }
        resolvedOrRejected = true;
        returningClosable?.close();
        reject(new Error(`Timeout to forward`));
      }, 30 * 1000);
      this.subscribe(
        DeviceForward,
        undefined,
        (deviceServerWebSocket) => {
          const sendMessage: Instance<typeof DeviceForward.sendMessage> = {
            serial,
            hostPort,
            devicePort,
          };
          deviceServerWebSocket.send(JSON.stringify(sendMessage));
        },
        (message) => {
          const parsed = JSON.parse(message) as Instance<typeof DeviceForward.receiveMessage>;
          const { value } = parsed;
          const { kind } = value;
          if (kind === 'DeviceForwardReceiveMessageLogValue') {
            // noop
          } else if (kind === 'DeviceForwardReceiveMessageResultValue') {
            const { success } = value;
            if (success) {
              if (returningClosable === null) {
                throw new Error(`Unexpected returningClosable`);
              }
              clearTimeout(timeout);
              if (resolvedOrRejected) {
                return;
              }
              resolvedOrRejected = true;
              resolve(returningClosable);
            } else {
              clearTimeout(timeout);
              if (resolvedOrRejected) {
                return;
              }
              resolvedOrRejected = true;
              returningClosable?.close();
              reject(new Error(`Failed to forward`));
            }
          } else {
            throw new Error(`Unexpected kind: ${stringify(kind)}`);
          }
        },
      )
        .then((closable) => {
          returningClosable = closable;
        })
        .catch((error) => {
          returningClosable = null;
          printable.error?.(`Failed to forward`, { error: errorify(error) });
        });
    });
  }

  subscribeRuntimeInfo(serial: Serial, onRuntimeInfo: (runtimeInfo: FilledRuntimeInfo) => void): Promise<Closable> {
    return this.subscribe(
      DeviceRuntimeInfoSubscribe,
      undefined,
      (deviceServerWebSocket) => {
        const sendMessage: Instance<typeof DeviceRuntimeInfoSubscribe.sendMessage> = {
          serial,
        };
        deviceServerWebSocket.send(JSON.stringify(sendMessage));
      },
      (message) => {
        const { printable } = this.options;
        (async (): Promise<void> => {
          const receiveMessage = await transformAndValidate(DeviceRuntimeInfoSubscribe.receiveMessage, JSON.parse(message));
          const { runtimeInfo } = receiveMessage;
          onRuntimeInfo(runtimeInfo);
        })().catch((error) => {
          printable.error?.(`Failed to parse message`, { message, error: stringify(error) });
        });
      },
    );
  }

  subscribeLog(serial: Serial, args: string[], onLog: (log: Log) => void): Promise<Closable> {
    return this.subscribe(
      DeviceLogSubscribe,
      undefined,
      (deviceServerWebSocket) => {
        const sendMessage: Instance<typeof DeviceLogSubscribe.sendMessage> = {
          serial,
          args,
        };
        deviceServerWebSocket.send(JSON.stringify(sendMessage));
      },
      (message) => {
        const { printable } = this.options;
        (async (): Promise<void> => {
          const receiveMessage = await transformAndValidate(DeviceLogSubscribe.receiveMessage, JSON.parse(message));
          onLog(receiveMessage);
        })().catch((error) => {
          printable.error?.(`Failed to parse message`, { message, error: stringify(error) });
        });
      },
    );
  }
}
