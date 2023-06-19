import { DEVICE_JOB_PROFILE_LIVE_DELAY_COUNT, RoutineDeviceJobPropCamel } from '@dogu-private/console';
import { influxdbRuntimeInfoMeasurements, isCompleted, OrganizationId, PIPELINE_STATUS } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { FindDeviceRuntimeInfosDto } from '../../module/influxdb/dto/influx.dto';
import { InfluxDbDeviceService } from '../../module/influxdb/influxdb-device.service';
import { DoguLogger } from '../../module/logger/logger';
import { ValidationResult, WsCommonService } from '../common/ws-common.service';
import { DeviceJobLogQueryDto } from '../live-log/live-log.dto';

@WebSocketGateway({ path: '/ws/live-profile' })
export class LiveProfileGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(DoguLogger)
    private readonly logger: DoguLogger,

    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
  ) {}

  private async sendDeviceJobProfile(client: WebSocket, organizationId: OrganizationId, deviceJob: RoutineDeviceJob): Promise<ValidationResult> {
    let isRunning = true;
    let localStartTime: Date | null = null;
    let createdAt = deviceJob.createdAt.toISOString();
    const { routineDeviceJobId: deviceJobId } = deviceJob;

    if (!createdAt) {
      return { result: false, resultCode: 1003, message: `DeviceJob createdAt is not recorded` };
    }

    while (isRunning) {
      if (client.readyState === WebSocket.CLOSED) {
        return { result: false, resultCode: 1003, message: `DeviceJob client is closed` };
      }

      const deviceJob = await this.dataSource
        .getRepository(RoutineDeviceJob)
        .createQueryBuilder('deviceJob')
        .where(`deviceJob.${RoutineDeviceJobPropCamel.routineDeviceJobId} = :deviceJobId`, { deviceJobId })
        .getOne();
      if (!deviceJob) {
        return { result: false, resultCode: 1003, message: `DeviceJob is not found` };
      }

      if (localStartTime === null) {
        localStartTime = deviceJob.localInProgressAt;
        continue;
      }
      const currentTime = new Date();

      isRunning = deviceJob.status === PIPELINE_STATUS.WAITING || deviceJob.status === PIPELINE_STATUS.IN_PROGRESS ? true : false;

      const dto: FindDeviceRuntimeInfosDto = {
        startTime: localStartTime.toISOString(),
        endTime: currentTime.toISOString(),
        measurements: influxdbRuntimeInfoMeasurements,
      };

      const runtimeInfo = await this.influxDbDeviceService.readRuntimeInfos(organizationId, deviceJob.deviceId, dto);

      localStartTime = currentTime;

      client.send(JSON.stringify(runtimeInfo));
      await new Promise((resolve) => setTimeout(resolve, DEVICE_JOB_PROFILE_LIVE_DELAY_COUNT * 1000));
    }
    return { result: true, resultCode: 1000, message: `DeviceJob is completed` };
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
      closeWebSocketWithTruncateReason(client, 1003, `LiveProfileGateway. DeviceJob is not found`);
      return;
    }

    if (isCompleted(deviceJob.status)) {
      closeWebSocketWithTruncateReason(client, 1003, `LiveProfileGateway. DeviceJob is already completed`);
      return;
    }

    const rv: ValidationResult = await this.wsCommonService.validateUserRole(incomingMessage, this.dataSource, this.logger, organizationId, projectId);
    if (rv.result === false) {
      this.logger.info(`LiveProfileGateway. handleConnection. ${rv.message}`);
      closeWebSocketWithTruncateReason(client, rv.resultCode, rv.message);
      return;
    }

    if (deviceJob.status !== PIPELINE_STATUS.IN_PROGRESS) {
      closeWebSocketWithTruncateReason(client, 1003, `LiveProfileGateway. Device job is not running`);
      return;
    }

    try {
      const rv = await this.sendDeviceJobProfile(client, organizationId, deviceJob);
      this.logger.info(`LiveProfileGateway. sendDeviceJobProfile. ${rv.message}`);
      closeWebSocketWithTruncateReason(client, rv.resultCode, rv.message);
    } catch (e) {
      this.logger.error(`LiveProfileGateway. sendDeviceJobProfile error. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, `LiveProfileGateway. sendDeviceJobProfile error. ${stringify(e)}`);
      return;
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.logger.info(`LiveProfileGateway Client disconnected. url: ${client.url}`);
    closeWebSocketWithTruncateReason(client, 1003, `LiveProfileGateway. Client disconnected.`);
    return;
  }
}
