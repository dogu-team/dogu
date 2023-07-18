import { RoutinePipelineBase, RoutinePropCamel } from '@dogu-private/console';
import { RoutineV1 } from '@dogu-private/console-open-api';
import { ProjectId, RoutineId } from '@dogu-private/types';
import { Controller, Inject, Param, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PipelineService } from '../../../routine/pipeline/pipeline.service';

@Controller(RoutineV1.controller.path)
export class CloudDeviceController {
  constructor(
    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post(RoutineV1.createPipeline.path)
  async createPipeline(
    @Param(RoutinePropCamel.projectId) projectId: ProjectId, //
    @Param(RoutinePropCamel.routineId) routineId: RoutineId, //
  ): Promise<RoutinePipelineBase> {
    // await this.pipelineService.createPipelineByRoutineConfig();
    return {} as RoutinePipelineBase;
  }
}
