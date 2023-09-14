import { DeviceId, OrganizationId, PIPELINE_STATUS, RoutineDeviceJobId, RoutineStepId } from '@dogu-private/types';
import { createEventDefinition } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';
import { MessageCanceler, MessagePostProcessor } from '../message/message.types';
import { StepRegistryKeySource } from '../step/step.types';

export class OnStepEventValueBase implements StepRegistryKeySource {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  deviceId!: DeviceId;

  @IsNumber()
  routineDeviceJobId!: RoutineDeviceJobId;

  @IsNumber()
  routineStepId!: RoutineStepId;
}

export class OnStepStartedEventValue extends OnStepEventValueBase {
  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}
export const OnStepStartedEvent = createEventDefinition('OnStepStarted', OnStepStartedEventValue);

export class OnStepProcessStartedEventValue extends OnStepEventValueBase {
  @IsNumber()
  stepIndex!: number;

  @IsOptional()
  @IsNumber()
  pid?: number;
}
export const OnStepProcessStartedEvent = createEventDefinition('OnStepProcessStarted', OnStepProcessStartedEventValue);

export class OnStepInProgressEventValue extends OnStepEventValueBase {
  @IsObject()
  messageCanceler!: MessageCanceler;

  @IsObject()
  messagePostProcessor!: MessagePostProcessor;

  @IsNumber()
  stepIndex!: number;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}
export const OnStepInProgressEvent = createEventDefinition('OnStepInProgress', OnStepInProgressEventValue);

export class OnStepCompletedEventValue extends OnStepEventValueBase {
  @IsNumber()
  stepIndex!: number;

  @IsEnum(PIPELINE_STATUS)
  stepStatus!: PIPELINE_STATUS;

  @IsOptional()
  error?: unknown;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}
export const OnStepCompletedEvent = createEventDefinition('OnStepCompleted', OnStepCompletedEventValue);
