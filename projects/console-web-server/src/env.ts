import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString } from '@dogu-tech/common';
import { loadEnvLazySync } from '@dogu-tech/env-tools';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { logger } from './module/logger/logger.instance';

export class Env {
  @IsIn(['UTC'])
  TZ!: string;

  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsNumber()
  @Type(() => Number)
  DOGU_CONSOLE_WEB_SERVER_PORT!: number;

  @IsFilledString()
  DOGU_CONSOLE_DOMAIN!: string;

  @IsOptional()
  @IsString()
  DOGU_CONSOLE_GOOGLE_OAUTH_LOGIN_CLIENT_ID!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_CONSOLE_GOOGLE_OAUTH_LOGIN_CLIENT_SECRET!: string | undefined;

  @IsFilledString()
  DOGU_CONSOLE_URL!: string;

  @IsFilledString()
  DOGU_INFLUX_DB_HOST!: string;

  @IsNumber()
  @Type(() => Number)
  DOGU_INFLUX_DB_PORT!: number;

  @IsFilledString()
  DOGU_INFLUX_DB_TOKEN!: string;

  @IsFilledString()
  DOGU_INFLUX_DB_ORG!: string;

  @IsFilledString()
  DOGU_INFLUX_DB_BUCKET!: string;

  @IsFilledString()
  DOGU_RDS_HOST!: string;

  @IsNumber()
  @Type(() => Number)
  DOGU_RDS_PORT!: number;

  @IsFilledString()
  DOGU_RDS_USERNAME!: string;

  @IsFilledString()
  DOGU_RDS_PASSWORD!: string;

  @IsFilledString()
  DOGU_RDS_SCHEMA!: string;

  @IsFilledString()
  DOGU_TIMEZONE: string = process.env.TZ ?? 'local';

  @IsOptional()
  @IsString()
  DOGU_AWS_KEY_ID!: string | undefined;

  @IsFilledString()
  DOGU_SECRET!: string;

  @IsOptional()
  @IsString()
  DOGU_EMAIL_ID!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_EMAIL_PW!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_AWS_ACCESS_KEY!: string | undefined;

  @IsFilledString()
  DOGU_REDIS_HOST!: string;

  @IsOptional()
  @IsString()
  DOGU_RECAPTCHA_KEY!: string | undefined;

  @IsNumber()
  @Type(() => Number)
  DOGU_REDIS_PORT!: number;

  @IsOptional()
  @IsString()
  DOGU_REDIS_PASSWORD!: string | undefined;

  @IsNumber()
  @Type(() => Number)
  DOGU_REDIS_DB!: number;

  @IsIn([0, 1])
  @Type(() => Number)
  DOGU_USE_FILE_LOG!: number;

  @IsOptional()
  @IsString()
  DOGU_DOST_DOWNLOAD_BASE_URL!: string;

  @IsOptional()
  @IsString()
  DOGU_USER_BUCKET!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_ORGANIZATION_BUCKET!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_PUBLIC_BUCKET!: string | undefined;

  @IsOptional()
  @IsString()
  DOGU_GITLAB_ROOT_TOKEN!: string;

  @IsFilledString()
  DOGU_GITLAB_HOST!: string;

  @IsFilledString()
  DOGU_GITLAB_PORT!: string;

  @IsFilledString()
  DOGU_GITLAB_PROTOCOL!: string;

  @IsOptional()
  @IsString()
  DOGU_GITLAB_TEMPLATE_GROUP!: string | undefined;

  @IsFilledString()
  DOGU_WIFI_SSID!: string;

  @IsFilledString()
  DOGU_WIFI_PASSWORD!: string;

  @IsFilledString()
  DOGU_NEXUS_PROTOCOL!: string;

  @IsFilledString()
  DOGU_NEXUS_HOST!: string;

  @IsFilledString()
  DOGU_NEXUS_PORT!: string;

  @IsFilledString()
  DOGU_NEXUS_USERNAME!: string;

  @IsFilledString()
  DOGU_NEXUS_PASSWORD!: string;
}

export const env = loadEnvLazySync(Env, { printable: logger });
