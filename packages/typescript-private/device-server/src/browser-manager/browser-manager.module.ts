import { Module } from '@nestjs/common';
import { BrowserManagerService } from './browser-manager.service';

@Module({
  providers: [BrowserManagerService],
})
export class BrowserManagerModule {}
