import { Global, Module } from '@nestjs/common';
import { DoguLogger } from './logger';

@Global()
@Module({
  providers: [DoguLogger],
  exports: [DoguLogger],
})
export class LoggerModule {}
