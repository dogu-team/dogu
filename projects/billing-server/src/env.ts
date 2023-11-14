import { DoguRunType, NodeEnvType } from '@dogu-private/types';
import { IsFilledString, TransformBooleanString } from '@dogu-tech/common';
import { loadEnvLazySync } from '@dogu-tech/env-tools';
import { IsBoolean, IsIn } from 'class-validator';
import { logger } from './module/logger/logger.instance';

export class Env {
  @IsIn(['UTC'])
  TZ!: string;

  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_BILLING_RUN_TYPE!: DoguRunType;

  @IsFilledString()
  DOGU_BILLING_DB_URL!: string;

  @IsBoolean()
  @TransformBooleanString()
  DOGU_BILLING_DB_SSL_CONNECTION!: boolean;

  @IsFilledString()
  DOGU_CONSOLE_DB_READ_URL!: string;

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
