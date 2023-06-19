import { DevicePropCamel, RuntimeInfoResponse } from '@dogu-private/console';
import { DeviceId, DeviceRunTimeTag, DEVICE_RUNTIME_TYPE, influxDbKeyNames, OrganizationId, Platform } from '@dogu-private/types';
import { transformAndValidate } from '@dogu-tech/common';
import { GameRuntimeInfo } from '@dogu-tech/console-gamium';
import { RuntimeInfoBatteryDto, RuntimeInfoCpuDto, RuntimeInfoDto, RuntimeInfoFsDto, RuntimeInfoMemDto, RuntimeProcessInfoDto } from '@dogu-tech/device-client-common';
import { FluxTableMetaData, Point } from '@influxdata/influxdb-client';
import { Inject, Injectable } from '@nestjs/common';
import _ from 'lodash';
import { config } from '../../config';

import { FindDeviceRuntimeInfosDto, RuntimeInfoRaw } from './dto/influx.dto';
import { InfluxDbQuerier } from './influxdb.querier';
import { InfluxDbWriter } from './influxdb.writer';

@Injectable()
export class InfluxDbDeviceService {
  constructor(
    @Inject(InfluxDbQuerier)
    private readonly influxDbQuerier: InfluxDbQuerier, //
    @Inject(InfluxDbWriter)
    private readonly influxDbWriter: InfluxDbWriter,
  ) {}

  async writeDeviceRunTimeInfos(
    organizationId: OrganizationId, //
    deviceId: DeviceId,
    runtimeInfos: RuntimeInfoDto[],
  ): Promise<void> {
    // let timestamp = new Date().getTime();
    runtimeInfos.forEach((runtimeInfo) => {
      // timestamp = timestamp + 1;
      // cpu
      const cpuPoints = runtimeInfo.cpues.map((runtimeInfoCpu) => {
        return this.createCpuesPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoCpu, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          organizationId,
          deviceId,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
        });
      });
      this.influxDbWriter.client.writePoints(cpuPoints);
      // mem
      const memPoints = runtimeInfo.mems.map((runtimeInfoMem) => {
        return this.createMemsPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoMem, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          organizationId,
          deviceId,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
        });
      });
      this.influxDbWriter.client.writePoints(memPoints);

      // battery
      const batteryPoints = runtimeInfo.batteries.map((runtimeInfoBattery) => {
        return this.cretateBatteriesPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoBattery, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          organizationId,
          deviceId,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
        });
      });
      this.influxDbWriter.client.writePoints(batteryPoints);

      // fs
      const fsPoints = runtimeInfo.fses.map((runtimeInfoFs) => {
        return this.createFsesPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoFs, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          organizationId,
          deviceId,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
        });
      });
      this.influxDbWriter.client.writePoints(fsPoints);

      // runtime processes cpu
      const foregroundProcesses = runtimeInfo.processes.filter((item) => item.isForeground);
      const processesCpuPoints = foregroundProcesses.map((runtimeInfoProcess) => {
        return this.createProcessesCpuPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoProcess.cpues, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
          deviceId,
          organizationId,
          processName: runtimeInfoProcess.name,
          processId: runtimeInfoProcess.pid.toString(),
        });
      });
      this.influxDbWriter.client.writePoints(processesCpuPoints);

      const processesMemPoints = foregroundProcesses.map((runtimeInfoProcess) => {
        return this.createProcessesMemPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoProcess.mems, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
          deviceId,
          organizationId,
          processName: runtimeInfoProcess.name,
          processId: runtimeInfoProcess.pid.toString(),
        });
      });
      this.influxDbWriter.client.writePoints(processesMemPoints);

      const processesFsPoints = foregroundProcesses.map((runtimeInfoProcess) => {
        return this.createProcessesFsPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoProcess.fses, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
          deviceId,
          organizationId,
          processName: runtimeInfoProcess.name,
          processId: runtimeInfoProcess.pid.toString(),
        });
      });
      this.influxDbWriter.client.writePoints(processesFsPoints);

      const processNetPoints = foregroundProcesses.map((runtimeInfoProcess) => {
        return this.createProcessesNetPoint(runtimeInfo.localTimeStamp.getTime(), runtimeInfoProcess.nets, runtimeInfo.localTimeStamp, {
          platform: Platform[runtimeInfo.platform] as keyof typeof Platform,
          type: DEVICE_RUNTIME_TYPE.DEVICE,
          deviceId,
          organizationId,
          processName: runtimeInfoProcess.name,
          processId: runtimeInfoProcess.pid.toString(),
        });
      });
      this.influxDbWriter.client.writePoints(processNetPoints);
    });

    await this.influxDbWriter.client.flush();
    return;
  }

  async writeGameRunTimeInfos(
    organizationId: OrganizationId, //
    deviceId: DeviceId,
    gameRuntimeInfos: GameRuntimeInfo[],
  ): Promise<void> {
    // let timestamp = new Date().getTime();
    gameRuntimeInfos.forEach((gameRuntimeInfo) => {
      //fps
      // timestamp = timestamp + 1;
      const fpsPoint = this.createFpsPoint(gameRuntimeInfo.localTimeStamp.getTime(), gameRuntimeInfo.fps, gameRuntimeInfo.localTimeStamp, {
        platform: Platform[gameRuntimeInfo.platform] as keyof typeof Platform,
        organizationId,
        deviceId,
        type: DEVICE_RUNTIME_TYPE.GAME,
      });
      // fpsPoint.timestamp(gameRuntimeInfo.localTimeStamp);
      this.influxDbWriter.client.writePoint(fpsPoint);
    });
    await this.influxDbWriter.client.flush();
  }

  async readRuntimeInfos(
    organizationId: OrganizationId, //
    deviceId: DeviceId,
    dto: FindDeviceRuntimeInfosDto,
  ): Promise<RuntimeInfoResponse> {
    const baseQuery = `from(bucket: "${config.influxdb.bucket}")
    |> range(start: ${dto.startTime}, stop: ${dto.endTime})
    |> filter(fn: (r) => r["${DevicePropCamel.deviceId}"] == "${deviceId}")
    |> filter(fn: (r) => %MEASUREMENTS%)`;
    // |> filter(fn: (r) => r["${OrganizationPropCamel.organizationId}"] == "${organizationId}")

    const measureFilter = dto.measurements.map((measurement) => `r["_measurement"] == "${measurement}"`).join(' or ');
    const query = baseQuery.replace('%MEASUREMENTS%', measureFilter);

    const influxRowObs = await this.influxDbQuerier.client.collectRows(query, this.deserializeDeviceRuntimeInfo.bind(this));
    const runtimeInfoRaws = await Promise.all(influxRowObs);

    const deviceRuntimeInfos = this.parseDeviceRuntimeInfos(runtimeInfoRaws);
    const gameRuntimeInfos = this.parseGameRuntimeInfos(runtimeInfoRaws);
    const rv: RuntimeInfoResponse = {
      deviceRuntimeInfos,
      gameRuntimeInfos,
    };
    return rv;
  }

  private parseGameRuntimeInfos(runtimeInfoRaws: RuntimeInfoRaw[]): GameRuntimeInfo[] {
    // filter by game
    const gameRuntimeInfoRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw.type === DEVICE_RUNTIME_TYPE.GAME);

    // localTimeStamp
    const localTimeStamps = gameRuntimeInfoRaws //
      .filter((runtimeInfoRaw) => runtimeInfoRaw._field === influxDbKeyNames.common.field.localTimeStamp)
      .map((runtimeInfoRaw) => {
        if (typeof runtimeInfoRaw._value !== 'number') {
          throw new Error(`${influxDbKeyNames.common.field.localTimeStamp} is not a number`);
        }
        return runtimeInfoRaw._time;
      });
    const pointTimes = _.uniq(localTimeStamps);

    const pointInfoRaws = pointTimes.map((pointTime) => {
      const runtimePointInfos = gameRuntimeInfoRaws //
        .filter((runtimeInfoRaw) => runtimeInfoRaw._time === pointTime);
      return runtimePointInfos;
    });

    const runtimeInfos = pointInfoRaws.map((pointInfoRaw) => {
      const runtimeInfo: GameRuntimeInfo = {
        localTimeStamp: new Date(pointInfoRaw.find((pointInfoRaw) => pointInfoRaw._field === influxDbKeyNames.common.field.localTimeStamp)?._value as number),
        platform: Platform[pointInfoRaw[0].platform as keyof typeof Platform],
        fps: this.parseGameRuntimeInfoFps(pointInfoRaw),
      };

      return runtimeInfo;
    });

    // merge runtimeInfos same localTimeStamp
    const runtimeInfosGroupByLocalTimeStamp = _.groupBy(runtimeInfos, (runtimeInfo) => runtimeInfo.localTimeStamp);
    const rv = Object.values(runtimeInfosGroupByLocalTimeStamp).map((infos) => {
      return infos.reduce((acc, cur) => {
        return _.merge(acc, cur);
      }, {} as GameRuntimeInfo);
    });
    // sort by localTimeStamp
    rv.sort((a, b) => a.localTimeStamp.getTime() - b.localTimeStamp.getTime());
    return rv;
  }

  private parseGameRuntimeInfoFps(runtimeInfoRaws: RuntimeInfoRaw[]): number {
    const runtimeInfoFsRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.fps.name);
    const fps = runtimeInfoFsRaws.find((runtimeInfoFsRaw) => runtimeInfoFsRaw._field === influxDbKeyNames.measurement.fps.field.fps)?._value as number;
    return fps;
  }

  private async deserializeDeviceRuntimeInfo(values: string[], tableMeta: FluxTableMetaData): Promise<RuntimeInfoRaw> {
    const row = tableMeta.toObject(values);
    const runtimeInfoRaw = await transformAndValidate(RuntimeInfoRaw, row);
    return runtimeInfoRaw;
  }

  private parseDeviceRuntimeInfoFses(runtimeInfoRaws: RuntimeInfoRaw[]): RuntimeInfoFsDto[] {
    const runtimeInfoFsRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.fs.name);
    const fsInfoGroupByName = _.groupBy(runtimeInfoFsRaws, (runtimeInfoFsRaw) => runtimeInfoFsRaw.name);
    const fsInfoNames = Object.keys(fsInfoGroupByName);
    const runtimeInfoFses = fsInfoNames.map((fsInfoName) => {
      const fsInfoGroup = fsInfoGroupByName[fsInfoName];
      const runtimeInfoFs: RuntimeInfoFsDto = {
        name: fsInfoName,
        type: fsInfoGroup.find((fsInfo) => fsInfo._field === 'type')?._value as string,
        mount: fsInfoGroup.find((fsInfo) => fsInfo._field === 'mount')?._value as string,
        size: fsInfoGroup.find((fsInfo) => fsInfo._field === 'size')?._value as number,
        used: fsInfoGroup.find((fsInfo) => fsInfo._field === 'used')?._value as number,
        available: fsInfoGroup.find((fsInfo) => fsInfo._field === 'available')?._value as number,
        use: fsInfoGroup.find((fsInfo) => fsInfo._field === 'use')?._value as number,
        readsCompleted: fsInfoGroup.find((fsInfo) => fsInfo._field === 'readsCompleted')?._value as number,
        timeSpentReadMs: fsInfoGroup.find((fsInfo) => fsInfo._field === 'timeSpentReadMs')?._value as number,
        writesCompleted: fsInfoGroup.find((fsInfo) => fsInfo._field === 'writesCompleted')?._value as number,
        timeSpentWriteMs: fsInfoGroup.find((fsInfo) => fsInfo._field === 'timeSpentWriteMs')?._value as number,
      };
      return runtimeInfoFs;
    });
    return runtimeInfoFses;
  }

  private parseDeviceRuntimeInfoMems(runtimeInfoRaws: RuntimeInfoRaw[]): RuntimeInfoMemDto[] {
    const runtimeInfoMemRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.mem.name);
    const memInfoGroupByName = _.groupBy(runtimeInfoMemRaws, (runtimeInfoMemRaw) => runtimeInfoMemRaw.name);
    const memInfoNames = Object.keys(memInfoGroupByName);
    const runtimeInfoMems = memInfoNames.map((memInfoName) => {
      const memInfoGroup = memInfoGroupByName[memInfoName];
      const runtimeInfoMem: RuntimeInfoMemDto = {
        name: memInfoName,
        total: memInfoGroup.find((memInfo) => memInfo._field === 'total')?._value as number,
        free: memInfoGroup.find((memInfo) => memInfo._field === 'free')?._value as number,
        used: memInfoGroup.find((memInfo) => memInfo._field === 'used')?._value as number,
        active: memInfoGroup.find((memInfo) => memInfo._field === 'active')?._value as number,
        available: memInfoGroup.find((memInfo) => memInfo._field === 'available')?._value as number,
        swaptotal: memInfoGroup.find((memInfo) => memInfo._field === 'swaptotal')?._value as number,
        swapused: memInfoGroup.find((memInfo) => memInfo._field === 'swapused')?._value as number,
        swapfree: memInfoGroup.find((memInfo) => memInfo._field === 'swapfree')?._value as number,
        isLow: memInfoGroup.find((memInfo) => memInfo._field === 'isLow')?._value as boolean,
      };
      return runtimeInfoMem;
    });
    return runtimeInfoMems;
  }

  private parseDeviceRuntimeInfoCpu(runtimeInfoRaws: RuntimeInfoRaw[]): RuntimeInfoCpuDto[] {
    const runtimeInfoCpuRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.cpu.name);
    const cpuInfoGroupByName = _.groupBy(runtimeInfoCpuRaws, (runtimeInfoCpuRaw) => runtimeInfoCpuRaw.name);
    const cpuInfoNames = Object.keys(cpuInfoGroupByName);
    const runtimeInfoCpues = cpuInfoNames.map((cpuInfoName) => {
      const cpuInfoGroup = cpuInfoGroupByName[cpuInfoName];
      const runtimeInfoCpu: RuntimeInfoCpuDto = {
        name: cpuInfoName,
        currentLoad: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoad')?._value as number,
        currentLoadUser: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadUser')?._value as number,
        currentLoadSystem: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadSystem')?._value as number,
        currentLoadNice: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadNice')?._value as number,
        currentLoadIdle: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadIdle')?._value as number,
        currentLoadIrq: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadIrq')?._value as number,
        currentLoadCpu: cpuInfoGroup.find((cpuInfo) => cpuInfo._field === 'currentLoadCpu')?._value as number,
      };
      return runtimeInfoCpu;
    });
    return runtimeInfoCpues;
  }

  private parseDeviceRuntimeInfoProcesses(runtimeInfoRaws: RuntimeInfoRaw[]): RuntimeProcessInfoDto[] {
    const runtimeInfoProcessCpuRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.processCpu.name);
    const runtimeInfoProcessMemRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw._measurement === influxDbKeyNames.measurement.processMem.name);

    const processCpuInfoGroupByProcessName = _.groupBy(runtimeInfoProcessCpuRaws, (runtimeInfoProcessCpuRaw) => runtimeInfoProcessCpuRaw.processName);
    const processMemInfoGroupByProcessName = _.groupBy(runtimeInfoProcessMemRaws, (runtimeInfoProcessMemRaw) => runtimeInfoProcessMemRaw.processName);

    const processNames = Object.keys(processCpuInfoGroupByProcessName);

    const runtimeInfoProcesses: RuntimeProcessInfoDto[] = processNames.map((processName, i) => {
      const cpuGroup = processCpuInfoGroupByProcessName[processName];
      const memGroup = processMemInfoGroupByProcessName[processName];

      const info: RuntimeProcessInfoDto = {
        name: processName,
        isForeground: true,
        pid: Number(cpuGroup?.[0]?.processId),
        cpues: cpuGroup.map((cpuInfo) => ({
          name: '',
          percent: cpuGroup.find((cpuInfo) => cpuInfo._field === 'percent')?._value as number,
        })),
        mems: memGroup.map((memInfo) => ({
          name: '',
          percent: memGroup.find((memInfo) => memInfo._field === 'percent')?._value as number,
        })),
        fses: [],
        nets: [],
      };

      return info;
    });

    return runtimeInfoProcesses;
  }

  private parseDeviceRuntimeInfos(runtimeInfoRaws: RuntimeInfoRaw[]): RuntimeInfoDto[] {
    // filter by device
    const deviceRuntimeInfoRaws = runtimeInfoRaws.filter((runtimeInfoRaw) => runtimeInfoRaw.type === DEVICE_RUNTIME_TYPE.DEVICE);

    // localTimeStamp
    const localTimeStamps = deviceRuntimeInfoRaws //
      .filter((runtimeInfoRaw) => runtimeInfoRaw._field === influxDbKeyNames.common.field.localTimeStamp)
      .map((runtimeInfoRaw) => {
        if (typeof runtimeInfoRaw._value !== 'number') {
          throw new Error(`${influxDbKeyNames.common.field.localTimeStamp} is not a number`);
        }
        return runtimeInfoRaw._time;
      });
    const pointTimes = _.uniq(localTimeStamps);

    const pointInfoRaws = pointTimes.map((pointTime) => {
      const runtimePointInfos = deviceRuntimeInfoRaws //
        .filter((runtimeInfoRaw) => runtimeInfoRaw._time === pointTime);
      return runtimePointInfos;
    });

    const runtimeInfos = pointInfoRaws.map((pointInfoRaw) => {
      const runtimeInfo: RuntimeInfoDto = {
        localTimeStamp: new Date(pointInfoRaw.find((pointInfoRaw) => pointInfoRaw._field === influxDbKeyNames.common.field.localTimeStamp)?._value as number),
        platform: Platform[pointInfoRaw[0].platform as keyof typeof Platform],
        cpues: this.parseDeviceRuntimeInfoCpu(pointInfoRaw),
        mems: this.parseDeviceRuntimeInfoMems(pointInfoRaw),
        gpues: [],
        cpufreqs: [],
        fses: this.parseDeviceRuntimeInfoFses(pointInfoRaw),
        nets: [],
        displays: [],
        batteries: [],
        processes: this.parseDeviceRuntimeInfoProcesses(pointInfoRaw),
      };

      return runtimeInfo;
    });

    // merge runtimeInfos same localTimeStamp
    const runtimeInfosGroupByLocalTimeStamp = _.groupBy(runtimeInfos, (runtimeInfo) => runtimeInfo.localTimeStamp);
    const rv = Object.values(runtimeInfosGroupByLocalTimeStamp).map((infos) => {
      return infos.reduce((acc, cur) => {
        return _.merge(acc, cur);
      }, {} as RuntimeInfoDto);
    });

    // sort by localTimeStamp
    rv.sort((a, b) => a.localTimeStamp.getTime() - b.localTimeStamp.getTime());
    return rv;
  }

  private createDefaultPoint(timestamp: number, measurementKey: string, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = new Point(measurementKey);

    // tags
    for (const [key, value] of Object.entries(tags)) {
      point.tag(key, value);
    }

    point.intField(influxDbKeyNames.common.field.localTimeStamp, localTimeStamp.getTime()).timestamp(timestamp);
    return point;
  }

  private addField(point: Point, key: string, value: unknown): void {
    if (typeof value === 'number') {
      point.floatField(key, value);
    } else if (typeof value === 'string') {
      point.stringField(key, value);
    } else if (typeof value === 'boolean') {
      point.booleanField(key, value);
    }
  }

  private cretateBatteriesPoint(timestamp: number, runtimeInfoBattery: RuntimeInfoBatteryDto, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.battery.name, localTimeStamp, tags);

    for (const [key, value] of Object.entries(runtimeInfoBattery)) {
      if (value === undefined) continue;
      if (key === influxDbKeyNames.measurement.battery.tags.name) {
        point.tag(influxDbKeyNames.measurement.battery.tags.name, value);
      } else {
        this.addField(point, key, value);
      }
    }
    return point;
  }

  private createCpuesPoint(timestamp: number, runtimeInfoCpu: RuntimeInfoCpuDto, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.cpu.name, localTimeStamp, tags);

    for (const [key, value] of Object.entries(runtimeInfoCpu)) {
      if (value === undefined) continue;
      if (key === influxDbKeyNames.measurement.cpu.tags.name) {
        point.tag(influxDbKeyNames.measurement.cpu.tags.name, value);
      } else {
        this.addField(point, key, value);
      }
    }
    return point;
  }

  private createMemsPoint(timestamp: number, runtimeInfoMem: RuntimeInfoMemDto, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.mem.name, localTimeStamp, tags);

    for (const [key, value] of Object.entries(runtimeInfoMem)) {
      if (value === undefined) continue;
      if (key === influxDbKeyNames.measurement.mem.tags.name) {
        point.tag(influxDbKeyNames.measurement.mem.tags.name, value);
      } else {
        this.addField(point, key, value);
      }
    }
    return point;
  }

  private createFsesPoint(timestamp: number, runtimeInfoFs: RuntimeInfoFsDto, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.fs.name, localTimeStamp, tags);

    for (const [key, value] of Object.entries(runtimeInfoFs)) {
      if (value === undefined) continue;
      if (key === influxDbKeyNames.measurement.fs.tags.name) {
        point.tag(influxDbKeyNames.measurement.fs.tags.name, value);
      } else {
        this.addField(point, key, value);
      }
    }
    return point;
  }

  private createFpsPoint(timestamp: number, fps: number, localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.fps.name, localTimeStamp, tags);
    point.floatField(influxDbKeyNames.measurement.fps.field.fps, fps);
    return point;
  }

  private createProcessesCpuPoint(timestamp: number, runtimeInfoProcessCpues: RuntimeProcessInfoDto['cpues'], localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.processCpu.name, localTimeStamp, tags);

    for (const runtimeInfoProcessCpu of runtimeInfoProcessCpues) {
      for (const [key, value] of Object.entries(runtimeInfoProcessCpu)) {
        if (value === undefined) continue;
        if (key === 'name') {
          point.tag('name', '');
        } else {
          this.addField(point, key, value);
        }
      }
    }
    return point;
  }

  private createProcessesMemPoint(timestamp: number, runtimeInfoProcessMems: RuntimeProcessInfoDto['mems'], localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.processMem.name, localTimeStamp, tags);

    for (const runtimeInfoProcessMem of runtimeInfoProcessMems) {
      for (const [key, value] of Object.entries(runtimeInfoProcessMem)) {
        if (value === undefined) continue;
        if (key === 'name') {
          point.tag('name', '');
        } else {
          this.addField(point, key, value);
        }
      }
    }
    return point;
  }

  private createProcessesFsPoint(timestamp: number, runtimeInfoProcessFses: RuntimeProcessInfoDto['fses'], localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.processFs.name, localTimeStamp, tags);

    for (const runtimeInfoProcessFs of runtimeInfoProcessFses) {
      for (const [key, value] of Object.entries(runtimeInfoProcessFs)) {
        if (value === undefined) continue;
        if (key === 'name') {
          point.tag('name', '');
        } else {
          this.addField(point, key, value);
        }
      }
    }
    return point;
  }

  private createProcessesNetPoint(timestamp: number, runtimeInfoProcessNets: RuntimeProcessInfoDto['nets'], localTimeStamp: Date, tags: DeviceRunTimeTag): Point {
    const point = this.createDefaultPoint(timestamp, influxDbKeyNames.measurement.processNet.name, localTimeStamp, tags);

    for (const runtimeInfoProcessNet of runtimeInfoProcessNets) {
      for (const [key, value] of Object.entries(runtimeInfoProcessNet)) {
        if (value === undefined) continue;
        if (key === 'name') {
          point.tag('name', '');
        } else {
          this.addField(point, key, value);
        }
      }
    }
    return point;
  }
}
