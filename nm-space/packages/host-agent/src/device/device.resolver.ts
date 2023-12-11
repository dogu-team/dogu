import { PrivateDevice } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, isHostPlatform, OrganizationId, Platform, Serial } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, isFilteredAxiosError, transformAndValidate, validateAndEmitEventAsync } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import AsyncLock from 'async-lock';
import fs from 'fs';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { HostResolutionInfo } from '../types';
import { OnDeviceConnectedEvent, OnDeviceResolvedEvent } from './device.events';

@Injectable()
export class DeviceResolver {
  private hostResolutionInfo: HostResolutionInfo | null = null;
  private readonly creationMutex = new AsyncLock();

  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
  ) {}

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

    const { serial, serialUnique, model, platform, organizationId, isVirtual, memory } = value;
    const deviceId = await this.creationMutex.acquire(`${organizationId}:${serialUnique}`, async () => {
      let deviceId = await this.findDeviceId(organizationId, serialUnique);
      if (deviceId === null) {
        deviceId = await this.createDevice(organizationId, serial, serialUnique, model, platform, isVirtual, memory);
        this.logger.info('Device created', {
          serial,
          deviceId,
        });
      }
      return deviceId;
    });

    const { rootWorkspace, recordWorkspacePath, hostWorkspacePath, pathMap } = this.hostResolutionInfo;
    const hostPlatform = this.hostResolutionInfo.platform;
    const organizationWorkspacePath = HostPaths.organizationWorkspacePath(rootWorkspace, organizationId);
    const deviceWorkspacePath = HostPaths.deviceWorkspacePath(organizationWorkspacePath, deviceId);
    await fs.promises.mkdir(deviceWorkspacePath, { recursive: true });
    this.logger.info('Event OnDeviceResolvedEvent fired', { value });
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

  private async findDeviceId(organizationId: OrganizationId, serialUnique: Serial): Promise<DeviceId | null> {
    try {
      const pathProvider = new PrivateDevice.findDeviceBySerial.pathProvider(organizationId);
      const path = PrivateDevice.findDeviceBySerial.resolvePath(pathProvider);
      const queryInterface: Instance<typeof PrivateDevice.findDeviceBySerial.query> = {
        serialUnique,
      };
      const query = await transformAndValidate(PrivateDevice.findDeviceBySerial.query, queryInterface);
      const { data } = await this.consoleClientService.client
        .get<Instance<typeof PrivateDevice.findDeviceBySerial.responseBody>>(path, {
          params: query,
          ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
          timeout: DefaultHttpOptions.request.timeout,
        })
        .catch((error) => {
          this.logger.error('Failed to find device', {
            error: errorify(error),
          });
          throw error;
        });
      const response = await transformAndValidate(PrivateDevice.findDeviceBySerial.responseBody, data);
      return response.deviceId;
    } catch (error) {
      if (isFilteredAxiosError(error)) {
        if (error.responseStatus === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  private async createDevice(
    organizationId: OrganizationId,
    serial: Serial,
    serialUnique: Serial,
    model: string,
    platform: Platform,
    isVirtual: number,
    memory: string,
  ): Promise<DeviceId> {
    if (this.hostResolutionInfo === null) {
      throw new Error('Host connection info is not resolved');
    }
    const { hostId } = this.hostResolutionInfo;
    const isHost = isHostPlatform(platform) ? 1 : 0;
    const pathProvider = new PrivateDevice.createDevice.pathProvider(organizationId);
    const path = PrivateDevice.createDevice.resolvePath(pathProvider);
    const body: Instance<typeof PrivateDevice.createDevice.requestBody> = {
      serial,
      serialUnique,
      model,
      platform,
      isHost,
      hostId,
      isVirtual,
      memory,
    };
    const bodyValidated = await transformAndValidate(PrivateDevice.createDevice.requestBody, body);
    const { data } = await this.consoleClientService.client
      .post<Instance<typeof PrivateDevice.createDevice.responseBody>>(path, bodyValidated, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to create device', {
          serial,
          model,
          platform,
          isHost,
          hostId,
          error: errorify(error),
        });
        throw error;
      });
    const response = await transformAndValidate(PrivateDevice.createDevice.responseBody, data);
    const { deviceId } = response;
    return deviceId;
  }
}
