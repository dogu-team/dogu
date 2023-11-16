import { DeviceConnectionState } from '@dogu-private/types';
import { assertUnreachable, delay, Instance, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DeviceConnectionSubscribe } from '@dogu-tech/device-client';
import {} from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { config } from '../config';
import { env } from '../env';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { HostConnectionInfo } from '../types';
import { OnDeviceConnectedEvent, OnDeviceConnectionSubscriberDisconnectedEvent, OnDeviceDisconnectedEvent } from './device.events';

@Injectable()
export class DeviceConnectionSubscriber {
  private hostConnectionInfo: HostConnectionInfo | null = null;
  private client: WebSocket | null = null;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
  ) {}

  get doReconnect(): boolean {
    return this.hostConnectionInfo !== null;
  }

  @OnEvent(OnHostResolvedEvent.key)
  onHostResolved(value: Instance<typeof OnHostResolvedEvent.value>): void {
    this.hostConnectionInfo = value;
    this.connect();
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.hostConnectionInfo = null;
    this.disconnect();
  }

  private connect(): void {
    const url = `ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceConnectionSubscribe.path}`;
    this.client = new WebSocket(url);
    this.client.on('open', () => {
      this.logger.info('DeviceConnectionStateSubscriber is connected', {
        url,
      });
    });
    this.client.on('message', (data, isBinary) => {
      if (isBinary) {
        throw new Error('DeviceConnectionStateSubscriber received binary data');
      }
      this.onMessage(data.toString()).catch((error) => {
        this.logger.error(error);
      });
    });
    this.client.on('close', () => {
      this.logger.info('DeviceConnectionStateSubscriber is disconnected');
      this.disconnect();
      if (this.doReconnect) {
        this.delayAndConnect().catch((error) => {
          this.logger.error(error);
        });
      }
    });
    this.client.on('error', (error) => {
      this.logger.error('DeviceConnectionStateSubscriber error', { error });
    });
    this.logger.info('DeviceConnectionStateSubscriber is connecting');
  }

  private disconnect(): void {
    this.client?.close();
    this.client = null;
    validateAndEmitEventAsync(this.eventEmitter, OnDeviceConnectionSubscriberDisconnectedEvent, {}).catch((error) => {
      this.logger.error(error);
    });
  }

  private async delayAndConnect(): Promise<void> {
    this.logger.info('device server will reconnect after', {
      intervalMilliseconds: config.device.connectionSubscriber.reconnect.intervalMilliseconds,
    });
    await delay(config.device.connectionSubscriber.reconnect.intervalMilliseconds);
    this.connect();
  }

  private async onMessage(data: string): Promise<void> {
    const deviceConnectionInfo = await transformAndValidate(DeviceConnectionSubscribe.receiveMessage, JSON.parse(data));
    this.logger.info('DeviceConnectionStateSubscriber received message', { deviceConnectionInfo });
    const { state } = deviceConnectionInfo;
    switch (state) {
      case DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED:
        await this.emitOnDeviceConnected(deviceConnectionInfo);
        break;
      case DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED:
        await this.emitOnDeviceDisconnected(deviceConnectionInfo);
        break;
      case DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTING:
      case DeviceConnectionState.DEVICE_CONNECTION_STATE_ERROR:
      case DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED:
      case DeviceConnectionState.UNRECOGNIZED:
        // noop
        break;
      default:
        assertUnreachable(state);
    }
  }

  private async emitOnDeviceConnected(deviceConnectionInfo: Instance<typeof DeviceConnectionSubscribe.receiveMessage>): Promise<void> {
    if (this.hostConnectionInfo === null) {
      throw new Error('host is not connected');
    }
    const { organizationId, hostId } = this.hostConnectionInfo;
    this.logger.info('Event OnDeviceConnectedEvent fired', { deviceConnectionInfo });
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceConnectedEvent, {
      ...deviceConnectionInfo,
      organizationId,
      hostId,
    });
  }

  private async emitOnDeviceDisconnected(deviceConnectionInfo: Instance<typeof DeviceConnectionSubscribe.receiveMessage>): Promise<void> {
    const { serial } = deviceConnectionInfo;
    this.logger.info('Event emitOnDeviceDisconnected fired', { serial });
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceDisconnectedEvent, {
      serial,
    });
  }
}
