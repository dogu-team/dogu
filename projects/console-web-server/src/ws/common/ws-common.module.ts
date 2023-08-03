import { Module } from '@nestjs/common';
import { WsCommonService } from './ws-common.service';

@Module({
  imports: [],
  providers: [WsCommonService],
  exports: [WsCommonService],
})
export class WsCommonModule {}
