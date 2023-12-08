import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { LocalDeviceService } from './local-device.service';

@Module({
  imports: [ScanModule],
  providers: [LocalDeviceService],
  exports: [LocalDeviceService],
})
export class LocalDeviceModule {}
