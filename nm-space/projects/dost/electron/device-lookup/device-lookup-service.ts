import { DeviceConnectionState, Platform, Serial } from '@dogu-private/types';
import { delay, loop, transformAndValidate } from '@dogu-tech/common';
import { DeviceConnectionSubscribe, DeviceConnectionSubscribeReceiveMessage } from '@dogu-tech/device-client-common';
import { ipcMain } from 'electron';
import WebSocket from 'ws';
import { deviceLookupClientKey } from '../../src/shares/device-lookup';
import { AppConfigService } from '../app-config/app-config-service';
import { ChildService } from '../child/child-service';
import { logger } from '../log/logger.instance';

export class DeviceLookupService {
  static instance: DeviceLookupService;
  private client: WebSocket | null = null;
  private messages: Map<Serial, DeviceConnectionSubscribeReceiveMessage> = new Map<Serial, DeviceConnectionSubscribeReceiveMessage>();

  private constructor(private readonly childService: ChildService, private readonly deviceServerPort: number) {}

  static async open(childService: ChildService, appConfigService: AppConfigService): Promise<void> {
    const DOGU_DEVICE_SERVER_PORT = await appConfigService.get('DOGU_DEVICE_SERVER_PORT');
    DeviceLookupService.instance = new DeviceLookupService(childService, DOGU_DEVICE_SERVER_PORT);
    const { instance } = DeviceLookupService;

    childService.deviceServer.eventEmitter.on('spawn', async () => {
      for await (const _ of loop(1000, 60)) {
        if (await childService.deviceServer.isActive()) {
          break;
        }
      }
      instance.connect();
    });
    childService.deviceServer.eventEmitter.on('close', () => {
      instance.disconnect();
    });

    ipcMain.handle(deviceLookupClientKey.getSubscribeMessages, (_) => {
      const statPriorites = [
        DeviceConnectionState.DEVICE_CONNECTION_STATE_ERROR,
        DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTING,
        DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
      ];
      const platformPriorites = [Platform.PLATFORM_IOS, Platform.PLATFORM_ANDROID, Platform.PLATFORM_MACOS, Platform.PLATFORM_WINDOWS];
      const ret = Array.from(instance.messages.values()).sort((a, b) => {
        const aStatePriority = statPriorites.indexOf(a.state);
        const bStatePriority = statPriorites.indexOf(b.state);
        if (aStatePriority !== bStatePriority) {
          return bStatePriority - aStatePriority;
        }
        const aPlatformPriority = platformPriorites.indexOf(a.platform);
        const bPlatformPriority = platformPriorites.indexOf(b.platform);
        if (aPlatformPriority !== bPlatformPriority) {
          return bPlatformPriority - aPlatformPriority;
        }

        return 0;
      });
      return ret;
    });
  }

  private async doReconnect(): Promise<boolean> {
    return await this.childService.deviceServer.isActive();
  }

  private connect(): void {
    const url = `ws://127.0.0.1:${this.deviceServerPort}${DeviceConnectionSubscribe.path}`;
    this.client = new WebSocket(url);
    this.client.on('open', () => {
      logger.info('DeviceLookupService is connected', {
        url,
      });
    });
    this.client.on('message', (data, isBinary) => {
      if (isBinary) {
        throw new Error('DeviceLookupService received binary data');
      }
      this.onMessage(data.toString()).catch((error) => {
        logger.error(error);
      });
    });
    this.client.on('close', async () => {
      logger.info('DeviceLookupService is disconnected');
      this.disconnect();
      if (await this.doReconnect()) {
        this.delayAndConnect().catch((error) => {
          logger.error(error);
        });
      }
    });
    this.client.on('error', (error) => {
      logger.error('DeviceLookupService error', { error });
    });
    logger.info('DeviceLookupService is connecting');
  }

  private disconnect(): void {
    this.client?.close();
    this.client = null;
  }

  private async delayAndConnect(): Promise<void> {
    logger.info('device server will reconnect after', {
      intervalMilliseconds: 3000,
    });
    await delay(3000);
    this.connect();
  }

  private async onMessage(data: string): Promise<void> {
    const deviceConnectionInfo = await transformAndValidate(DeviceConnectionSubscribe.receiveMessage, JSON.parse(data));
    const { state } = deviceConnectionInfo;
    const prev = this.messages.get(deviceConnectionInfo.serial);
    const newConnectionInfo: DeviceConnectionSubscribeReceiveMessage = {
      ...deviceConnectionInfo,
      errorMessage:
        deviceConnectionInfo.state === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTING
          ? prev?.errorMessage ?? deviceConnectionInfo.errorMessage
          : deviceConnectionInfo.errorMessage,
    };
    this.messages.set(deviceConnectionInfo.serial, newConnectionInfo);
    if (state === DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED) {
      this.messages.delete(deviceConnectionInfo.serial);
    }
  }
}
