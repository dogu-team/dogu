import { DevicePropCamel, OrganizationPropCamel } from '@dogu-private/console';
import {
  CreateDeviceRequestBody,
  PrivateDevice,
  PullDeviceParamDatasRequestBody,
  PushDeviceResultRequestBody,
  WebSocketProxyId,
  WebSocketProxyReceive,
  WriteDeviceRunTimeInfosRequestBody,
} from '@dogu-private/console-host-agent';
import { FindDeviceBySerialQuery, UpdateDeviceRequestBody } from '@dogu-private/console-host-agent/src/http-specs/private-device';
import { DeviceId, DEVICE_DISPLAY_ERROR_MAX_LENGTH, OrganizationId } from '@dogu-private/types';
import { Instance, transformAndValidate } from '@dogu-tech/common';
import { Body, ConflictException, Controller, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../../db/entity/device.entity';
import { findDeviceModelNameByModelId } from '../../utils/device';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { DeviceMessageQueue } from '../device-message/device-message.queue';
import { InfluxDbDeviceService } from '../influxdb/influxdb-device.service';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { IsDeviceExist } from '../organization/device/device.decorators';
import { IsOrganizationExist } from '../organization/organization.decorators';

@Controller(PrivateDevice.controller.path)
export class PrivateDeviceController {
  constructor(
    @InjectRepository(Device) private readonly deviceRepository: Repository<Device>,
    private readonly deviceMessageQueue: DeviceMessageQueue,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    private readonly logger: DoguLogger,
    private readonly deviceStatusService: DeviceStatusService,
  ) {}

  @Get(PrivateDevice.findDeviceBySerial.path)
  @HostPermission(HOST_ACTION_TYPE.CREATE_DEVICE_API)
  async findDeviceBySerial(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Query() query: FindDeviceBySerialQuery,
  ): Promise<Instance<typeof PrivateDevice.findDeviceBySerial.responseBody>> {
    const { serialUnique } = query;
    const device = await this.deviceRepository.findOne({ where: { serialUnique, organizationId } });
    if (device === null) {
      throw new NotFoundException({
        message: 'Device not found',
        organizationId,
        serialUnique,
      });
    }
    const { deviceId } = device;
    const response: Instance<typeof PrivateDevice.findDeviceBySerial.responseBody> = {
      deviceId,
    };
    const responseValidated = await transformAndValidate(PrivateDevice.findDeviceBySerial.responseBody, response);
    return responseValidated;
  }

  @Post(PrivateDevice.createDevice.path)
  @HostPermission(HOST_ACTION_TYPE.CREATE_DEVICE_API)
  async createDevice(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Body() body: CreateDeviceRequestBody,
  ): Promise<Instance<typeof PrivateDevice.createDevice.responseBody>> {
    const { serial, serialUnique, platform } = body;

    const exist = await this.deviceRepository.exist({ where: { serialUnique, organizationId } });
    if (exist) {
      throw new ConflictException({
        message: 'Device already exists',
        organizationId,
        serial,
        serialUnique,
      });
    }

    // find model name from id
    const modelName = findDeviceModelNameByModelId(body.model);

    const created = this.deviceRepository.create({ ...body, organizationId, name: serial, modelName: modelName ?? undefined });

    const rv = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(created);
      const { deviceId } = saved;
      const response: Instance<typeof PrivateDevice.createDevice.responseBody> = {
        deviceId,
      };
      const responseValidated = await transformAndValidate(PrivateDevice.createDevice.responseBody, response);
      return responseValidated;
    });

    return rv;
  }

  @Patch(PrivateDevice.updateDevice.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDevice(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceExist) deviceId: DeviceId,
    @Body() body: UpdateDeviceRequestBody,
  ): Promise<void> {
    const exist = await this.deviceRepository.exist({ where: { deviceId } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Device not found',
        organizationId,
        deviceId,
      });
    }
    const { serial, hostId, version, model, manufacturer, isVirtual, resolutionWidth, resolutionHeight, browserInstallations } = body;
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Device).update({ deviceId }, { serial, hostId, version, model, manufacturer, isVirtual, resolutionWidth, resolutionHeight });
      await DeviceStatusService.updateDeviceBrowserInstallations(manager, deviceId, browserInstallations);
      await DeviceStatusService.updateDeviceRunners(manager, deviceId);
    });
  }

  @Patch(PrivateDevice.updateDeviceHeartbeatNow.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDeviceHeartbeatNow(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
  ): Promise<void> {
    const exist = await this.deviceRepository.exist({ where: { deviceId } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Device not found',
        organizationId,
        deviceId,
      });
    }
    await this.deviceRepository.update({ deviceId }, { heartbeat: () => 'NOW()' });
  }

  @Post(PrivateDevice.pullDeviceParamDatas.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async pullDeviceParams(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceExist) deviceId: DeviceId,
    @Body() body: PullDeviceParamDatasRequestBody,
  ): Promise<Instance<typeof PrivateDevice.pullDeviceParamDatas.responseBody>> {
    const { count } = body;
    const datas = await this.deviceMessageQueue.popParamDatas(organizationId, deviceId, count);
    const response: Instance<typeof PrivateDevice.pullDeviceParamDatas.responseBody> = {
      datas,
    };
    return response;
  }

  @Post(PrivateDevice.pushDeviceResult.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async pushDeviceResult(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceExist) deviceId: DeviceId,
    @Param('resultId') resultId: string,
    @Body() body: any,
  ): Promise<void> {
    const validated = await transformAndValidate(PushDeviceResultRequestBody, body);
    const { result } = validated;
    await this.deviceMessageQueue.pushResult(organizationId, deviceId, resultId, result);
  }

  @Post(PrivateDevice.pushWebSocketProxyReceive.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async pushDeviceWebSocketReceive(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceExist) deviceId: DeviceId,
    @Param('WebSocketProxyId') WebSocketProxyId: WebSocketProxyId,
    @Body() body: WebSocketProxyReceive,
  ): Promise<void> {
    await this.deviceMessageQueue.pushWebSocketProxyReceive(organizationId, deviceId, WebSocketProxyId, body);
  }

  @Post(PrivateDevice.writeDeviceRunTimeInfos.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async writeDeviceRunTimeInfos(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() body: WriteDeviceRunTimeInfosRequestBody,
  ): Promise<void> {
    const { runtimeInfos } = body;
    if (runtimeInfos.length === 0) {
      return;
    }
    const lastInfo = runtimeInfos[runtimeInfos.length - 1];
    if (0 < lastInfo.displays.length) {
      const device = await this.deviceRepository.findOne({ where: { deviceId } });
      if (device) {
        const errorDisplay = lastInfo.displays.find((display) => display.error)?.error?.slice(0, DEVICE_DISPLAY_ERROR_MAX_LENGTH) ?? null;
        if (errorDisplay !== device.displayError) {
          await this.deviceRepository.update({ deviceId }, { displayError: errorDisplay });
        }
      }
    }
    await this.influxDbDeviceService.writeDeviceRunTimeInfos(organizationId, deviceId, runtimeInfos);
  }
}
