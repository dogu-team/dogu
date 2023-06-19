import { FindDeviceRuntimeInfosDtoBase } from '@dogu-private/console';
import { DeviceRunTimeTag, DEVICE_JOB_LOG_TYPE, DEVICE_RUNTIME_TYPE, influxdbRuntimeInfoMeasurements, Platform, RoutineDeviceJobId } from '@dogu-private/types';
import { LogLevel } from '@dogu-tech/common';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, Validate } from 'class-validator';

export class RuntimeInfoRaw implements DeviceRunTimeTag {
  @IsString()
  _measurement!: string;

  @IsString()
  _field!: string;

  @Validate((value: string | number | boolean) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }
    return false;
  })
  _value!: string | number | boolean;

  @IsDateString()
  _time!: string;

  @IsString()
  deviceId!: string;

  @IsString()
  platform!: keyof typeof Platform;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsEnum(DEVICE_RUNTIME_TYPE)
  type!: DEVICE_RUNTIME_TYPE;

  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  processName?: string;

  @IsOptional()
  @IsString()
  processId?: string;
}

export class DeviceJobLogInfoRaw {
  @IsString()
  _field!: string;

  @IsString()
  _value!: string;

  @IsDateString()
  _time!: string;

  @IsIn(LogLevel)
  level!: LogLevel;

  @IsEnum(DEVICE_JOB_LOG_TYPE)
  type!: DEVICE_JOB_LOG_TYPE;

  @IsNumberString()
  deviceJobId!: RoutineDeviceJobId;
}

export class FindDeviceRuntimeInfosDto implements FindDeviceRuntimeInfosDtoBase {
  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;

  @IsNotEmpty()
  @IsIn(influxdbRuntimeInfoMeasurements, { each: true })
  @Transform(({ value }: { value: string }) => {
    return value.trim().split(',');
  })
  measurements!: string[];
}
