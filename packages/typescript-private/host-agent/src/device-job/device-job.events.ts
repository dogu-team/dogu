import { DeviceJobStatusInfo, StepStatusInfo } from '@dogu-private/console-host-agent';
import { BrowserName, DeviceId, DeviceJobLog, OrganizationId, Platform, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { createEventDefinition, IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsIn, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { DeviceJobRegistryKeySource } from '../device-job/device-job.types';

export class OnDeviceJobEventValueBase implements DeviceJobRegistryKeySource {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  deviceId!: DeviceId;

  @IsNumber()
  routineDeviceJobId!: RoutineDeviceJobId;
}

export class OnDeviceJobStartedEventValue extends OnDeviceJobEventValueBase {
  @IsIn([0, 1])
  record!: number;

  @IsFilledString()
  serial!: Serial;

  @IsEnum(Platform)
  platform!: Platform;

  @IsArray()
  stepStatusInfos!: StepStatusInfo[];

  @IsIn(BrowserName)
  @IsOptional()
  browserName?: BrowserName;

  @IsFilledString()
  recordDeviceRunnerPath!: string;
}
export const OnDeviceJobStartedEvent = createEventDefinition('OnDeviceJobStarted', OnDeviceJobStartedEventValue);

export class OnDeviceJobPrePocessStartedEventValue extends OnDeviceJobEventValueBase {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localStartedAt!: Date;
}
export const OnDeviceJobPrePocessStartedEvent = createEventDefinition('OnDeviceJobPrePocessStarted', OnDeviceJobPrePocessStartedEventValue);

export class OnDeviceJobCancelRequestedEventValue extends OnDeviceJobEventValueBase {
  @IsIn([0, 1])
  record!: number;
}
export const OnDeviceJobCancelRequestedEvent = createEventDefinition('OnDeviceJobCancelRequested', OnDeviceJobCancelRequestedEventValue);

export class OnDeviceJobCompletedEventValue extends OnDeviceJobEventValueBase {
  @IsIn([0, 1])
  record!: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localStartedAt!: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  localCompletedAt!: Date;
}
export const OnDeviceJobCompletedEvent = createEventDefinition('OnDeviceJobCompleted', OnDeviceJobCompletedEventValue);

export class OnDeviceJobPostProcessCompletedEventValue extends OnDeviceJobEventValueBase {
  @IsIn([0, 1])
  record!: number;

  @ValidateNested()
  @Type(() => DeviceJobStatusInfo)
  deviceJobStatusInfo!: DeviceJobStatusInfo;

  @IsArray()
  stepStatusInfos!: StepStatusInfo[];
}
export const OnDeviceJobPostProcessCompletedEvent = createEventDefinition('OnDeviceJobPostProcessCompleted', OnDeviceJobPostProcessCompletedEventValue);

export class OnDeviceJobLoggedEventValue extends OnDeviceJobEventValueBase {
  @ValidateNested()
  @Type(() => DeviceJobLog)
  log!: DeviceJobLog;
}
export const OnDeviceJobLoggedEvent = createEventDefinition('OnDeviceJobLogged', OnDeviceJobLoggedEventValue);
