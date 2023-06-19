import { DeviceId, OrganizationId, PIPELINE_STATUS, RoutineStepId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from 'class-validator';

export class RecordTime {
  @Max(838)
  @Min(0)
  @IsInt()
  @IsNumber()
  @IsNotEmpty()
  hour!: number;

  @Max(59)
  @Min(0)
  @IsInt()
  @IsNumber()
  @IsNotEmpty()
  minute!: number;

  @Max(59)
  @Min(0)
  @IsInt()
  @IsNumber()
  @IsNotEmpty()
  second!: number;
}

export class UpdateRecordStartTimeReqeustBody {
  @ValidateNested()
  @Type(() => RecordTime)
  @IsNotEmpty()
  recordStartTime!: RecordTime;
}

export class UpdateRecordEndTimeReqeustBody {
  @ValidateNested()
  @Type(() => RecordTime)
  @IsNotEmpty()
  recordEndTime!: RecordTime;
}

export class UpdateStepStatusRequestBody {
  @IsEnum(PIPELINE_STATUS)
  status!: PIPELINE_STATUS;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}

const PrivateStepController = new ControllerSpec({
  path: '/private/organizations/:organizationId/devices/:deviceId/steps',
});

export const PrivateStep = {
  controller: PrivateStepController,

  updateRecordStartTime: new ControllerMethodSpec({
    controllerSpec: PrivateStepController,
    method: 'PATCH',
    path: '/:stepId/record-start-time',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly stepId: RoutineStepId) {}
    },
    requestBody: UpdateRecordStartTimeReqeustBody,
  }),

  updateRecordEndTime: new ControllerMethodSpec({
    controllerSpec: PrivateStepController,
    method: 'PATCH',
    path: '/:stepId/record-end-time',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly stepId: RoutineStepId) {}
    },
    requestBody: UpdateRecordEndTimeReqeustBody,
  }),

  updateStepStatus: new ControllerMethodSpec({
    controllerSpec: PrivateStepController,
    method: 'PATCH',
    path: '/:stepId/status',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly stepId: RoutineStepId) {}
    },
    requestBody: UpdateStepStatusRequestBody,
  }),
};
