import { IsFilledString, LogLevel } from '@dogu-tech/common';
import { DeviceId, OrganizationId, StepContextEnv } from '@dogu-tech/types';
import { IsIn, IsNumberString, IsUUID } from 'class-validator';

export class ReportEnv implements Pick<StepContextEnv, 'DOGU_API_BASE_URL' | 'DOGU_ORGANIZATION_ID' | 'DOGU_DEVICE_ID' | 'DOGU_STEP_ID' | 'DOGU_LOG_LEVEL' | 'DOGU_HOST_TOKEN'> {
  /**
   * @requires process.env.DOGU_ORGANIZATION_ID
   * @default ''
   */
  @IsUUID()
  DOGU_ORGANIZATION_ID!: OrganizationId;

  /**
   * @requires process.env.DOGU_DEVICE_ID
   * @default ''
   * @description
   */
  @IsUUID()
  DOGU_DEVICE_ID!: DeviceId;

  /**
   * @requires process.env.DOGU_STEP_ID
   * @default ''
   */
  @IsNumberString()
  DOGU_STEP_ID!: string;

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
   * @requires process.env.DOGU_LOG_LEVEL
   * @default 'info'
   */
  @IsIn(LogLevel)
  DOGU_LOG_LEVEL!: LogLevel;
}
