import { OrganizationPropCamel } from '@dogu-private/console';
import { PrivateStep, UpdateStepStatusRequestBody } from '@dogu-private/console-host-agent';
import { OrganizationId, RoutineStepId } from '@dogu-private/types';
import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { UpdateStepStatusEvent, UpdateStepStatusQueue } from '../event/pipeline/update-pipeline-queue';
import { IsOrganizationExist } from '../organization/organization.decorators';

@Controller(PrivateStep.controller.path)
export class PrivateStepController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(UpdateStepStatusQueue)
    private readonly updateStepStatusQueue: UpdateStepStatusQueue,
  ) {}

  @Patch(PrivateStep.updateStepStatus.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  updateStepStatus(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param('stepId') stepId: RoutineStepId,
    @Body() body: UpdateStepStatusRequestBody,
  ): void {
    const updateEvent: UpdateStepStatusEvent = new UpdateStepStatusEvent(organizationId, stepId, body);
    this.updateStepStatusQueue.enqueue(updateEvent);
  }
}
