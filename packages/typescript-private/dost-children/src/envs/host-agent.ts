import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber } from 'class-validator';

export class PreloadHostAgentEnv {
  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsFilledString()
  DOGU_DEVICE_SERVER_HOST_PORT!: string;

  @IsNumber()
  @Type(() => Number)
  DOGU_HOST_AGENT_PORT!: number;
}

export class HostAgentEnv extends PreloadHostAgentEnv {
  @IsFilledString()
  DOGU_API_BASE_URL!: string;

  @IsFilledString()
  DOGU_HOST_TOKEN!: string;

  @IsFilledString()
  DOGU_AGENT_VERSION = '0.0.0';
}
