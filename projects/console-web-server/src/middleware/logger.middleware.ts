import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import { DoguLogger } from '../module/logger/logger';

interface LogInfo {
  TYPE: string;
  METHOD: string;
  URL: string;
  IP: string | undefined;
  HOST_NAME: string;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: DoguLogger) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  use(req: Request, res: Response, nextFunc: NextFunction) {
    const logInfo: LogInfo = {
      TYPE: 'Request',
      METHOD: req.method,
      URL: req.url,
      IP: req?.ip || req?.socket?.remoteAddress,
      HOST_NAME: req?.hostname,
    };
    if (config.middleware.logger.logging) {
      this.logger.info(`LoggerMiddleware: `, { logInfo });
    }
    nextFunc();
  }
}
