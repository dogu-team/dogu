import { DeviceClientOptions, DeviceCloser, DeviceService, DeviceWebSocket } from './bases.js';
import { errorify, stringify } from './common/functions.js';
import { WebSocketSpec } from './common/specs.js';
import { Class, Instance } from './common/types.js';
import { DeviceHttpClient } from './device-http-client.js';
import { DeviceForward } from './specs/ws/device/forward.js';
import { Serial } from './types/types.js';

export class DeviceClient extends DeviceHttpClient {
  constructor(deviceService: DeviceService, options?: DeviceClientOptions) {
    super(deviceService, options);
  }

  private subscribe<S extends Class<S>, R>(
    spec: WebSocketSpec<S, R>,
    query: Record<string, unknown> | undefined,
    onOpen: (deviceWebSocket: DeviceWebSocket) => void,
    onMessage: (message: string) => void,
  ): Promise<DeviceCloser> {
    return new Promise((resolve, reject) => {
      const { path } = spec;
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

  forward(serial: Serial, hostPort: number, devicePort: number): Promise<DeviceCloser> {
    const { printable } = this.options;
    let returningClosable: DeviceCloser | null = null;
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
}
