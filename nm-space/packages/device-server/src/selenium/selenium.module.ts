import { Module } from '@nestjs/common';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { SeleniumService } from './selenium.service';

@Module({
  imports: [BrowserManagerModule],
  providers: [SeleniumService],
  exports: [SeleniumService],
})
export class SeleniumModule {}
