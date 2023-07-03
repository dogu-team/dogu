import 'reflect-metadata';

import { DoguRunType, NodeEnvType } from '@dogu-private/env-tools';
import { IsFilledString } from '@dogu-tech/common';
import { IsIn } from 'class-validator';

export class E2eEnv {
  @IsIn(NodeEnvType)
  NODE_ENV!: NodeEnvType;

  @IsIn(DoguRunType)
  DOGU_RUN_TYPE!: DoguRunType;

  @IsFilledString()
  DOGU_CONSOLE_WEB_FRONT_URL!: string;

  @IsFilledString()
  DOGU_DEVICE_SERVER_PORT!: string;
}
