import { PrivateDevice } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, isHostPlatform, OrganizationId, Platform, Serial } from '@dogu-private/types';
import { DefaultHttpOptions, Instance, parseAxiosError, stringify, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import fs from 'fs';
import { lastValueFrom } from 'rxjs';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { HostResolutionInfo } from '../types';
import { OnDeviceConnectedEvent, OnDeviceResolvedEvent } from './device.events';

@Injectable()
export class DeviceResolver {
  private hostResolutionInfo: HostResolutionInfo | null = null;

  constructor(private readonly consoleClientService: ConsoleClientService, private readonly eventEmitter: EventEmitter2, private readonly logger: DoguLogger) {}

  @OnEvent(OnHostResolvedEvent.key)
  onHostResolved(value: Instance<typeof OnHostResolvedEvent.value>): void {
    this.hostResolutionInfo = value;
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.hostResolutionInfo = null;
  }

  @OnEvent(OnDeviceConnectedEvent.key)
  async onDeviceConnected(value: Instance<typeof OnDeviceConnectedEvent.value>): Promise<void> {
    if (this.hostResolutionInfo === null) {
      throw new Error('Host resolution info is not resolved');
    }

    const { serial, model, platform, organizationId } = value;
    let deviceId = await this.findDeviceId(organizationId, serial);
    if (deviceId === null) {
      deviceId = await this.createDevice(organizationId, serial, model, platform);
      this.logger.info('Device created', {
        serial,
        deviceId,
      });
    }

    const { rootWorkspace, recordWorkspacePath, hostWorkspacePath, pathMap } = this.hostResolutionInfo;
    const hostPlatform = this.hostResolutionInfo.platform;
    const organizationWorkspacePath = HostPaths.organizationWorkspacePath(rootWorkspace, organizationId);
    const deviceWorkspacePath = HostPaths.deviceWorkspacePath(organizationWorkspacePath, deviceId);
    await fs.promises.mkdir(deviceWorkspacePath, { recursive: true });
    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceResolvedEvent, {
      ...value,
      deviceId,
      hostPlatform,
      deviceWorkspacePath,
      recordWorkspacePath,
      rootWorkspacePath: rootWorkspace,
      hostWorkspacePath,
      pathMap,
    });
  }

  private async findDeviceId(organizationId: OrganizationId, serial: Serial): Promise<DeviceId | null> {
    try {
      const pathProvider = new PrivateDevice.findDeviceBySerial.pathProvider(organizationId);
      const path = PrivateDevice.findDeviceBySerial.resolvePath(pathProvider);
      const queryInterface: Instance<typeof PrivateDevice.findDeviceBySerial.query> = {
        serial,
      };
      const query = await transformAndValidate(PrivateDevice.findDeviceBySerial.query, queryInterface);
      const { data } = await lastValueFrom(
        this.consoleClientService.service.get<Instance<typeof PrivateDevice.findDeviceBySerial.responseBody>>(path, {
          params: query,
          ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
          timeout: DefaultHttpOptions.request.timeout,
        }),
      ).catch((error) => {
        this.logger.error('Failed to find device', {
          error: stringify(parseAxiosError(error)),
        });
        throw error;
      });
      const response = await transformAndValidate(PrivateDevice.findDeviceBySerial.responseBody, data);
      return response.deviceId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response === undefined) {
          throw error;
        }
        if (error.response.status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  private async createDevice(organizationId: OrganizationId, serial: Serial, model: string, platform: Platform): Promise<DeviceId> {
    if (this.hostResolutionInfo === null) {
      throw new Error('Host connection info is not resolved');
    }
    const { hostId } = this.hostResolutionInfo;
    const isHost = isHostPlatform(platform) ? 1 : 0;
    const pathProvider = new PrivateDevice.createDevice.pathProvider(organizationId);
    const path = PrivateDevice.createDevice.resolvePath(pathProvider);
    const body: Instance<typeof PrivateDevice.createDevice.requestBody> = {
      serial,
      model,
      platform,
      isHost,
      hostId,
    };
    const bodyValidated = await transformAndValidate(PrivateDevice.createDevice.requestBody, body);
    const { data } = await lastValueFrom(
      this.consoleClientService.service.post<Instance<typeof PrivateDevice.createDevice.responseBody>>(path, bodyValidated, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      }),
    ).catch((error) => {
      this.logger.error('Failed to create device', {
        serial,
        model,
        platform,
        isHost,
        hostId,
        error: parseAxiosError(error),
      });
      throw error;
    });
    const response = await transformAndValidate(PrivateDevice.createDevice.responseBody, data);
    const { deviceId } = response;
    return deviceId;
  }
}
