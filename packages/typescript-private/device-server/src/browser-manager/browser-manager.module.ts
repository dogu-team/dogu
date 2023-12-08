import { Module } from '@nestjs/common';
import { BrowserManagerService } from './browser-manager.service';

@Module({
  providers: [BrowserManagerService],
  exports: [BrowserManagerService],
})
export class BrowserManagerModule {}
