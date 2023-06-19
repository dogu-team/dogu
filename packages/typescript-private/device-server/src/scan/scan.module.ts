import { Module } from '@nestjs/common';
import { AppiumModule } from '../appium/appium.module';
import { GamiumModule } from '../gamium/gamium.module';
import { ScanService } from './scan.service';

@Module({
  imports: [AppiumModule, GamiumModule],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
