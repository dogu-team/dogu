import { isCompleted, RoutinePipelineId, ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, notEmpty, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { DoguLogger } from '../../module/logger/logger';
import { DestService } from '../../module/routine/pipeline/dest/dest.service';
import { PipelineService } from '../../module/routine/pipeline/pipeline.service';
import { ValidationResult, WsCommonService } from '../common/ws-common.service';
import { PipelineStatusQueryDto } from './live-pipeline-status.dto';

@WebSocketGateway({ path: '/ws/live-pipeline-status' })
export class LivePipelineStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    @Inject(DestService)
    private readonly destService: DestService,
    private readonly logger: DoguLogger,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
  ) {}

  private async sendPipelineStatus(client: WebSocket, lastPipeline: RoutinePipeline, pipelineId: RoutinePipelineId): Promise<void> {
    let isRunning = true;

    while (isRunning) {
      if (client.readyState === WebSocket.CLOSED) {
        return;
      }

      const curPipeline = await this.pipelineService.findPipelineAndSubDatasById(this.dataSource.manager, pipelineId);
      if (!curPipeline) {
        closeWebSocketWithTruncateReason(client, 1003, `Pipeline not found`);
        return;
      }
      const isEqual = this.pipelineService.deepComparePipelineStatus(lastPipeline, curPipeline);
      if (isEqual) {
        continue;
      }
      lastPipeline = _.cloneDeep(curPipeline);

      // response data parse
      const jobs = curPipeline.routineJobs ?? [];
      const deviceJobs = jobs.flatMap((job) => job.routineDeviceJobs).filter(notEmpty);
      const steps = deviceJobs.flatMap((deviceJob) => deviceJob.routineSteps).filter(notEmpty);
      for (const step of steps) {
        const dests = await this.destService.findDestsByStepId(step.routineStepId);
        step.dests = dests;
      }

      // lastPipeline = _.cloneDeep(curPipeline);
      client.send(JSON.stringify(curPipeline));

      isRunning = isCompleted(curPipeline.status) ? false : true;
      await new Promise((resolve) => setTimeout(resolve, ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT * 1000));
    }
    return;
  }

  async handleConnection(client: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    // validate url query
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    const organizationQuery = url.searchParams.get('organization');
    const projectQuery = url.searchParams.get('project');
    const pipelineQuery = url.searchParams.get('pipeline');

    const pipelineStatusQueryDto = await transformAndValidate(PipelineStatusQueryDto, {
      organizationId: organizationQuery,
      projectId: projectQuery,
      pipelineId: pipelineQuery,
    });

    const { projectId, organizationId } = pipelineStatusQueryDto;

    const rv: ValidationResult = await this.wsCommonService.validateUserRole(incomingMessage, this.dataSource, this.logger, organizationId, projectId);
    if (rv.result === false) {
      this.logger.info(`LivePipelineStatusGateway. handleConnection. ${rv.message}`);
      closeWebSocketWithTruncateReason(client, rv.resultCode, rv.message);
      return;
    }

    const pipelineId = Number(pipelineQuery);
    if (!pipelineId) {
      closeWebSocketWithTruncateReason(client, 1003, `Pipeline id is required`);
      return;
    }

    let lastPipeline: RoutinePipeline;
    try {
      lastPipeline = await this.pipelineService.findPipelineAndSubDatasById(this.dataSource.manager, pipelineId);
    } catch (e) {
      this.logger.error(`LivePipelineStatusGateway. handleConnection. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, `LivePipelineStatusGateway. Pipeline is not found`);
      return;
    }

    if (isCompleted(lastPipeline.status)) {
      closeWebSocketWithTruncateReason(client, 1003, `LivePipelineStatusGateway. Pipeline is already completed`);
      return;
    }

    try {
      client.send(JSON.stringify(lastPipeline));
      await this.sendPipelineStatus(client, lastPipeline, pipelineId);
      closeWebSocketWithTruncateReason(client, 1000, `LivePipelineStatusGateway. Pipeline is completed`);
      return;
    } catch (e) {
      this.logger.error(`LivePipelineStatusGateway. handleConnection. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, e);
      return;
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.logger.info(`[Live pipeline status] Client disconnected. url: ${client.url}`);
    closeWebSocketWithTruncateReason(client, 1003, `LivePipelineStatusGateway. Client disconnected`);
  }
}
