import { closeWebSocketWithTruncateReason, errorify, Instance, stringify, transformAndValidate, WebSocketSpec } from '@dogu-tech/common';
import { DeviceHostUploadFileReceiveMessage, DeviceHostUploadFileSendMessage, isAllowedBrowserName, isAllowedBrowserPlatform, ThirdPartyPathMap } from '@dogu-tech/types';
import { DeviceClientOptions, DeviceCloser, DeviceService, DeviceWebSocket, HostFileUploader } from './bases';
import { DeviceHttpClient } from './device-http-client';
import { DeviceHost } from './specs/http/device-host';
import { DeviceHostDownloadSharedResource } from './specs/ws/device-host/download-shared-resource';
import { DeviceHostEnsureBrowserAndDriver } from './specs/ws/device-host/ensure-browser-and-driver';
import { DeviceHostUploadFile } from './specs/ws/device-host/upload-file';

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

  async getPathMap(): Promise<ThirdPartyPathMap> {
    const response = await this.httpRequest(DeviceHost.getPathMap, new DeviceHost.getPathMap.pathProvider());
    const { pathMap } = response;
    return pathMap;
  }

  private async connectWebSocket<SendMessageType, ReceiveMessageType, ReturnType>(
    webSocketSpec: WebSocketSpec<SendMessageType, ReceiveMessageType>,
    onOpen: (deviceWebSocket: DeviceWebSocket) => ReturnType,
    onClose: (code: number, reason: string) => void,
    onMessage: (value: string | Uint8Array, deviceWebSocket: DeviceWebSocket) => void,
  ): Promise<ReturnType> {
    return new Promise((resolve, reject) => {
      let isOpened = false;
      const path = webSocketSpec.path;
      const deviceWebSocket = this.deviceService.connectWebSocket(
        {
          path,
        },
        this.options,
        {
          onOpen() {
            isOpened = true;
            resolve(onOpen(deviceWebSocket));
          },
          onClose(ev) {
            const { code, reason } = ev;
            if (!isOpened) {
              reject(new Error(`Unexpected close: ${code} ${reason}`));
              return;
            }
            onClose(code, reason);
          },
          onMessage(ev) {
            const { value } = ev;
            if (!value) {
              throw new Error(`Unexpected data: ${stringify(ev)}`);
            }
            const { $case } = value;
            if ($case === 'bytesValue') {
              onMessage(value.bytesValue, deviceWebSocket);
            } else if ($case === 'stringValue') {
              onMessage(value.stringValue, deviceWebSocket);
            } else {
              throw new Error(`Unexpected data: ${stringify(value)}`);
            }
          },
        },
      );
    });
  }

  async uploadFile(fileName: string, fileSize: number, onProgress: (offset: number) => void, onComplete: (filePath: string, error?: Error) => void): Promise<HostFileUploader> {
    return this.connectWebSocket(
      DeviceHostUploadFile,
      (deviceWebSocket) => {
        const sendMessage: Instance<typeof DeviceHostUploadFile.sendMessage> = {
          value: {
            $case: 'start',
            start: {
              fileName,
              fileSize,
            },
          },
        };
        deviceWebSocket.send(DeviceHostUploadFileSendMessage.encode(sendMessage).finish());
        return new HostFileUploader(deviceWebSocket);
      },
      (code, reason) => {
        if (code === 1000) {
          return;
        }
        onComplete('', new Error(`Unexpected close: ${code} ${reason}`));
      },
      (value, deviceWebSocket) => {
        if (!(value instanceof Uint8Array)) {
          throw new Error(`Unexpected data: ${stringify(value)}`);
        }

        const receiveMessage = DeviceHostUploadFileReceiveMessage.decode(value);
        if (!receiveMessage.value) {
          throw new Error(`Empty data: ${stringify(receiveMessage)}`);
        }
        const { $case } = receiveMessage.value;
        if ($case === 'inProgress') {
          const { offset } = receiveMessage.value.inProgress;
          onProgress(offset);
        } else if ($case === 'complete') {
          const { filePath } = receiveMessage.value.complete;

          onComplete(filePath);
          deviceWebSocket.close(1000, 'OK');
        }
      },
    );
  }

  async downloadSharedResource(filePath: string, url: string, expectedFileSize: number, headers?: Record<string, string>): Promise<void> {
    const { printable } = this.options;
    return new Promise((resolve, reject) => {
      this.connectWebSocket(
        DeviceHostDownloadSharedResource,
        (deviceWebSocket) => {
          const sendMessage: Instance<typeof DeviceHostDownloadSharedResource.sendMessage> = {
            url,
            headers,
            filePath,
            expectedFileSize,
          };
          deviceWebSocket.send(JSON.stringify(sendMessage));
          return new DeviceCloser(deviceWebSocket);
        },
        (code, reason) => {
          if (code === 1000) {
            resolve();
          } else {
            reject(new Error(`Unexpected close: ${code} ${reason}`));
          }
        },
        (value, deviceWebSocket) => {
          const casted = typeof value === 'string' ? value : Buffer.from(value).toString();
          transformAndValidate(DeviceHostDownloadSharedResource.receiveMessage, JSON.parse(casted))
            .then((message) => {
              const { responseCode, responseHeaders } = message;
              printable.info('Download Complete', {
                filePath,
                responseCode,
                responseHeaders,
              });
            })
            .catch((error) => {
              printable.error('Failed to parse download shared resource message', { error: errorify(error) });
              closeWebSocketWithTruncateReason(deviceWebSocket, 1001, 'download shared resource failed');
            });
        },
      )
        .then((closer) => {
          // noop
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async ensureBrowserAndDriver(
    params: {
      browserName: string;
      browserVersion: string;
      browserPlatform: string;
      deviceSerial: string;
    },
    options?: {
      timeoutMilliseconds?: number;
    },
  ): Promise<Instance<typeof DeviceHostEnsureBrowserAndDriver.receiveMessage>> {
    const { printable } = this.options;
    const { browserName, browserVersion, browserPlatform, deviceSerial } = params;
    const timeoutMilliseconds = options?.timeoutMilliseconds ?? 60_000;

    return await new Promise((resolve, reject) => {
      let fulfilled = false;
      let timeout: NodeJS.Timeout | null = setTimeout(() => {
        if (fulfilled) {
          return;
        }
        fulfilled = true;
        reject(new Error(`Ensure browser and driver timeout: ${timeoutMilliseconds}ms`));
      });

      const _resolve = (value: Instance<typeof DeviceHostEnsureBrowserAndDriver.receiveMessage>): void => {
        if (fulfilled) {
          return;
        }
        fulfilled = true;

        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        resolve(value);
      };

      const _reject = (error: Error): void => {
        if (fulfilled) {
          return;
        }
        fulfilled = true;

        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        reject(error);
      };

      this.connectWebSocket(
        DeviceHostEnsureBrowserAndDriver,
        (deviceWebSocket) => {
          if (!isAllowedBrowserName(browserName)) {
            _reject(new Error(`Invalid browser name: ${browserName}`));
            return;
          }

          if (!isAllowedBrowserPlatform(browserPlatform)) {
            _reject(new Error(`Invalid browser platform: ${browserPlatform}`));
            return;
          }

          const sendMessage: Instance<typeof DeviceHostEnsureBrowserAndDriver.sendMessage> = {
            browserName,
            requestedBrowserVersion: browserVersion,
            browserPlatform,
            deviceSerial,
          };
          deviceWebSocket.send(JSON.stringify(sendMessage));
          return new DeviceCloser(deviceWebSocket);
        },
        (code, reason) => {
          if (code === 1000) {
            // noop
          } else {
            _reject(new Error(`Unexpected close: ${code} ${reason}`));
          }
        },
        (value, deviceWebSocket) => {
          const casted = typeof value === 'string' ? value : Buffer.from(value).toString();
          transformAndValidate(DeviceHostEnsureBrowserAndDriver.receiveMessage, JSON.parse(casted))
            .then((message) => {
              _resolve(message);
            })
            .catch((error) => {
              printable.error('Failed to ensure browser and driver', { error: errorify(error) });
              closeWebSocketWithTruncateReason(deviceWebSocket, 1001, 'ensure browser and driver failed');
            });
        },
      )
        .then((closer) => {
          // noop
        })
        .catch((error) => {
          _reject(errorify(error));
        });
    });
  }
}
