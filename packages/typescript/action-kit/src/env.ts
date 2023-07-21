import { IsFilledString, LogLevel, TransformBooleanString } from '@dogu-tech/common';
import { ActionContextEnv, DeviceId, OrganizationId, PlatformType, ProjectId, Serial, StepContextEnv } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsJSON, IsNumber, IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class ActionKitEnv
  implements
    Pick<
      StepContextEnv,
      | 'DOGU_API_BASE_URL'
      | 'DOGU_DEVICE_ID'
      | 'DOGU_DEVICE_PLATFORM'
      | 'DOGU_DEVICE_WORKSPACE_PATH'
      | 'DOGU_ROUTINE_WORKSPACE_PATH'
      | 'DOGU_DEVICE_SERIAL'
      | 'DOGU_DEVICE_SERVER_PORT'
      | 'DOGU_HOST_PLATFORM'
      | 'DOGU_HOST_WORKSPACE_PATH'
      | 'DOGU_LOG_LEVEL'
      | 'DOGU_ORGANIZATION_ID'
      | 'DOGU_ORGANIZATION_WORKSPACE_PATH'
      | 'DOGU_PROJECT_ID'
    >,
    Pick<ActionContextEnv, 'DOGU_ACTION_INPUTS'>
{
  /**
   * @requires process.env.DOGU_ACTION_INPUTS
   */
  @IsJSON()
  DOGU_ACTION_INPUTS!: string;

  /**
   * @requires process.env.DOGU_API_BASE_URL
   * @default ''
   */
  @IsFilledString()
  DOGU_API_BASE_URL!: string;

  /**
   * @requires process.env.DOGU_HOST_TOKEN
   * @default ''
   */
  @IsFilledString()
  DOGU_HOST_TOKEN!: string;

  /**
   * @requires process.env.DOGU_DEVICE_ID
   * @default ''
   */
  @IsUUID()
  DOGU_DEVICE_ID!: DeviceId;

  /**
   * @requires process.env.DOGU_DEVICE_PLATFORM
   * @default unspecified
   */
  @IsIn(PlatformType)
  DOGU_DEVICE_PLATFORM!: PlatformType;

  /**
   * @requires process.env.DOGU_DEVICE_SERIAL
   * @default ''
   */
  @IsFilledString()
  DOGU_DEVICE_SERIAL!: Serial;

  /**
   * @requires process.env.DOGU_DEVICE_SERVER_PORT
   * @default ''
   */
  @IsNumberString()
  DOGU_DEVICE_SERVER_PORT!: string;

  /**
   * @requires process.env.DOGU_DEVICE_WORKSPACE_PATH
   * @default ''
   */
  @IsFilledString()
  DOGU_DEVICE_WORKSPACE_PATH!: string;

  /**
   * @requires process.env.DOGU_ROUTINE_WORKSPACE_PATH
   * @default ''
   */
  @IsFilledString()
  DOGU_ROUTINE_WORKSPACE_PATH!: string;

  /**
   * @requires process.env.DOGU_HOST_PLATFORM
   * @default unspecified
   */
  @IsIn(PlatformType)
  DOGU_HOST_PLATFORM!: PlatformType;

  /**
   * @requires process.env.DOGU_HOST_WORKSPACE_PATH
   * @default ''
   */
  @IsFilledString()
  DOGU_HOST_WORKSPACE_PATH!: string;

  /**
   * @requires process.env.DOGU_LOG_LEVEL
   * @default info
   */
  @IsIn(LogLevel)
  DOGU_LOG_LEVEL!: LogLevel;

  /**
   * @requires process.env.DOGU_LOG_TO_FILE
   * @default false
   */
  @IsBoolean()
  @TransformBooleanString()
  @IsOptional()
  DOGU_LOG_TO_FILE?: boolean;

  /**
   * @requires process.env.DOGU_ORGANIZATION_ID
   * @default ''
   */
  @IsUUID()
  DOGU_ORGANIZATION_ID!: OrganizationId;

  /**
   * @requires process.env.DOGU_ORGANIZATION_WORKSPACE_PATH
   * @default ''
   */
  @IsFilledString()
  DOGU_ORGANIZATION_WORKSPACE_PATH!: string;

  /**
   * @requires process.env.DOGU_PROJECT_ID
   * @default ''
   */
  @IsUUID()
  DOGU_PROJECT_ID!: ProjectId;

  /**
   * @description This option used by any operation that uses request.
   * @requires process.env.DOGU_REQUEST_TIMEOUT
   * @default 60000
   * @unit milliseconds
   */
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  DOGU_REQUEST_TIMEOUT?: number;

  /**
   * @requires process.env.DOGU_RUN_TYPE
   * @default ''
   */
  @IsFilledString()
  DOGU_RUN_TYPE!: string;
}
