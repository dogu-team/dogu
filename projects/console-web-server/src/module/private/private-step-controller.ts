import { DevicePropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { PrivateStep, UpdateStepStatusRequestBody } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId, RoutineStepId } from '@dogu-private/types';
import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { UpdateStepStatusEvent, UpdateStepStatusQueue } from '../event/pipeline/update-pipeline-queue';
import { IsDeviceExist } from '../organization/device/device.decorators';
import { IsOrganizationExist } from '../organization/organization.decorators';

@Controller(PrivateStep.controller.path)
export class PrivateStepController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(UpdateStepStatusQueue)
    private readonly updateStepStatusQueue: UpdateStepStatusQueue,
  ) {}

  // @Patch(PrivateStep.updateRecordStartTime.path)
  // @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  // async updateRecordStartTime(
  //   @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
  //   @Param('stepId', IsStepExist) stepId: RoutineStepId,
  //   @Body() body: UpdateRecordStartTimeReqeustBody,
  // ): Promise<void> {
  //   const exist = await this.dataSource.getRepository(RoutineStep).exist({ where: { routineStepId: stepId } });
  //   if (!exist) {
  //     throw new NotFoundException({
  //       message: 'Step not found',
  //       organizationId,
  //       stepId,
  //     });
  //   }

  //   const { hour, minute, second } = body.recordStartTime;
  //   const recordStartTime = makeRecordTime(hour, minute, second);

  //   await this.dataSource.getRepository(RoutineStep).update({ routineStepId: stepId }, { recordStartTime });
  // }

  // @Patch(PrivateStep.updateRecordEndTime.path)
  // @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  // async updateRecordEndTime(
  //   @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
  //   @Param('stepId', IsStepExist) stepId: RoutineStepId,
  //   @Body() body: UpdateRecordEndTimeReqeustBody,
  // ): Promise<void> {
  //   const exist = await this.dataSource.getRepository(RoutineStep).exist({ where: { routineStepId: stepId } });
  //   if (!exist) {
  //     throw new NotFoundException({
  //       message: 'Step not found',
  //       organizationId,
  //       stepId,
  //     });
  //   }

  //   const { hour, minute, second } = body.recordEndTime;
  //   const recordEndTime = makeRecordTime(hour, minute, second);

  //   await this.dataSource.getRepository(RoutineStep).update({ routineStepId: stepId }, { recordEndTime });
  // }

  @Patch(PrivateStep.updateStepStatus.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateStepStatus(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId, IsDeviceExist) deviceId: DeviceId,
    @Param('stepId') stepId: RoutineStepId,
    @Body() body: UpdateStepStatusRequestBody,
  ): Promise<void> {
    const updateEvent: UpdateStepStatusEvent = new UpdateStepStatusEvent(organizationId, deviceId, stepId, body);
    this.updateStepStatusQueue.enqueue(updateEvent);

    //   const step = await this.dataSource.getRepository(Step).findOne({ where: { stepId } });
    //   if (!step) {
    //     throw new NotFoundException({
    //       message: 'Step not found',
    //       organizationId,
    //       deviceId,
    //       stepId,
    //     });
    //   }
    //   await this.stepRunner.update(step, body.status, body.localTimeStamp);
  }
}
