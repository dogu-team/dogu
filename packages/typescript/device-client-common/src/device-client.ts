import { Class, Closable, errorify, Instance, Log, stringify, transformAndValidate, WebSocketSpec } from '@dogu-tech/common';
import { DeviceAlert, DeviceFoldStatus, DeviceSystemInfo, FilledRuntimeInfo, GeoLocation, LocaleCode, PlatformSerial, Serial } from '@dogu-tech/types';
import { DeviceAlertSubscribe } from '.';
import { DeviceClientOptions, DeviceCloser, DeviceService, DeviceWebSocket } from './bases';
import { DeviceHttpClient } from './device-http-client';
import { DeviceInterface } from './interface';
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

  private async execute<S extends Class<S>, R>(spec: WebSocketSpec<S, R>, sendMessage: Instance<S>): Promise<void> {
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

  async getHearbeat(serial: Serial): Promise<void> {
    await this.httpRequest(Device.getHeartbeat, new Device.getHeartbeat.pathProvider(serial));
  }

  async getDeviceSystemInfo(serial: Serial): Promise<DeviceSystemInfo> {
    const response = await this.httpRequest(Device.getDeviceSystemInfo, new Device.getDeviceSystemInfo.pathProvider(serial));
    return response;
  }

  async getLocale(serial: Serial): Promise<LocaleCode> {
    const response = await this.httpRequest(Device.getLocale, new Device.getLocale.pathProvider(serial));
    return response.localeCode;
  }

  async setLocale(serial: Serial, localeCode: LocaleCode): Promise<void> {
    await this.httpRequest(Device.setLocale, new Device.setLocale.pathProvider(serial), undefined, localeCode);
  }

  async getGeoLocation(serial: Serial): Promise<GeoLocation> {
    const response = await this.httpRequest(Device.getGeoLocation, new Device.getGeoLocation.pathProvider(serial));
    return response.location;
  }

  async setGeoLocation(serial: Serial, location: GeoLocation): Promise<void> {
    await this.httpRequest(Device.setGeoLocation, new Device.setGeoLocation.pathProvider(serial), undefined, location);
  }

  async getFoldStatus(serial: Serial): Promise<DeviceFoldStatus> {
    const response = await this.httpRequest(Device.getFoldStatus, new Device.getFoldStatus.pathProvider(serial));
    return response;
  }

  async fold(serial: Serial, fold: boolean): Promise<void> {
    await this.httpRequest(Device.fold, new Device.fold.pathProvider(serial), undefined, { fold });
  }

  async screenshot(serial: Serial): Promise<string> {
    const response = await this.httpRequest(Device.getScreenshot, new Device.getScreenshot.pathProvider(serial));
    return response.base64;
  }

  async installApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceInstallApp, {
      serial,
      appPath,
    });
  }

  async uninstallApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceUninstallApp, {
      serial,
      appPath,
    });
  }

  async runApp(serial: Serial, appPath: string): Promise<void> {
    return this.execute(DeviceRunApp, {
      serial,
      appPath,
    });
  }

  private async subscribe<S extends Class<S>, R>(
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

  async forward(serial: Serial, hostPort: number, devicePort: number): Promise<Closable> {
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

  async subscribeRuntimeInfo(serial: Serial, onRuntimeInfo: (runtimeInfo: FilledRuntimeInfo) => void): Promise<Closable> {
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

  async subscribeLog(serial: Serial, args: string[], onLog: (log: Log) => void): Promise<Closable> {
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

  async subscribeAlert(serial: Serial, callback: { onAlert: (alert: DeviceAlert) => void; onClose: (alert: DeviceAlert) => void }): Promise<Closable> {
    return this.subscribe(
      DeviceAlertSubscribe,
      undefined,
      (deviceServerWebSocket) => {
        const sendMessage: Instance<typeof DeviceAlertSubscribe.sendMessage> = {
          serial,
        };
        deviceServerWebSocket.send(JSON.stringify(sendMessage));
      },
      (message) => {
        const { printable } = this.options;
        (async (): Promise<void> => {
          const receiveMessage = await transformAndValidate(DeviceAlertSubscribe.receiveMessage, JSON.parse(message));
          if (receiveMessage.value.kind === 'DeviceAlertSubscribeReceiveMessageOnShowValue') {
            callback.onAlert(receiveMessage.value);
            return;
          } else if (receiveMessage.value.kind === 'DeviceAlertSubscribeReceiveMessageOnCloseValue') {
            callback.onClose(receiveMessage.value);
            return;
          } else {
            throw new Error(`Unexpected kind: ${stringify(receiveMessage)}`);
          }
        })().catch((error) => {
          printable.error?.(`Failed to parse message`, { message, error: stringify(error) });
        });
      },
    );
  }
}
