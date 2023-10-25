import { V1FindPipelineByPipelineIdResponseBody, V1RoutinePipelineWsController } from '@dogu-private/console-open-api';
import { ProjectId, RoutinePipelineId, ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, stringify } from '@dogu-tech/common';
import { Inject, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { Project } from '../../../../../db/entity/project.entity';
import { FEATURE_CONFIG } from '../../../../../feature.config';
import { PROJECT_ROLE } from '../../../../../module/auth/auth.types';
import { ApiPermission } from '../../../../../module/auth/guard/common';
import { DoguLogger } from '../../../../../module/logger/logger';
import { V1OpenApiGuard } from '../../../auth/guard/open-api/v1/open-api.guard';
import { SelfHostedLicenseService } from '../../../license/self-hosted-license.service';
import { V1RoutineService } from './routine.service';

@WebSocketGateway({ path: V1RoutinePipelineWsController.path })
export class V1LivePipelineStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(V1RoutineService)
    private readonly v1RoutineService: V1RoutineService,
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
    private readonly logger: DoguLogger,
  ) {}

  private async sendPipelineState(client: WebSocket, routinePipelineId: RoutinePipelineId): Promise<void> {
    let isRunning = true;

    while (isRunning) {
      if (client.readyState === WebSocket.CLOSED) {
        return;
      }

      const curPipeline = await this.v1RoutineService.getRoutinePipeline(routinePipelineId);
      if (!curPipeline) {
        closeWebSocketWithTruncateReason(client, 1003, `Pipeline not found`);
        return;
      }

      client.send(JSON.stringify(curPipeline));

      isRunning = this.v1RoutineService.isCompleted(curPipeline.state) ? false : true;
      await new Promise((resolve) => setTimeout(resolve, ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT * 1000));
    }
    return;
  }

  async cancelPipeline(projectId: ProjectId, routinePipelineId: RoutinePipelineId) {
    let cancelCompleted = true;

    while (cancelCompleted) {
      const curPipeline = await this.v1RoutineService.getRoutinePipeline(routinePipelineId)!;
      cancelCompleted = this.v1RoutineService.isCompleted(curPipeline.state) ? false : true;

      this.v1RoutineService.cancelRoutinePipeline(projectId, routinePipelineId);

      await new Promise((resolve) => setTimeout(resolve, ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT * 1000));
    }

    this.logger.info(`cancelPipeline completed. projectId: ${projectId}, routinePipelineId: ${routinePipelineId}`);

    return;
  }

  @UseGuards(V1OpenApiGuard)
  async handleConnection(client: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    // validate url query
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    // const organizationQuery = url.searchParams.get('organization');
    const projectIdByRequest = url.searchParams.get('projectId');
    if (!projectIdByRequest) {
      closeWebSocketWithTruncateReason(client, 1003, `Project id is required`);
      return;
    }
    const routineIdByRequest = url.searchParams.get('routineId');
    if (!routineIdByRequest) {
      closeWebSocketWithTruncateReason(client, 1003, `Routine id is required`);
      return;
    }
    const authHeader = incomingMessage.headers.authorization;
    if (!authHeader) {
      closeWebSocketWithTruncateReason(client, 1003, `Authorization header is required`);
      return;
    }

    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const project = await this.dataSource.manager.getRepository(Project).findOne({ where: { projectId: projectIdByRequest } });
      const orgIdByProject = project?.organizationId ?? null;
      try {
        if (!orgIdByProject) {
          this.logger.error(`Unauthorized. No organizationId information.`);
          closeWebSocketWithTruncateReason(client, 1003, `No organizationId information.`);
          return;
        }
        const license = await this.selfHostedLicenseService.getLicenseInfo(orgIdByProject);
        if (!license.openApiEnabled) {
          this.logger.error(`Unauthorized. OpenApi is not enabled.`);
          closeWebSocketWithTruncateReason(client, 1003, `OpenApi is not enabled.`);
          return;
        }
      } catch (e) {
        this.logger.error(`Unauthorized. ${stringify(e)}`);
        closeWebSocketWithTruncateReason(client, 1003, `This License is not enabled.`);
        return;
      }
    }

    try {
      const tokenByRequest = authHeader.split(' ')[1];
      await ApiPermission.validateProjectApiPermission(this.dataSource.manager, tokenByRequest, PROJECT_ROLE.READ, '', projectIdByRequest);
    } catch (e) {
      this.logger.error(`Unauthorized. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, `${stringify(e)}`);
      return;
    }

    const routinePipelineId = Number(url.searchParams.get('pipelineId'));
    if (!routinePipelineId) {
      closeWebSocketWithTruncateReason(client, 1003, `Pipeline id is required`);
      return;
    }

    client.addEventListener('error', (event) => {
      this.logger.verbose('error');
    });

    client.addEventListener('close', async (event) => {
      const { code, reason } = event;
      this.logger.verbose('close', { code, reason });

      if (code === 1006) {
        const curPipeline = await this.v1RoutineService.getRoutinePipeline(routinePipelineId)!;
        client.send(JSON.stringify(curPipeline));

        if (!this.v1RoutineService.isCompleted(curPipeline.state)) {
          this.logger.info(`Client closed. this pipeline to be cancelled. projectId: ${projectIdByRequest}, routinePipelineId: ${routinePipelineId}`);
          await this.cancelPipeline(projectIdByRequest, routinePipelineId);
        }
      }
    });

    let lastPipeline: V1FindPipelineByPipelineIdResponseBody;
    try {
      lastPipeline = await this.v1RoutineService.getRoutinePipeline(routinePipelineId);
    } catch (e) {
      this.logger.error(`connection error. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, `Pipeline is not found`);
      return;
    }

    try {
      await this.sendPipelineState(client, routinePipelineId);
      closeWebSocketWithTruncateReason(client, 1000, `Pipeline is completed`);
      return;
    } catch (e) {
      this.logger.error(`handleConnection. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(client, 1003, e);
      return;
    }
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    this.logger.info(`disconnected. url: ${client.url}`);
  }
}
