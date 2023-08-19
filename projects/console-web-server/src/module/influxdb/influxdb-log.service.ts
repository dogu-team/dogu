import { DeviceJobLogInfo, TestLogResponse } from '@dogu-private/console';
import { WriteDeviceJobLogsRequestBody } from '@dogu-private/console-host-agent';
import { DeviceId, DEVICE_JOB_LOG_TYPE, influxDbKeyNames, OrganizationId, RoutineDeviceJobId, RoutineStepId } from '@dogu-private/types';
import { addMilliseconds, transformAndValidate } from '@dogu-tech/common';
import { DateNano } from '@dogu-tech/node';
import { FluxTableMetaData, Point, WriteApi } from '@influxdata/influxdb-client';
import { Injectable } from '@nestjs/common';
import { config } from '../../config';
import { DeviceJobLogInfoRaw } from './dto/influx.dto';
import { InfluxDbQuerier } from './influxdb.querier';
import { InfluxDbWriter } from './influxdb.writer';

export interface ReadDeviceJobLogsByTimeRange {
  type: 'timeRange';
  startTime: Date;
  endTime: Date;
}

export interface ReadDeviceJobLogsByRoutineStepId {
  type: 'routineStepId';
  routineStepId: number;
}

export interface ReadDeviceJobLogsByRoutineDeviceJobId {
  type: 'routineDeviceJobId';
  routineDeviceJobId: number;
}

export type ReadDeviceJobLogsBy = ReadDeviceJobLogsByTimeRange | ReadDeviceJobLogsByRoutineStepId | ReadDeviceJobLogsByRoutineDeviceJobId;

@Injectable()
export class InfluxDbLogService {
  constructor(
    private readonly influxDbWriter: InfluxDbWriter, //
    private readonly influxDbQuerier: InfluxDbQuerier,
  ) {}

  private get client(): WriteApi {
    return this.influxDbWriter.client;
  }

  async writeDeviceJobLogs(organizationId: OrganizationId, deviceId: DeviceId, deviceJobId: RoutineDeviceJobId, dto: WriteDeviceJobLogsRequestBody): Promise<void> {
    const { logs } = dto;
    const points = logs.map((log) => {
      const { level, message, details, localTimeStampNano, type, routineStepId } = log;
      const nanoseconds = DateNano.parse(localTimeStampNano).toString();
      const point = new Point(influxDbKeyNames.measurement.deviceJobLog.name)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.organizationId, organizationId)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId, deviceJobId.toString())
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.deviceId, deviceId)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.type, type)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.level, String(level))
        .stringField(influxDbKeyNames.measurement.deviceJobLog.fields.message, message)
        .timestamp(nanoseconds);
      if (routineStepId !== undefined) {
        point.tag(influxDbKeyNames.measurement.deviceJobLog.tags.routineStepId, String(routineStepId));
      }
      if (details !== undefined) {
        point.stringField('details', JSON.stringify(details));
      }
      return point;
    });
    this.client.writePoints(points);
    try {
      await this.client.flush();
    } catch (e) {
      console.log(e);
    }
  }

  async readDeviceJobLogs(
    organizationId: OrganizationId, //
    deviceJobId: RoutineDeviceJobId,
    by: ReadDeviceJobLogsBy,
  ): Promise<TestLogResponse> {
    const query = this.createQueryBy(organizationId, deviceJobId, by);
    const influxRowObs = await this.influxDbQuerier.client.collectRows(query, this.deserializeDeviceJobLogInfo.bind(this));
    const deviceJobLogInfoRaws = await Promise.all(influxRowObs);

    const deviceLogs: DeviceJobLogInfo[] = [];
    let deviceLogLineNumber = 1;
    const hostAgentLogs: DeviceJobLogInfo[] = [];
    let hostAgentLogLineNumber = 1;
    const userProjectLogs: DeviceJobLogInfo[] = [];
    let userProjectLogLineNumber = 1;

    for (const raw of deviceJobLogInfoRaws) {
      const splitMessage = raw._value.split('\n');
      for (const message of splitMessage) {
        if (message === '') continue;
        switch (raw.type) {
          case DEVICE_JOB_LOG_TYPE.USER_PROJECT: {
            const deviceJobLog = this.makeDeviceJobLogInfo(raw, message, userProjectLogLineNumber);
            userProjectLogs.push(deviceJobLog);
            userProjectLogLineNumber++;
            break;
          }
          case DEVICE_JOB_LOG_TYPE.HOST_AGENT: {
            const deviceJobLog = this.makeDeviceJobLogInfo(raw, message, hostAgentLogLineNumber);
            hostAgentLogs.push(deviceJobLog);
            hostAgentLogLineNumber++;
            break;
          }
          case DEVICE_JOB_LOG_TYPE.DEVICE: {
            const deviceJobLog = this.makeDeviceJobLogInfo(raw, message, deviceLogLineNumber);
            deviceLogs.push(deviceJobLog);
            deviceLogLineNumber++;
            break;
          }
          default:
            const _exhaustiveCheck: never = raw.type;
            throw new Error(`Unsupported log type: ${raw.type}`);
        }
      }
    }

    const rv: TestLogResponse = {
      deviceLogs,
      hostAgentLogs,
      userProjectLogs,
    };

    return rv;
  }

  private makeDeviceJobLogInfo(deviceJobLogInfoRaw: DeviceJobLogInfoRaw, splitMessage: string, lineNumber: number): DeviceJobLogInfo {
    const deviceJobLogInfo: DeviceJobLogInfo = {
      line: lineNumber,
      message: splitMessage,
      localTimeStampNano: deviceJobLogInfoRaw._time,
      // deviceJobId: Number(deviceJobLogInfoRaw.deviceJobId),
      level: deviceJobLogInfoRaw.level,
      type: deviceJobLogInfoRaw.type,
    };
    return deviceJobLogInfo;
  }

  private async deserializeDeviceJobLogInfo(values: string[], tableMeta: FluxTableMetaData): Promise<DeviceJobLogInfoRaw> {
    const row = tableMeta.toObject(values);
    const deviceJobLogInfoRaw = await transformAndValidate(DeviceJobLogInfoRaw, row);
    return deviceJobLogInfoRaw;
  }

  private createQueryByTimeRange(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId, startTime: Date, endTime: Date): string {
    const startTimeIso = startTime.toISOString();
    const endTimeIso = addMilliseconds(endTime, 1).toISOString();

    const query = `from(bucket: "${config.influxdb.bucket}")
  |> range(start: ${startTimeIso}, stop: ${endTimeIso})
  |> filter(fn: (r) => r["_measurement"] == "${influxDbKeyNames.measurement.deviceJobLog.name}")
  |> filter(fn: (r) => r["_field"] == "${influxDbKeyNames.measurement.deviceJobLog.fields.message}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId}"] == "${deviceJobId}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.organizationId}"] == "${organizationId}")
  |> group(columns: ["_time"], mode:"by")`;
    return query;
  }

  private createQueryByRoutineStepId(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId, routineStepId: RoutineStepId): string {
    const query = `from(bucket: "${config.influxdb.bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r["_measurement"] == "${influxDbKeyNames.measurement.deviceJobLog.name}")
  |> filter(fn: (r) => r["_field"] == "${influxDbKeyNames.measurement.deviceJobLog.fields.message}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId}"] == "${deviceJobId}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.organizationId}"] == "${organizationId}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.routineStepId}"] == "${routineStepId}")
  |> group(columns: ["_time"], mode:"by")`;
    return query;
  }

  private createQueryByRoutineDeviceJobId(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId): string {
    const query = `from(bucket: "${config.influxdb.bucket}")
  |> range(start: 0)
  |> filter(fn: (r) => r["_measurement"] == "${influxDbKeyNames.measurement.deviceJobLog.name}")
  |> filter(fn: (r) => r["_field"] == "${influxDbKeyNames.measurement.deviceJobLog.fields.message}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId}"] == "${deviceJobId}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.organizationId}"] == "${organizationId}")
  |> group(columns: ["_time"], mode:"by")`;
    return query;
  }

  private createQueryBy(organizationId: OrganizationId, deviceJobId: RoutineDeviceJobId, by: ReadDeviceJobLogsBy): string {
    switch (by.type) {
      case 'timeRange':
        const { startTime, endTime } = by;
        return this.createQueryByTimeRange(organizationId, deviceJobId, startTime, endTime);
      case 'routineStepId':
        const { routineStepId } = by;
        return this.createQueryByRoutineStepId(organizationId, deviceJobId, routineStepId);
      case 'routineDeviceJobId':
        return this.createQueryByRoutineDeviceJobId(organizationId, deviceJobId);
      default:
        const _exhaustiveCheck: never = by;
        throw new Error(`Unsupported by type: ${by}`);
    }
  }
}
