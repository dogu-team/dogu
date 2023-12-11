import { Module } from '@nestjs/common';
import { NiceCaller } from './nice.caller';

@Module({
  providers: [NiceCaller],
  exports: [NiceCaller],
})
export class NiceModule {}
