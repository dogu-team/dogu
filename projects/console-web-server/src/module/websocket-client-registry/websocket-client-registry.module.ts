import { Module } from '@nestjs/common';
import { WebSocketClientRegistryService } from './websocket-client-registry.service';

@Module({
  providers: [WebSocketClientRegistryService],
  exports: [WebSocketClientRegistryService],
})
export class WebSocketClientRegistryModule {}
