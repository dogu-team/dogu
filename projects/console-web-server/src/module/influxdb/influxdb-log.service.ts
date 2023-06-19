import { DeviceJobLogInfo, TestLogResponse } from '@dogu-private/console';
import { WriteDeviceJobLogsRequestBody } from '@dogu-private/console-host-agent';
import { DeviceId, DEVICE_JOB_LOG_TYPE, influxDbKeyNames, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';
import { transformAndValidate } from '@dogu-tech/common';
import { FluxTableMetaData, Point, WriteApi } from '@influxdata/influxdb-client';
import { Injectable } from '@nestjs/common';
import { config } from '../../config';
import { DeviceJobLogInfoRaw } from './dto/influx.dto';
import { InfluxDbQuerier } from './influxdb.querier';
import { InfluxDbWriter } from './influxdb.writer';

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
      const { level, message, details, localTimeStamp, type } = log;
      const localTimeStampNumber = new Date(localTimeStamp).getTime();
      const point = new Point(influxDbKeyNames.measurement.deviceJobLog.name)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.organizationId, organizationId)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId, deviceJobId.toString())
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.deviceId, deviceId)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.type, type)
        .tag(influxDbKeyNames.measurement.deviceJobLog.tags.level, String(level))
        .intField(influxDbKeyNames.common.field.localTimeStamp, localTimeStampNumber)
        .stringField(influxDbKeyNames.measurement.deviceJobLog.fields.message, message)
        .timestamp(localTimeStampNumber);
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
    // deviceId: DeviceId,
    deviceJobId: RoutineDeviceJobId,
    startTime: string,
    endTime: string,
  ): Promise<TestLogResponse> {
    const query = `from(bucket: "${config.influxdb.bucket}")
  |> range(start: ${startTime}, stop: ${endTime})
  |> filter(fn: (r) => r["_measurement"] == "${influxDbKeyNames.measurement.deviceJobLog.name}")
  |> filter(fn: (r) => r["_field"] == "${influxDbKeyNames.measurement.deviceJobLog.fields.message}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.deviceJobId}"] == "${deviceJobId}")
  |> filter(fn: (r) => r["${influxDbKeyNames.measurement.deviceJobLog.tags.organizationId}"] == "${organizationId}")
  |> group(columns: ["_time"], mode:"by")`;
    // |> yield(name: "last")`;
    // |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
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
      localTimeStamp: deviceJobLogInfoRaw._time,
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
}
