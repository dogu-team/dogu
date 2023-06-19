import { DeviceId, DeviceJobLog, OrganizationId, PIPELINE_STATUS, RoutineDeviceJobId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class StepStatusInfo {
  @IsEnum(PIPELINE_STATUS)
  stepStatus!: PIPELINE_STATUS;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localStartedAt!: Date | null;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localCompletedAt!: Date | null;
}

export class DeviceJobStatusInfo {
  @IsEnum(PIPELINE_STATUS)
  deviceJobStatus!: PIPELINE_STATUS;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localStartedAt!: Date | null;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localCompletedAt!: Date | null;
}

export class UpdateDeviceJobLocalStartedAtRequestBody {
  @IsDate()
  @Type(() => Date)
  localStartedAt!: Date;
}

export class UploadDeviceJobRecordRequestBody {
  @IsNotEmpty()
  record!: Express.Multer.File;
}

export class UpdateDeviceJobStatusRequestBody {
  // @IsEnum(PIPELINE_STATUS)
  // deviceJobStatus!: PIPELINE_STATUS;

  @ValidateNested()
  @Type(() => DeviceJobStatusInfo)
  deviceJobStatusInfo!: DeviceJobStatusInfo;

  @ValidateNested({ each: true })
  @Type(() => StepStatusInfo)
  stepStatusInfos!: StepStatusInfo[];
}

export class WriteDeviceJobLogsRequestBody {
  @ValidateNested({ each: true })
  @Type(() => DeviceJobLog)
  @IsArray()
  logs!: DeviceJobLog[];
}

const PrivateDeviceJobController = new ControllerSpec({
  path: '/private/organizations/:organizationId/devices/:deviceId/device-jobs',
});

export const PrivateDeviceJob = {
  controller: PrivateDeviceJobController,

  writeDeviceJobLogs: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceJobController,
    method: 'POST',
    path: '/:deviceJobId/logs',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly deviceJobId: RoutineDeviceJobId) {}
    },
    requestBody: WriteDeviceJobLogsRequestBody,
  }),

  uploadDeviceJobRecord: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceJobController,
    method: 'POST',
    path: '/:deviceJobId/record',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly deviceJobId: RoutineDeviceJobId) {}
    },
    requestBody: UploadDeviceJobRecordRequestBody,
  }),

  updateDeviceJobStatus: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceJobController,
    method: 'PATCH',
    path: '/:deviceJobId/status',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly deviceJobId: RoutineDeviceJobId) {}
    },
    requestBody: UpdateDeviceJobStatusRequestBody,
  }),

  updateDeviceJobHeartbeatNow: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceJobController,
    method: 'PATCH',
    path: '/:deviceJobId/heartbeat/now',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly deviceJobId: RoutineDeviceJobId) {}
    },
  }),

  updateDeviceJobLocalStartedAt: new ControllerMethodSpec({
    controllerSpec: PrivateDeviceJobController,
    method: 'PATCH',
    path: '/:deviceJobId/local-started-at',
    pathProvider: class {
      constructor(readonly organizationId: OrganizationId, readonly deviceId: DeviceId, readonly deviceJobId: RoutineDeviceJobId) {}
    },
    requestBody: UpdateDeviceJobLocalStartedAtRequestBody,
  }),
};
