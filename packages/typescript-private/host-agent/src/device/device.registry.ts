import { Serial } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceResolutionInfo } from '../types';
import { OnDeviceConnectionSubscriberDisconnectedEvent, OnDeviceDisconnectedEvent, OnDeviceResolvedEvent } from './device.events';

@Injectable()
export class DeviceRegistry {
  private readonly _devices = new Map<Serial, DeviceResolutionInfo>();
  get devices(): Map<Serial, DeviceResolutionInfo> {
    return this._devices;
  }

  @OnEvent(OnDeviceConnectionSubscriberDisconnectedEvent.key)
  onDeviceConnectionSubscriberDisconnected(value: Instance<typeof OnDeviceConnectionSubscriberDisconnectedEvent.value>): void {
    this._devices.clear();
  }

  @OnEvent(OnDeviceResolvedEvent.key)
  onDeviceResolved(value: Instance<typeof OnDeviceResolvedEvent.value>): void {
    const { serial } = value;
    if (this._devices.has(serial)) {
      throw new Error(`device ${serial} already exists`);
    }
    this._devices.set(serial, value);
  }

  @OnEvent(OnDeviceDisconnectedEvent.key)
  onDeviceDisconnected(value: Instance<typeof OnDeviceDisconnectedEvent.value>): void {
    const { serial } = value;
    if (!this._devices.has(serial)) {
      throw new Error(`device ${serial} not exists`);
    }
    this._devices.delete(serial);
  }

  get(serial: string): DeviceResolutionInfo | undefined {
    return this._devices.get(serial);
  }
}
