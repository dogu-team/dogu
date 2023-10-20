import { Serial } from '@dogu-private/types';
import { emitEventAsync, Instance } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeviceResolutionInfo, DeviceWebSocketMap } from '../types';
import { OnDeviceConnectionSubscriberDisconnectedEvent, OnDeviceDisconnectedEvent, OnDeviceRegisteredEvent, OnDeviceResolvedEvent } from './device.events';

export interface DeviceRegistryValue extends DeviceResolutionInfo {
  webSocketMap: DeviceWebSocketMap;
}

@Injectable()
export class DeviceRegistry {
  private readonly _devices = new Map<Serial, DeviceRegistryValue>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  get devices(): Map<Serial, DeviceRegistryValue> {
    return this._devices;
  }

  @OnEvent(OnDeviceConnectionSubscriberDisconnectedEvent.key)
  onDeviceConnectionSubscriberDisconnected(value: Instance<typeof OnDeviceConnectionSubscriberDisconnectedEvent.value>): void {
    this._devices.forEach((device) => {
      device.webSocketMap.unregisterAll();
    });
    this._devices.clear();
  }

  @OnEvent(OnDeviceResolvedEvent.key)
  async onDeviceResolved(value: Instance<typeof OnDeviceResolvedEvent.value>): Promise<void> {
    const { serial } = value;
    if (this._devices.has(serial)) {
      throw new Error(`device ${serial} already exists`);
    }

    const registryValue = { ...value, webSocketMap: new DeviceWebSocketMap(`device ${serial}`) };
    this._devices.set(serial, registryValue);
    await emitEventAsync(this.eventEmitter, OnDeviceRegisteredEvent, registryValue);
  }

  @OnEvent(OnDeviceDisconnectedEvent.key)
  async onDeviceDisconnected(value: Instance<typeof OnDeviceDisconnectedEvent.value>): Promise<void> {
    const { serial } = value;
    if (!this._devices.has(serial)) {
      throw new Error(`device ${serial} not exists`);
    }

    const registryValue = this._devices.get(serial);
    this._devices.delete(serial);

    if (!registryValue) {
      throw new Error(`device ${serial} value not exists`);
    }

    registryValue.webSocketMap.unregisterAll();
  }

  get(serial: string): DeviceRegistryValue | undefined {
    return this._devices.get(serial);
  }
}
