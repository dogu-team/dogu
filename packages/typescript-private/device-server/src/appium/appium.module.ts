import { Module } from '@nestjs/common';
import { AppiumService } from './appium.service';

@Module({
  providers: [AppiumService],
  exports: [AppiumService],
})
export class AppiumModule {}
