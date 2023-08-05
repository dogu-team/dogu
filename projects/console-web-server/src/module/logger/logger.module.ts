import { Global, Module } from '@nestjs/common';
import { DoguLogger } from './logger';
import { DoguTimestampLogger } from './timestamp-logger';

@Global()
@Module({
  providers: [DoguLogger, DoguTimestampLogger],
  exports: [DoguLogger, DoguTimestampLogger],
})
export class LoggerModule {}
