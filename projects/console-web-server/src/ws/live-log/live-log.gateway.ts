import { DEVICE_JOB_LOG_LIVE_DELAY_COUNT, RoutineDeviceJobPropCamel, TestLogResponse } from '@dogu-private/console';
import { isCompleted, OrganizationId, PIPELINE_STATUS } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { InfluxDbLogService } from '../../module/influxdb/influxdb-log.service';
import { DoguLogger } from '../../module/logger/logger';
import { ValidationResult, WsCommonService } from '../common/ws-common.service';
import { DeviceJobLogQueryDto } from './live-log.dto';

@WebSocketGateway({ path: '/ws/live-log' })
export class LiveLogGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(InfluxDbLogService)
    private readonly influxDbLogService: InfluxDbLogService,
    private readonly logger: DoguLogger,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
  ) {}

  private async sendDeviceJobLogs(client: WebSocket, organizationId: OrganizationId, deviceJob: RoutineDeviceJob): Promise<ValidationResult> {
    let isRunning = true;
    let localStartTime: Date | null = null;
    let createdAt = deviceJob.createdAt.toISOString();
    const { routineDeviceJobId: deviceJobId } = deviceJob;
    let lastDeviceJobLogLineNumber = 0;
    let lastHostAgentLogLineNumber = 0;
    let lastUserProjectLogLineNumber = 0;

    if (!createdAt) {
      return { result: false, resultCode: 1003, message: `DeviceJob created_at is not recorded`, userId: null };
    }

    while (isRunning) {
      if (client.readyState === WebSocket.CLOSED) {
        return { result: false, resultCode: 1003, message: `WebSocket is closed`, userId: null };
      }

      const deviceJob = await this.dataSource
        .getRepository(RoutineDeviceJob)
        .createQueryBuilder('deviceJob')
        .where(`deviceJob.${RoutineDeviceJobPropCamel.routineDeviceJobId} = :deviceJobId`, { deviceJobId })
        .getOne();
      if (!deviceJob) {
        return { result: false, resultCode: 1003, message: `DeviceJob not found`, userId: null };
      }
      isRunning = deviceJob.status === PIPELINE_STATUS.WAITING || deviceJob.status === PIPELINE_STATUS.IN_PROGRESS ? true : false;

      if (localStartTime === null) {
        localStartTime = deviceJob.localInProgressAt;
        continue;
      }

      const currentTime = new Date();

      const testLogs = await this.influxDbLogService.readDeviceJobLogs(organizationId, deviceJobId, {
        type: 'timeRange',
        startTime: localStartTime,
        endTime: currentTime,
      });
      if (testLogs.deviceLogs.length === 0 && testLogs.hostAgentLogs.length === 0 && testLogs.userProjectLogs.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, DEVICE_JOB_LOG_LIVE_DELAY_COUNT * 1000));
        continue;
      }

      localStartTime = currentTime;

      // deviceJobLogs
      const numberedDeviceLogInfos = testLogs.deviceLogs.map((deviceLogInfo) => {
        deviceLogInfo.line += lastDeviceJobLogLineNumber;
        return deviceLogInfo;
      });
      if (numberedDeviceLogInfos.length > 0) {
        lastDeviceJobLogLineNumber = numberedDeviceLogInfos[testLogs.deviceLogs.length - 1].line;
      }

      // hostAgentLogs
      const numberedHostAgentLogInfos = testLogs.hostAgentLogs.map((hostAgentLogInfo) => {
        hostAgentLogInfo.line += lastHostAgentLogLineNumber;
        return hostAgentLogInfo;
      });
      if (numberedHostAgentLogInfos.length > 0) {
        lastHostAgentLogLineNumber = numberedHostAgentLogInfos[testLogs.hostAgentLogs.length - 1].line;
      }

      // userProjectLogs
      const numberedUserProjectLogInfos = testLogs.userProjectLogs.map((userProjectLogInfo) => {
        userProjectLogInfo.line += lastUserProjectLogLineNumber;
        return userProjectLogInfo;
      });
      if (numberedUserProjectLogInfos.length > 0) {
        lastUserProjectLogLineNumber = numberedUserProjectLogInfos[testLogs.userProjectLogs.length - 1].line;
      }

      const deviceJobLogs: TestLogResponse = {
        deviceLogs: numberedDeviceLogInfos,
        hostAgentLogs: numberedHostAgentLogInfos,
        userProjectLogs: numberedUserProjectLogInfos,
      };

      client.send(JSON.stringify(deviceJobLogs));
      await new Promise((resolve) => setTimeout(resolve, DEVICE_JOB_LOG_LIVE_DELAY_COUNT * 1000));
    }

    return { result: true, resultCode: 1000, message: `DeviceJob is completed`, userId: null };
  }

  async handleConnection(client: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    // validate url query
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    const organizationQuery = url.searchParams.get('organization');
    const projectQuery = url.searchParams.get('project');
    const pipelineQuery = url.searchParams.get('pipeline');
    const jobQuery = url.searchParams.get('job');
    const deviceJobQuery = url.searchParams.get('deviceJob');

    const deviceJobLogQueryDto = await transformAndValidate(DeviceJobLogQueryDto, {
      organizationId: organizationQuery,
      projectId: projectQuery,
      pipelineId: pipelineQuery,
      jobId: jobQuery,
      deviceJobId: deviceJobQuery,
    });
    const { projectId, pipelineId, jobId, deviceJobId, organizationId } = deviceJobLogQueryDto;

    const deviceJob = await this.dataSource.getRepository(RoutineDeviceJob).findOne({ where: { routineDeviceJobId: deviceJobId } });
    if (!deviceJob) {
      closeWebSocketWithTruncateReason(client, 1003, `DeviceJob is not found`);
      return;
    }

    if (isCompleted(deviceJob.status)) {
      closeWebSocketWithTruncateReason(client, 1003, `DeviceJob is already completed`);
      return;
    }

    const rv: ValidationResult = await this.wsCommonService.validateUserRole(incomingMessage, this.dataSource, this.logger, organizationId, projectId);
    if (rv.result === false) {
      closeWebSocketWithTruncateReason(client, rv.resultCode, rv.message);
      return;
    }

    this.wsCommonService.sendPing(client, 'LiveLogGateway');

    try {
      const rv = await this.sendDeviceJobLogs(client, organizationId, deviceJob);
      closeWebSocketWithTruncateReason(client, rv.resultCode, rv.message);
      return;
    } catch (e) {
      this.logger.error(`LiveLogGateway. sendDeviceJobLogs error. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, `LiveLogGateway. sendDeviceJobLogs error`);
      return;
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.logger.info(`LiveLogGateway Client disconnected. url: ${client.url}`);
    closeWebSocketWithTruncateReason(client, 1003, `LiveLogGateway. Client disconnected.`);
    return;
  }
}
