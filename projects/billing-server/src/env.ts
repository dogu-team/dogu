import { DoguRunType, NodeEnvType } from '@dogu-private/types';
import { IsFilledString, TransformBooleanString } from '@dogu-tech/common';
import { loadEnvLazySync } from '@dogu-tech/env-tools';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber } from 'class-validator';
import { logger } from './module/logger/logger.instance';

export class Env {
  @IsIn(['UTC'])
  TZ!: string;

  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_BILLING_RUN_TYPE!: DoguRunType;

  @IsBoolean()
  @TransformBooleanString()
  DOGU_BILLING_RDS_SSL_CONNECTION!: boolean;

  @IsFilledString()
  DOGU_BILLING_RDS_HOST!: string;

  @IsNumber()
  @Type(() => Number)
  DOGU_BILLING_RDS_PORT!: number;

  @IsFilledString()
  DOGU_BILLING_RDS_USERNAME!: string;

  @IsFilledString()
  DOGU_BILLING_RDS_PASSWORD!: string;

  @IsFilledString()
  DOGU_BILLING_RDS_SCHEMA!: string;

  @IsFilledString()
  DOGU_BILLING_NICE_CLIENT_KEY!: string;

  @IsFilledString()
  DOGU_BILLING_NICE_SECRET_KEY!: string;

  @IsFilledString()
  DOGU_EMAIL_ID!: string;

  @IsFilledString()
  DOGU_EMAIL_PW!: string;
}

export const env = loadEnvLazySync(Env, { printable: logger });
